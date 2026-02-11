/**
 * CreateSession.tsx — Página para crear sesión manual
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión manualmente
 * - Permite configurar todos los detalles de la sesión
 * - Soporta dos flujos:
 *   1. Desde cliente: ?clientId=X (legacy, mantiene compatibilidad)
 *   2. Desde plan: ?planId=X (nuevo modelo, Fase 4)
 *
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.0.0 - Soporte para training_plan_id (Fase 4)
 * @updated v6.1.0 - Implementado guardado de ejercicios directamente en sesión
 * @updated v6.2.2 - Corregido error 422: Selección automática de plan si solo hay uno activo.
 * @updated v6.2.3 - TICK-S06: Sugerencias de ejercicios por tipo (exercise-selection/suggestions).
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useGetClientQuery, useGetClientTrainingPlansQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { 
    useCreateTrainingSessionMutation,
    useCreateSessionExerciseMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useGetExercisesQuery, type Exercise } from "@nexia/shared/hooks/exercises";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import { ExerciseSuggestionsPanel } from "@/components/sessions/ExerciseSuggestionsPanel";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import type { RootState } from "@nexia/shared/store";
import type {
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";
import type { 
    TrainingSessionCreate,
    SessionExerciseCreate,
} from "@nexia/shared/types/trainingSessions";
import type { LocationStateReturnTo } from "@nexia/shared";

const SESSION_TYPES = [
    { value: "training", label: "Entrenamiento" },
    { value: "cardio", label: "Cardio" },
    { value: "strength", label: "Fuerza" },
    { value: "endurance", label: "Resistencia" },
    { value: "flexibility", label: "Flexibilidad" },
    { value: "recovery", label: "Recuperación" },
];

export const CreateSession: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { showSuccess, showError } = useToast();

    // Obtener parámetros de query (soporta ambos flujos)
    const clientIdFromQuery = searchParams.get("clientId");
    const planIdFromQuery = searchParams.get("planId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : null;
    const planId = planIdFromQuery ? Number(planIdFromQuery) : null;

    // Obtener perfil del trainer
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id ?? 0;

    // Obtener datos según el flujo
    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId || 0, { skip: !clientId });
    const { data: plan, isLoading: isLoadingPlan } = useGetTrainingPlanQuery(planId || 0, { skip: !planId });

    // Si no viene planId pero sí clientId, buscar planes activos del cliente
    const { data: clientPlans, isLoading: isLoadingPlans } = useGetClientTrainingPlansQuery(
        { clientId: clientId || 0, skip: 0, limit: 100 },
        { skip: !!planId || !clientId }
    );

    // Estado para el plan seleccionado (si se elige manualmente o se autoselecciona)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(planId);

    // Autoseleccionar plan si solo hay uno activo
    useEffect(() => {
        if (!planId && clientPlans && clientPlans.length > 0) {
            const activePlans = clientPlans.filter((p) => p.status === "active");
            if (activePlans.length === 1) {
                setSelectedPlanId(activePlans[0].id);
            } else if (activePlans.length === 0 && clientPlans.length === 1) {
                setSelectedPlanId(clientPlans[0].id);
            }
        }
    }, [clientPlans, planId]);

    // Si viene planId, obtener clientId del plan y cargar el cliente del plan
    const effectiveClientId = planId && plan ? plan.client_id : clientId;
    const { data: planClient } = useGetClientQuery(effectiveClientId || 0, { 
        skip: !effectiveClientId || (!!clientId && !planId) 
    });

    // Cliente a mostrar (prioridad: cliente directo > cliente del plan)
    const displayClient = client || planClient;

    // Hook de mutación para crear sesión
    const [createTrainingSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();
    
    // Hook de mutación para crear ejercicios de sesión
    const [createSessionExercise, { isLoading: isSavingExercises }] = useCreateSessionExerciseMutation();

    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionType: "training",
        plannedDuration: "",
        plannedIntensity: "",
        plannedVolume: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<CreateSessionFormErrors>({});

    // Estado de ejercicios
    interface ExerciseFormData {
        exercise_id: number;
        exercise_name: string;
        order_in_block: number;
        planned_sets: number;
        planned_reps: string;
        planned_weight: number | null;
        planned_rest: number | null;
        notes: string | null;
    }

    const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
    const [showExerciseForm, setShowExerciseForm] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState("");

    const [currentExercise, setCurrentExercise] = useState<Partial<ExerciseFormData>>({
        planned_sets: 3,
        planned_reps: "10",
        planned_weight: null,
        planned_rest: 60,
        notes: null,
    });

    // Query de ejercicios con búsqueda
    const { data: exercisesData } = useGetExercisesQuery({
        search: exerciseSearch,
        limit: 20,
        skip: 0,
    });

    const availableExercises = useMemo(() => {
        return exercisesData?.exercises || [];
    }, [exercisesData]);

    // Validar que haya al menos clientId o planId
    useEffect(() => {
        if (!clientId && !planId) {
            showError("Debes proporcionar un cliente o un plan de entrenamiento");
            navigate("/dashboard");
        }
    }, [clientId, planId, navigate, showError]);

    // Handler para añadir ejercicio a la lista
    const handleAddExercise = () => {
        if (!currentExercise.exercise_id) {
            showError("Selecciona un ejercicio");
            return;
        }
        if (!currentExercise.planned_sets || currentExercise.planned_sets <= 0) {
            showError("Las series deben ser mayor a 0");
            return;
        }
        if (!currentExercise.planned_reps || currentExercise.planned_reps.trim() === "") {
            showError("Las repeticiones son obligatorias");
            return;
        }

        const selectedExercise = availableExercises.find(
            (ex: Exercise) => ex.id === currentExercise.exercise_id
        );

        if (!selectedExercise) {
            showError("Ejercicio no encontrado");
            return;
        }

        const newExercise: ExerciseFormData = {
            exercise_id: currentExercise.exercise_id,
            exercise_name: selectedExercise.nombre,
            order_in_block: exercises.length + 1,
            planned_sets: currentExercise.planned_sets,
            planned_reps: currentExercise.planned_reps,
            planned_weight: currentExercise.planned_weight || null,
            planned_rest: currentExercise.planned_rest || null,
            notes: currentExercise.notes || null,
        };

        setExercises([...exercises, newExercise]);
        setCurrentExercise({
            planned_sets: 3,
            planned_reps: "10",
            planned_weight: null,
            planned_rest: 60,
            notes: null,
        });
        setShowExerciseForm(false);
        setExerciseSearch("");
    };

    // Handler para eliminar ejercicio de la lista
    const handleRemoveExercise = (index: number) => {
        const updatedExercises = exercises
            .filter((_, i) => i !== index)
            .map((ex, i) => ({
                ...ex,
                order_in_block: i + 1,
            }));
        setExercises(updatedExercises);
    };

    // Handler para búsqueda de ejercicios
    const handleExerciseSearch = (value: string) => {
        setExerciseSearch(value);
    };

    // Handler para agregar ejercicio desde sugerencias (TICK-S06)
    const handleAddFromSuggestion = (exerciseId: number, exerciseName: string) => {
        const newExercise: ExerciseFormData = {
            exercise_id: exerciseId,
            exercise_name: exerciseName,
            order_in_block: exercises.length + 1,
            planned_sets: 3,
            planned_reps: "10",
            planned_weight: null,
            planned_rest: 60,
            notes: null,
        };
        setExercises([...exercises, newExercise]);
        showSuccess(`${exerciseName} agregado con 3×10`, 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};
        if (!formData.sessionName.trim()) {
            errors.sessionName = "El nombre de la sesión es obligatorio";
        }
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
        }
        if (!formData.sessionType) {
            errors.sessionType = "El tipo de sesión es obligatorio";
        }
        
        // El backend requiere training_plan_id (o microcycle_id)
        if (!selectedPlanId) {
            errors.general = "Debes seleccionar un plan de entrenamiento para esta sesión";
            showError("Debes seleccionar un plan de entrenamiento");
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (!trainerId || !effectiveClientId) {
            showError("No se pudo obtener la información del entrenador o cliente");
            return;
        }

        try {
            // Construir payload para crear sesión
            const sessionData: TrainingSessionCreate = {
                training_plan_id: selectedPlanId,
                client_id: effectiveClientId,
                trainer_id: trainerId,
                session_name: formData.sessionName.trim(),
                session_date: formData.sessionDate,
                session_type: formData.sessionType,
                planned_duration: formData.plannedDuration ? Number(formData.plannedDuration) : null,
                planned_intensity: formData.plannedIntensity ? Number(formData.plannedIntensity) : null,
                planned_volume: formData.plannedVolume ? Number(formData.plannedVolume) : null,
                notes: formData.notes.trim() || null,
                status: "planned",
            };

            const createdSession = await createTrainingSession(sessionData).unwrap();

            // Guardar ejercicios después de crear sesión
            if (exercises.length > 0) {
                let savedCount = 0;
                let failedCount = 0;

                for (const exercise of exercises) {
                    try {
                        let plannedRepsInt: number | null = null;
                        
                        if (exercise.planned_reps && exercise.planned_reps.trim()) {
                            const repsStr = exercise.planned_reps.trim();
                            if (repsStr.includes('-')) {
                                const parts = repsStr.split('-').map(p => p.trim());
                                const firstNum = parseInt(parts[0], 10);
                                if (!isNaN(firstNum)) plannedRepsInt = firstNum;
                            } else {
                                const parsed = parseInt(repsStr, 10);
                                if (!isNaN(parsed)) plannedRepsInt = parsed;
                            }
                        }

                        const exercisePayload: SessionExerciseCreate = {
                            exercise_id: exercise.exercise_id,
                            order_in_session: exercise.order_in_block,
                            planned_sets: exercise.planned_sets,
                            planned_reps: plannedRepsInt,
                            planned_weight: exercise.planned_weight,
                            planned_rest: exercise.planned_rest,
                            notes: exercise.notes,
                        };

                        await createSessionExercise({
                            sessionId: createdSession.id,
                            data: exercisePayload,
                        }).unwrap();
                        savedCount++;
                    } catch (error) {
                        console.error(`Error guardando ejercicio ${exercise.exercise_name}:`, error);
                        failedCount++;
                    }
                }

                if (savedCount === exercises.length) {
                    showSuccess(`Sesión creada con ${savedCount} ejercicios exitosamente.`, 2000);
                } else if (savedCount > 0) {
                    showSuccess(`Sesión creada. ${savedCount} ejercicios guardados, ${failedCount} fallaron.`, 3000);
                } else {
                    showError("Sesión creada, pero hubo un error al guardar los ejercicios.");
                }
            } else {
                showSuccess("Sesión creada exitosamente.", 2000);
            }

            setTimeout(() => {
                if (selectedPlanId) {
                    navigate(`/dashboard/training-plans/${selectedPlanId}?tab=sessions`);
                } else {
                    navigate(`/dashboard/clients/${effectiveClientId}?tab=sessions`);
                }
            }, 1500);
        } catch (err) {
            console.error("Error creando sesión:", err);
            type ApiError = { data?: { detail?: string } };
            const errorData = err && typeof err === "object" && "data" in err 
                ? (err as ApiError).data 
                : null;
            const errorMessage = errorData?.detail || "Error al crear la sesión";
            showError(typeof errorMessage === 'string' ? errorMessage : "Error de validación en el servidor");
        }
    };

    if (isLoadingClient || isLoadingPlan || isLoadingPlans) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
            <TrainerSideMenu />

            <DashboardLayout>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Nueva Sesión
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Crear una nueva sesión de entrenamiento para {displayClient ? `${displayClient.nombre} ${displayClient.apellidos}` : "atleta"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const state = location.state as LocationStateReturnTo | null;
                                if (state?.from) {
                                    navigate(state.from);
                                } else {
                                    navigate(-1);
                                }
                            }}
                        >
                            Volver
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Panel de recomendaciones de carga (volumen/intensidad) para el cliente — TICK-S05 */}
                            {effectiveClientId != null && effectiveClientId > 0 && (
                                <RecommendationsCards clientId={effectiveClientId} />
                            )}
                            {/* Bloque "Hoy toca" — recomendaciones del plan del día */}
                            <SessionDayPlan
                                clientId={effectiveClientId ?? null}
                                sessionDate={formData.sessionDate}
                                trainerId={trainerId}
                            />

                            {/* Nombre de la Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre de la Sesión *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.sessionName}
                                    onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                                    required
                                    placeholder="Ej: Entrenamiento de Fuerza - Piernas"
                                />
                                {formErrors.sessionName && <p className="text-red-600 text-xs mt-1">{formErrors.sessionName}</p>}
                            </div>

                            {/* Selector de Plan de Entrenamiento (Obligatorio para el backend) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Plan de Entrenamiento *
                                </label>
                                {planId ? (
                                    <Input
                                        type="text"
                                        value={plan?.name || "Cargando..."}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                ) : (
                                    <>
                                        <FormSelect
                                            value={selectedPlanId?.toString() || ""}
                                            onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                                            required
                                            options={[
                                                { value: "", label: "Selecciona un plan" },
                                                ...(clientPlans || []).map((p) => ({
                                                    value: p.id.toString(),
                                                    label: `${p.name} (${p.status === "active" ? "Activo" : "Inactivo"})`,
                                                })),
                                            ]}
                                        />
                                        {(clientPlans || []).length === 0 && (
                                            <p className="text-xs text-red-600 mt-2">
                                                Este cliente no tiene planes disponibles. Crea un plan para poder programar sesiones.
                                            </p>
                                        )}
                                    </>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    La sesión debe estar vinculada a un plan para el seguimiento de carga.
                                </p>
                            </div>

                            {/* Fecha y Tipo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-session-date" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Fecha de la Sesión *
                                    </label>
                                    <Input
                                        id="create-session-date"
                                        type="date"
                                        value={formData.sessionDate}
                                        onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-session-type" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tipo de Sesión *
                                    </label>
                                    <FormSelect
                                        id="create-session-type"
                                        value={formData.sessionType}
                                        onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                                        required
                                        options={SESSION_TYPES}
                                    />
                                </div>
                            </div>

                            {/* Duración, Intensidad, Volumen */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Duración (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) => setFormData({ ...formData, plannedDuration: e.target.value })}
                                        placeholder="60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Intensidad (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedIntensity}
                                        onChange={(e) => setFormData({ ...formData, plannedIntensity: e.target.value })}
                                        min="1" max="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Volumen (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedVolume}
                                        onChange={(e) => setFormData({ ...formData, plannedVolume: e.target.value })}
                                        min="1" max="10"
                                    />
                                </div>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Notas de la Sesión
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Instrucciones generales para la sesión..."
                                />
                            </div>

                            {/* Sección de Ejercicios */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800">Ejercicios</h3>
                                    {exercises.length > 0 && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                            {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Lista de ejercicios */}
                                <div className="space-y-3 mb-6">
                                    {exercises.map((exercise, index) => (
                                        <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{exercise.exercise_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {exercise.planned_sets} series × {exercise.planned_reps} reps
                                                    {exercise.planned_weight && ` @ ${exercise.planned_weight}kg`}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveExercise(index)} className="text-red-600 hover:text-red-800 font-bold px-2">×</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Formulario de Ejercicio */}
                                {showExerciseForm ? (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <ExerciseSuggestionsPanel onAddSuggestion={handleAddFromSuggestion} />
                                        <ExerciseSearch onSearch={handleExerciseSearch} placeholder="Buscar ejercicio..." />
                                        {availableExercises.length > 0 && (
                                            <FormSelect
                                                value={currentExercise.exercise_id?.toString() || ""}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, exercise_id: Number(e.target.value) })}
                                                options={[{ value: "", label: "Selecciona un ejercicio" }, ...availableExercises.map(ex => ({ value: ex.id.toString(), label: ex.nombre }))]}
                                            />
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Series *
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={currentExercise.planned_sets || ""}
                                                    onChange={(e) =>
                                                        setCurrentExercise({
                                                            ...currentExercise,
                                                            planned_sets: Number(e.target.value),
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Reps *
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={currentExercise.planned_reps || ""}
                                                    onChange={(e) =>
                                                        setCurrentExercise({
                                                            ...currentExercise,
                                                            planned_reps: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="primary" onClick={handleAddExercise}>Agregar</Button>
                                            <Button type="button" variant="outline" onClick={() => setShowExerciseForm(false)}>Cancelar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" onClick={() => setShowExerciseForm(true)} className="w-full">+ Agregar Ejercicio</Button>
                                )}
                            </div>

                            {/* Botones finales */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                                <Button type="submit" variant="primary" disabled={isCreatingSession || isSavingExercises} isLoading={isCreatingSession || isSavingExercises}>
                                    Crear Sesión
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};
