/**
 * CreateSession.tsx — Página para crear sesión manual
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión manualmente
 * - Soporta: ?clientId=X (desde cliente) o ?planId=X (desde plan)
 * - Uso embebido: clientIdProp + returnToPath + backPath desde ClientNewSessionPage (ruta clients/:id/sessions/new)
 * - Añadir ejercicio: botón abre ExercisePickerModal (catálogo con filtros, fuente única)
 * - P2: Si no hay plan activo para la fecha seleccionada → StandaloneSession (sesión libre)
 *
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.3.0 - Ejercicios desde catálogo unificado (ExercisePickerModal)
 * @updated Fase 1 U4 - Props opcionales para contexto cliente (no salir del cliente)
 * @updated Fase 3 - Coherencia tras crear: avisos en pantalla + Entendido, luego redirigir
 * @updated P2 - StandaloneSession cuando no hay plan activo en la fecha
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { useGetClientQuery, useGetClientTrainingPlansQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { 
    useCreateTrainingSessionMutation,
    useCreateSessionExerciseMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import {
    useCreateStandaloneSessionMutation,
    useCreateStandaloneSessionExerciseMutation,
} from "@nexia/shared/api/standaloneSessionsApi";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { ExercisePickerModal } from "@/components/exercises/ExercisePickerModal";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import type { RootState } from "@nexia/shared/store";
import type {
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";
import type {
    TrainingSessionCreate,
    SessionExerciseCreate,
    SessionCoherenceWarning,
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

export interface CreateSessionProps {
    /** Cuando se usa desde clients/:id/sessions/new; prioridad sobre query. */
    clientIdProp?: number;
    /** Ruta a la que navegar tras crear sesión (p. ej. /dashboard/clients/123?tab=sessions). */
    returnToPath?: string;
    /** Ruta del botón "Volver" (p. ej. /dashboard/clients/123). */
    backPath?: string;
}

