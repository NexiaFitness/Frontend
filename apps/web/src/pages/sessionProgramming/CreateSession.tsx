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
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { 
    useCreateTrainingSessionMutation,
    useCreateSessionExerciseMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useGetExercisesQuery, type Exercise } from "@nexia/shared/hooks/exercises";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import type { RootState } from "@nexia/shared/store";
import type {
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";
import type { 
    TrainingSessionCreate,
    SessionExerciseCreate,
} from "@nexia/shared/types/trainingSessions";

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
    const { data: client } = useGetClientQuery(clientId || 0, { skip: !clientId });
    const { data: plan } = useGetTrainingPlanQuery(planId || 0, { skip: !planId });

    // Si viene planId, obtener clientId del plan y cargar el cliente del plan
    const effectiveClientId = planId && plan ? plan.client_id : clientId;
    const { data: planClient } = useGetClientQuery(effectiveClientId || 0, { 
        skip: !effectiveClientId || (!!clientId && !planId) // Solo cargar si viene planId o si no hay clientId directo
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
        // microcycleId eliminado (Fase 2C) - será reemplazado por training_plan_id en Fase 4
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

    // NOTA (Fase 2C): Estos hooks se usarán en Fase 4 cuando se reimplemente la creación de sesiones
    // Hooks de mutación para crear bloque y ejercicios
    // const [createTrainingSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();
    // const [createSessionBlock] = useCreateSessionBlockMutation();
    // const [createSessionBlockExercise] = useCreateSessionBlockExerciseMutation();

    // Obtener block types para el bloque por defecto
    // const { data: blockTypes } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    // const defaultBlockType = useMemo(() => {
    //     // Buscar "Main" o "Principal" o el primero disponible
    //     if (!blockTypes || blockTypes.length === 0) return null;
    //     const mainBlock = blockTypes.find(
    //         (bt) => bt.name.toLowerCase().includes("main") || bt.name.toLowerCase().includes("principal")
    //     );
    //     return mainBlock || blockTypes[0];
    // }, [blockTypes]);

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
        // Reordenar los ejercicios restantes
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

    // NOTA (Fase 2C): createExercisesForSession se usará en Fase 4 cuando se reimplemente la creación de sesiones
    // const createExercisesForSession = async (sessionId: number) => {
    //     if (exercises.length === 0 || !defaultBlockType) return;
    //
    //     try {
    //         // Crear bloque por defecto
    //         const blockPayload = {
    //             block_type_id: defaultBlockType.id,
    //             order_in_session: 1,
    //             notes: "Bloque principal",
    //         };
    //
    //         const createdBlock = await createSessionBlock({
    //             sessionId,
    //             data: blockPayload,
    //         }).unwrap();
    //
    //         // Añadir ejercicios al bloque
    //         for (const exercise of exercises) {
    //             const exercisePayload: SessionBlockExerciseCreate = {
    //                 exercise_id: exercise.exercise_id,
    //                 order_in_block: exercise.order_in_block,
    //                 planned_sets: exercise.planned_sets,
    //                 planned_reps: exercise.planned_reps,
    //                 planned_weight: exercise.planned_weight,
    //                 planned_rest: exercise.planned_rest,
    //                 notes: exercise.notes,
    //             };
    //
    //             await createSessionBlockExercise({
    //                 blockId: createdBlock.id,
    //                 data: exercisePayload,
    //             }).unwrap();
    //         }
    //     } catch (error) {
    //         console.error("Error creando ejercicios:", error);
    //         // No lanzar error aquí, solo loguear
    //         // La sesión ya está creada, los ejercicios se pueden añadir después
    //     }
    // };

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
        // Validar que haya planId o clientId
        if (!planId && !effectiveClientId) {
            errors.general = "Debes proporcionar un plan de entrenamiento o un cliente";
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
                training_plan_id: planId || null,
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

                try {
                    for (const exercise of exercises) {
                        try {
                            // Convertir planned_reps de string a int (backend espera int)
                            // Manejar casos como "10", "8-12", "8-10", etc.
                            let plannedRepsInt: number | null = null;
                            
                            if (exercise.planned_reps && exercise.planned_reps.trim()) {
                                const repsStr = exercise.planned_reps.trim();
                                
                                // Si contiene guión, es un rango (ej: "8-12")
                                if (repsStr.includes('-')) {
                                    const parts = repsStr.split('-').map(p => p.trim());
                                    const firstNum = parseInt(parts[0], 10);
                                    // Usar el primer número del rango (más conservador)
                                    if (!isNaN(firstNum)) {
                                        plannedRepsInt = firstNum;
                                    }
                                } else {
                                    // Intentar convertir directamente
                                    const parsed = parseInt(repsStr, 10);
                                    if (!isNaN(parsed)) {
                                        plannedRepsInt = parsed;
                                    }
                                }

                                // Si no se pudo convertir, usar null y continuar
                                if (plannedRepsInt === null) {
                                    console.warn(`Repeticiones inválidas para ejercicio ${exercise.exercise_name}: "${exercise.planned_reps}". Se guardará como null.`);
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

                    // Mensaje de éxito según resultados
                    if (savedCount === exercises.length) {
                        showSuccess(`Sesión creada con ${savedCount} ejercicio${savedCount !== 1 ? 's' : ''} exitosamente. Redirigiendo...`, 2000);
                    } else if (savedCount > 0) {
                        showSuccess(
                            `Sesión creada. ${savedCount} ejercicio${savedCount !== 1 ? 's' : ''} guardado${savedCount !== 1 ? 's' : ''}, ${failedCount} fallaron. Redirigiendo...`,
                            3000
                        );
                    } else {
                        showError("Sesión creada, pero hubo un error al guardar los ejercicios. Puedes agregarlos después.");
                    }
                } catch (error) {
                    console.error("Error general guardando ejercicios:", error);
                    showError("Sesión creada, pero hubo un error al guardar algunos ejercicios. Puedes agregarlos después.");
                }
            } else {
                showSuccess("Sesión creada exitosamente. Redirigiendo...", 2000);
            }

            setTimeout(() => {
                // Redirigir según el flujo
                if (planId) {
                    navigate(`/dashboard/training-plans/${planId}?tab=sessions`);
                } else if (effectiveClientId) {
                    navigate(`/dashboard/clients/${effectiveClientId}`);
                } else {
                    navigate("/dashboard");
                }
            }, exercises.length > 0 ? 2000 : 1500);
        } catch (err) {
            console.error("Error creando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String(
                          (err as { data: unknown }).data || "Error al crear la sesión"
                      )
                    : "Error al crear la sesión";
            showError(errorMessage);
            // DEBUG: Ver el error completo
            if (err && typeof err === "object" && "data" in err) {
                const errorData = (err as { data: unknown }).data;
                console.error("Error data:", JSON.stringify(errorData, null, 2));
                
                // NOTA (Fase 2C): Manejo de errores de microcycle eliminado
                // En Fase 4 se implementará manejo de errores para training_plan_id
            }
        }
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Nueva Sesión
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Crear una nueva sesión de entrenamiento
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Formulario */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">
                            Detalles de la Sesión
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre de la Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre de la Sesión *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.sessionName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionName: e.target.value })
                                    }
                                    required
                                    placeholder="Ej: Entrenamiento de Fuerza - Piernas"
                                />
                                {formErrors.sessionName && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionName}</p>
                                )}
                            </div>

                            {/* Plan (read-only, solo si viene planId) */}
                            {planId && plan && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Plan de Entrenamiento
                                    </label>
                                    <Input
                                        type="text"
                                        value={plan.name || "Cargando..."}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                </div>
                            )}

                            {/* Cliente (read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Cliente
                                </label>
                                <Input
                                    type="text"
                                    value={displayClient ? `${displayClient.nombre} ${displayClient.apellidos}` : "Cargando..."}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Fecha de la Sesión *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.sessionDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionDate: e.target.value })
                                    }
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                                {formErrors.sessionDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionDate}</p>
                                )}
                            </div>

                            {/* Tipo de Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tipo de Sesión *
                                </label>
                                <FormSelect
                                    value={formData.sessionType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionType: e.target.value })
                                    }
                                    required
                                    options={SESSION_TYPES}
                                />
                                {formErrors.sessionType && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionType}</p>
                                )}
                            </div>

                            {/* Duración, Intensidad, Volumen */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Duración Planificada (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedDuration: e.target.value })
                                        }
                                        min="0"
                                        placeholder="60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Intensidad Planificada (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedIntensity}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedIntensity: e.target.value })
                                        }
                                        min="1"
                                        max="10"
                                        placeholder="7"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Volumen Planificado (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedVolume}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedVolume: e.target.value })
                                        }
                                        min="1"
                                        max="10"
                                        placeholder="6"
                                    />
                                </div>
                            </div>

                            {/* Training Plan Selector - Placeholder (Fase 2C) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Plan de Entrenamiento
                                </label>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg
                                            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">🚧 En desarrollo</p>
                                            <p className="text-blue-700">
                                                El selector de Plan de Entrenamiento se implementará en la Fase 4.
                                                Las sesiones se vincularán directamente al plan (sin jerarquía de cycles).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Notas
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Notas adicionales sobre la sesión..."
                                />
                            </div>

                            {/* Sección de Ejercicios */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                                    Ejercicios de la Sesión
                                </h3>
                                {exercises.length > 0 && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                        {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} agregado{exercises.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Lista de ejercicios agregados */}
                            {exercises.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {exercises.map((exercise, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {exercise.exercise_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {exercise.planned_sets} series × {exercise.planned_reps} reps
                                                    {exercise.planned_weight && ` @ ${exercise.planned_weight}kg`}
                                                    {exercise.planned_rest && ` • ${exercise.planned_rest}s descanso`}
                                                </p>
                                                {exercise.notes && (
                                                    <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExercise(index)}
                                                className="text-red-600 hover:text-red-800 text-xl font-bold px-2"
                                                aria-label="Eliminar ejercicio"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario para agregar ejercicio */}
                            {showExerciseForm ? (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* Búsqueda de ejercicios */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Buscar Ejercicio *
                                        </label>
                                        <ExerciseSearch
                                            onSearch={handleExerciseSearch}
                                            placeholder="Buscar ejercicio por nombre..."
                                        />
                                    </div>

                                    {/* Selector de ejercicio */}
                                    {availableExercises.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Seleccionar Ejercicio *
                                            </label>
                                            <FormSelect
                                                value={currentExercise.exercise_id?.toString() || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        exercise_id: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                options={[
                                                    { value: "", label: "Selecciona un ejercicio" },
                                                    ...availableExercises.map((ex: Exercise) => ({
                                                        value: ex.id.toString(),
                                                        label: ex.nombre,
                                                    })),
                                                ]}
                                            />
                                        </div>
                                    )}

                                    {/* Series y Repeticiones */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Series *
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={currentExercise.planned_sets || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_sets: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                placeholder="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Repeticiones *
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
                                                placeholder="10 o 8-12"
                                            />
                                        </div>
                                    </div>

                                    {/* Peso y Descanso */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Peso (kg)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={currentExercise.planned_weight || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_weight: e.target.value ? Number(e.target.value) : null,
                                                    })
                                                }
                                                placeholder="80"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Descanso (seg)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={currentExercise.planned_rest || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_rest: e.target.value ? Number(e.target.value) : null,
                                                    })
                                                }
                                                placeholder="60"
                                            />
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Notas
                                        </label>
                                        <Textarea
                                            value={currentExercise.notes || ""}
                                            onChange={(e) =>
                                                setCurrentExercise({
                                                    ...currentExercise,
                                                    notes: e.target.value || null,
                                                })
                                            }
                                            rows={2}
                                            placeholder="Notas sobre este ejercicio..."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleAddExercise}
                                            disabled={!currentExercise.exercise_id}
                                        >
                                            Agregar Ejercicio
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowExerciseForm(false);
                                                setCurrentExercise({
                                                    planned_sets: 3,
                                                    planned_reps: "10",
                                                    planned_weight: null,
                                                    planned_rest: 60,
                                                    notes: null,
                                                });
                                                setExerciseSearch("");
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowExerciseForm(true)}
                                    className="w-full"
                                >
                                    + Agregar Ejercicio
                                </Button>
                            )}

                            {/* Nota informativa */}
                            {exercises.length === 0 && !showExerciseForm && (
                                <p className="text-sm text-gray-500 text-center mt-4">
                                    Añade ejercicios a esta sesión para completar la programación
                                </p>
                            )}
                            </div>

                            {/* Botones de acción del formulario */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isCreatingSession || isSavingExercises}
                                    isLoading={isCreatingSession || isSavingExercises}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    {isCreatingSession 
                                        ? "Creando sesión..." 
                                        : isSavingExercises 
                                        ? `Guardando ejercicios (${exercises.length})...` 
                                        : "Crear Sesión"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};