export const CreateSession: React.FC<CreateSessionProps> = ({
    clientIdProp,
    returnToPath,
    backPath,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { showSuccess, showError } = useToast();

    // Obtener parámetros: props (contexto cliente) tienen prioridad sobre query
    const clientIdFromQuery = searchParams.get("clientId");
    const planIdFromQuery = searchParams.get("planId");
    const clientId = clientIdProp ?? (clientIdFromQuery ? Number(clientIdFromQuery) : null);
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
    const [createStandaloneSession, { isLoading: isCreatingStandalone }] = useCreateStandaloneSessionMutation();
    
    // Hook de mutación para crear ejercicios de sesión
    const [createSessionExercise, { isLoading: isSavingExercises }] = useCreateSessionExerciseMutation();
    const [createStandaloneExercise, { isLoading: isSavingStandaloneExercises }] = useCreateStandaloneSessionExerciseMutation();

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

    // P2: Plan activo para la fecha seleccionada (ventana start_date..end_date contiene sessionDate)
    const hasActivePlanForDate = useMemo(() => {
        if (!formData.sessionDate || !clientPlans?.length) return false;
        return clientPlans.some(
            (p) =>
                p.status === "active" &&
                p.start_date <= formData.sessionDate &&
                p.end_date >= formData.sessionDate
        );
    }, [clientPlans, formData.sessionDate]);

    // P2: Usar StandaloneSession cuando no hay plan activo para la fecha (solo en contexto cliente sin planId)
    const useStandaloneSession = !planId && !!clientId && !isLoadingPlans && !hasActivePlanForDate;

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
    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

    const [currentExercise, setCurrentExercise] = useState<Partial<ExerciseFormData>>({
        planned_sets: 3,
        planned_reps: "10",
        planned_weight: null,
        planned_rest: 60,
        notes: null,
    });

    /** Fase 3: avisos de coherencia tras crear sesión; al confirmar "Entendido" se redirige. */
    const [postCreateCoherenceWarnings, setPostCreateCoherenceWarnings] = useState<
        SessionCoherenceWarning[] | null
    >(null);
    const [postCreateRedirectPath, setPostCreateRedirectPath] = useState<string | null>(null);

    // Validar que haya al menos clientId o planId
    useEffect(() => {
        if (!clientId && !planId) {
            showError("Debes proporcionar un cliente o un plan de entrenamiento");
            navigate("/dashboard");
        }
    }, [clientId, planId, navigate, showError]);

    // Handler cuando el usuario selecciona un ejercicio del catálogo (modal)
    const handleSelectFromPicker = (exercise: Exercise) => {
        setCurrentExercise({
            exercise_id: exercise.id,
            exercise_name: exercise.nombre,
            order_in_block: exercises.length + 1,
            planned_sets: 3,
            planned_reps: "10",
            planned_weight: null,
            planned_rest: 60,
            notes: null,
        });
        setShowExerciseForm(true);
        setShowExercisePickerModal(false);
    };

    // Handler para añadir ejercicio a la lista (tras configurar series/reps)
    const handleAddExercise = () => {
        if (!currentExercise.exercise_id || !currentExercise.exercise_name) {
            showError("Selecciona un ejercicio desde el catálogo");
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

        const newExercise: ExerciseFormData = {
            exercise_id: currentExercise.exercise_id,
            exercise_name: currentExercise.exercise_name,
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
    };

    const handleCancelExerciseForm = () => {
        setCurrentExercise({
            planned_sets: 3,
            planned_reps: "10",
            planned_weight: null,
            planned_rest: 60,
            notes: null,
        });
        setShowExerciseForm(false);
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
        
        // P2: Solo requerir plan cuando usamos TrainingSession
        if (!useStandaloneSession && !selectedPlanId) {
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

        const redirectTo =
            returnToPath ??
            (selectedPlanId
                ? `/dashboard/training-plans/${selectedPlanId}?tab=sessions`
                : `/dashboard/clients/${effectiveClientId}?tab=sessions`);

        const convertPlannedReps = (repsStr: string): number | null => {
            if (!repsStr?.trim()) return null;
            const s = repsStr.trim();
            if (s.includes("-")) {
                const firstNum = parseInt(s.split("-")[0].trim(), 10);
                return !isNaN(firstNum) ? firstNum : null;
            }
            const parsed = parseInt(s, 10);
            return !isNaN(parsed) ? parsed : null;
        };

        try {
            if (useStandaloneSession) {
                // P2: Crear StandaloneSession (sesión libre)
                const standaloneData = {
                    trainer_id: trainerId,
                    client_id: effectiveClientId,
                    session_date: formData.sessionDate,
                    session_name: formData.sessionName.trim(),
                    session_type: formData.sessionType,
                    planned_duration: formData.plannedDuration ? Number(formData.plannedDuration) : null,
                    actual_duration: null,
                    status: "planned",
                    notes: formData.notes.trim() || null,
                };
                const created = await createStandaloneSession(standaloneData).unwrap();

                if (exercises.length > 0) {
                    let savedCount = 0;
                    for (const ex of exercises) {
                        try {
                            await createStandaloneExercise({
                                sessionId: created.id,
                                data: {
                                    exercise_id: ex.exercise_id,
                                    order_in_session: ex.order_in_block,
                                    planned_sets: ex.planned_sets,
                                    planned_reps: convertPlannedReps(ex.planned_reps),
                                    planned_weight: ex.planned_weight,
                                    planned_rest: ex.planned_rest,
                                    notes: ex.notes,
                                },
                            }).unwrap();
                            savedCount++;
                        } catch {
                            // continuar con el resto
                        }
                    }
                    showSuccess(
                        savedCount === exercises.length
                            ? `Sesión libre creada con ${savedCount} ejercicios.`
                            : `Sesión libre creada. ${savedCount}/${exercises.length} ejercicios guardados.`,
                        2000
                    );
                } else {
                    showSuccess("Sesión libre creada.", 2000);
                }
                setTimeout(() => navigate(redirectTo), 1500);
            } else {
                // TrainingSession (con plan)
                const sessionData: TrainingSessionCreate = {
                    training_plan_id: selectedPlanId!,
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

                if (exercises.length > 0) {
                    let savedCount = 0;
                    let failedCount = 0;
                    for (const exercise of exercises) {
                        try {
                            const exercisePayload: SessionExerciseCreate = {
                                exercise_id: exercise.exercise_id,
                                order_in_session: exercise.order_in_block,
                                planned_sets: exercise.planned_sets,
                                planned_reps: convertPlannedReps(exercise.planned_reps),
                                planned_weight: exercise.planned_weight,
                                planned_rest: exercise.planned_rest,
                                notes: exercise.notes,
                            };
                            await createSessionExercise({
                                sessionId: createdSession.id,
                                data: exercisePayload,
                            }).unwrap();
                            savedCount++;
                        } catch {
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

                const coherence = createdSession.coherence;
                const warnings =
                    coherence?.coherence_warnings && coherence.coherence_warnings.length > 0
                        ? coherence.coherence_warnings
                        : null;

                if (warnings && warnings.length > 0) {
                    setPostCreateCoherenceWarnings(warnings);
                    setPostCreateRedirectPath(redirectTo);
                } else {
                    setTimeout(() => navigate(redirectTo), 1500);
                }
            }
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

    if (postCreateCoherenceWarnings != null && postCreateCoherenceWarnings.length > 0 && postCreateRedirectPath) {
        return (
            <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Sesión creada con avisos de coherencia</h2>
                    <p className="text-sm text-muted-foreground">
                        La sesión se ha guardado correctamente. Revisa los siguientes avisos respecto al plan del día:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                        {postCreateCoherenceWarnings.map((w, i) => (
                            <li key={i}>{w.message}</li>
                        ))}
                    </ul>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setPostCreateCoherenceWarnings(null);
                            setPostCreateRedirectPath(null);
                            navigate(postCreateRedirectPath);
                        }}
                    >
                        Entendido
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
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
                                if (backPath) {
                                    navigate(backPath);
                                } else {
                                    const state = location.state as LocationStateReturnTo | null;
                                    if (state?.from) {
                                        navigate(state.from);
                                    } else {
                                        navigate(-1);
                                    }
                                }
                            }}
                        >
                            Volver
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Panel de recomendaciones: con plan = SessionDayPlan; sin plan = RecommendationsCards (P2) */}
                            {effectiveClientId != null && effectiveClientId > 0 && (
                                useStandaloneSession ? (
                                    <RecommendationsCards clientId={effectiveClientId} />
                                ) : (
                                    <SessionDayPlan
                                        clientId={effectiveClientId}
                                        sessionDate={formData.sessionDate}
                                        trainerId={trainerId}
                                    />
                                )
                            )}

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

                            {/* Selector de Plan de Entrenamiento (oculto cuando sesión libre P2) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Plan de Entrenamiento {!useStandaloneSession && "*"}
                                </label>
                                {useStandaloneSession ? (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                        <p className="text-sm text-slate-600">
                                            Sesión libre (sin plan activo para esta fecha)
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            La sesión se creará como sesión independiente.
                                        </p>
                                    </div>
                                ) : planId ? (
                                    <Input
                                        type="text"
                                        value={plan?.name || "Cargando..."}
                                        disabled
                                        className="bg-muted"
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
                                {!useStandaloneSession && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        La sesión debe estar vinculada a un plan para el seguimiento de carga.
                                    </p>
                                )}
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
                            <div className="mt-8 pt-8 border-t border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-foreground">Ejercicios</h3>
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
                                                <p className="font-semibold text-foreground">{exercise.exercise_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {exercise.planned_sets} series × {exercise.planned_reps} reps
                                                    {exercise.planned_weight && ` @ ${exercise.planned_weight}kg`}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveExercise(index)} className="text-red-600 hover:text-red-800 font-bold px-2">×</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Añadir ejercicio: catálogo unificado (solo monta modal cuando abierto) */}
                                {showExercisePickerModal && (
                                    <ExercisePickerModal
                                        isOpen={true}
                                        onClose={() => setShowExercisePickerModal(false)}
                                        onSelect={handleSelectFromPicker}
                                    />
                                )}
                                {showExerciseForm ? (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm font-medium text-slate-700">
                                            Ejercicio seleccionado: <span className="font-semibold">{currentExercise.exercise_name}</span>
                                        </p>
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
                                            <Button type="button" variant="primary" onClick={handleAddExercise}>
                                                Agregar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancelExerciseForm}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowExercisePickerModal(true)}
                                        className="w-full"
                                    >
                                        + Añadir Ejercicio
                                    </Button>
                                )}
                            </div>

                            {/* Botones finales */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                                <Button type="submit" variant="primary" disabled={isCreatingSession || isSavingExercises || isCreatingStandalone || isSavingStandaloneExercises} isLoading={isCreatingSession || isSavingExercises || isCreatingStandalone || isSavingStandaloneExercises}>
                                    Crear Sesión
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
        </>
    );
};
