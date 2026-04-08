/**
 * CreateSession.tsx — Página para crear sesión manual
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión manualmente
 * - Soporta: ?clientId=X (desde cliente) o ?planId=X (desde plan)
 * - Uso embebido: clientIdProp + returnToPath + backPath desde ClientNewSessionPage (ruta …/sessions/new/constructor)
 * - Añadir ejercicio: botón abre ExercisePickerPanel (panel lateral, lista por letra)
 * - P2: Si no hay plan activo para la fecha seleccionada → StandaloneSession (sesión libre)
 *
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.4.0 - Panel lateral ExercisePickerPanel (reemplaza modal)
 * @updated Fase 1 U4 - Props opcionales para contexto cliente (no salir del cliente)
 * @updated Fase 3 - Coherencia tras crear: avisos en pantalla + Entendido, luego redirigir
 * @updated P2 - StandaloneSession cuando no hay plan activo en la fecha
 */

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormSelect, FormCombobox, Textarea, Slider, DatePickerButton } from "@/components/ui/forms";
import { useGetClientQuery, useGetClientTrainingPlansQuery, useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import {
    useGetTrainingPlanQuery,
    useGetTrainingPlanRecommendationsQuery,
    useGetActivePlanByClientQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useCreateTrainingSessionMutation } from "@nexia/shared/api/trainingSessionsApi";
import {
    useCreateStandaloneSessionMutation,
    useCreateStandaloneSessionExerciseMutation,
} from "@nexia/shared/api/standaloneSessionsApi";
import {
    useGetTrainingBlockTypesQuery,
    useCreateSessionBlockMutation,
    useCreateSessionBlockExerciseMutation,
    useCreateSessionTemplateMutation,
} from "@nexia/shared/api/sessionProgrammingApi";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import type { ConstructorRow, ConstructorExercise } from "@/components/sessionProgramming/constructorTypes";
import { buildExercisePayload } from "./buildExercisePayload";
import { buildTemplatePayloadFromConstructorRows } from "./buildTemplatePayload";
import { ArrowLeft, ClipboardList, Flame, Gauge } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { EmptyStateCard } from "@/components/ui/cards";
import { DashboardFixedFooter, PageTitle } from "@/components/dashboard/shared";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import type { RootState } from "@nexia/shared/store";
import type {
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    TrainingSessionCreate,
    SessionCoherenceWarning,
} from "@nexia/shared/types/trainingSessions";
import type { LocationStateReturnTo } from "@nexia/shared";
import { SESSION_TYPES } from "./sessionFormConstants";

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
    const { showSuccess, showError, showWarning } = useToast();

    // Obtener parámetros: props (contexto cliente) tienen prioridad sobre query
    const clientIdFromQuery = searchParams.get("clientId");
    const planIdFromQuery = searchParams.get("planId");
    const dateFromQuery = searchParams.get("date");
    const clientId = clientIdProp ?? (clientIdFromQuery ? Number(clientIdFromQuery) : null);
    const planId = planIdFromQuery ? Number(planIdFromQuery) : null;

    /** Cliente seleccionado desde el selector (cuando se entra sin clientId/planId, p. ej. desde /dashboard/sessions) */
    const [selectedClientIdFromSelector, setSelectedClientIdFromSelector] = useState<number | null>(null);
    const resolvedClientId = clientId ?? selectedClientIdFromSelector;

    // Obtener perfil del trainer
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id ?? 0;

    /** Plan activo del cliente (Instance); solo en ruta anidada con `clientIdProp`. */
    const { data: activePlanForClient, isLoading: isLoadingActivePlan } = useGetActivePlanByClientQuery(
        resolvedClientId || 0,
        { skip: !clientIdProp || !resolvedClientId || resolvedClientId <= 0 }
    );
    const clientForcedPlan = Boolean(clientIdProp && activePlanForClient);

    // Obtener datos según el flujo
    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(resolvedClientId || 0, { skip: !resolvedClientId });
    const { data: plan, isLoading: isLoadingPlan } = useGetTrainingPlanQuery(planId || 0, { skip: !planId });

    // Si no viene planId pero sí resolvedClientId, buscar planes activos del cliente
    const { data: clientPlans, isLoading: isLoadingPlans } = useGetClientTrainingPlansQuery(
        { clientId: resolvedClientId || 0, skip: 0, limit: 100 },
        { skip: !!planId || !resolvedClientId }
    );

    // Clientes del trainer (para selector — siempre cargar cuando no hay contexto de cliente/plan)
    const { data: trainerClientsData } = useGetTrainerClientsQuery(
        { trainerId, page: 1, per_page: 50 },
        { skip: !trainerId }
    );

    // Estado para el plan seleccionado (si se elige manualmente o se autoselecciona)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(planId);

    useEffect(() => {
        if (clientForcedPlan && activePlanForClient) {
            setSelectedPlanId(activePlanForClient.id);
        }
    }, [clientForcedPlan, activePlanForClient]);

    // Autoseleccionar plan si solo hay uno activo (no pisar plan activo forzado en contexto cliente)
    useEffect(() => {
        if (clientForcedPlan) return;
        if (!planId && clientPlans && clientPlans.length > 0) {
            const activePlans = clientPlans.filter((p) => p.status === "active");
            if (activePlans.length === 1) {
                setSelectedPlanId(activePlans[0].id);
            } else if (activePlans.length === 0 && clientPlans.length === 1) {
                setSelectedPlanId(clientPlans[0].id);
            }
        }
    }, [clientPlans, planId, clientForcedPlan]);

    // Si viene planId, obtener clientId del plan y cargar el cliente del plan
    const effectiveClientId = planId && plan ? plan.client_id : resolvedClientId;
    const { data: planClient } = useGetClientQuery(effectiveClientId || 0, { 
        skip: !effectiveClientId || (!!resolvedClientId && !planId) 
    });

    // Lesiones activas del cliente (solo cuando hay cliente seleccionado — para banner de alerta)
    const { activeInjuries: clientActiveInjuries = [], hasActiveInjuries } = useClientInjuries({
        clientId: effectiveClientId ?? 0,
        includeHistory: false,
    });

    // Period blocks for the selected plan (auto-fill volume/intensity from matching block)
    const effectivePlanId = selectedPlanId ?? planId;
    const { data: periodBlocks } = useGetPeriodBlocksQuery(effectivePlanId!, {
        skip: !effectivePlanId,
    });

    // Recomendaciones de plan (para pre-llenar duración, intensidad, volumen y mostrar bloque Lovable)
    const { data: recommendationsData } = useGetTrainingPlanRecommendationsQuery(
        { clientId: effectiveClientId ?? 0 },
        { skip: !effectiveClientId || effectiveClientId <= 0 }
    );

    // Cliente a mostrar (prioridad: cliente directo > cliente del plan)
    const displayClient = client || planClient;

    // Hook de mutación para crear sesión
    const [createTrainingSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();
    const [createStandaloneSession, { isLoading: isCreatingStandalone }] = useCreateStandaloneSessionMutation();
    const [createStandaloneExercise, { isLoading: isSavingStandaloneExercises }] = useCreateStandaloneSessionExerciseMutation();

    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: dateFromQuery ?? new Date().toISOString().split("T")[0],
        sessionType: "strength",
        plannedDuration: "60",
        plannedIntensity: "5",
        plannedVolume: "5",
        notes: "",
    });

    useEffect(() => {
        if (!dateFromQuery || !/^\d{4}-\d{2}-\d{2}$/.test(dateFromQuery)) return;
        setFormData((prev) =>
            prev.sessionDate === dateFromQuery ? prev : { ...prev, sessionDate: dateFromQuery }
        );
    }, [dateFromQuery]);

    useEffect(() => {
        if (!activePlanForClient || !clientIdProp) return;
        const { start_date, end_date } = activePlanForClient;
        setFormData((prev) => {
            if (!prev.sessionDate) return prev;
            if (prev.sessionDate >= start_date && prev.sessionDate <= end_date) return prev;
            return { ...prev, sessionDate: start_date };
        });
    }, [activePlanForClient, clientIdProp]);

    const [formErrors, setFormErrors] = useState<CreateSessionFormErrors>({});

    const matchingBlock = useMemo(() => {
        if (!periodBlocks || !formData.sessionDate) return null;
        return periodBlocks.find(
            (b) => b.start_date <= formData.sessionDate && b.end_date >= formData.sessionDate
        ) ?? null;
    }, [periodBlocks, formData.sessionDate]);

    const prefillApplied = useRef<{ clientId: number; duration: boolean; rec: boolean } | null>(null);

    useEffect(() => {
        if (!effectiveClientId || effectiveClientId <= 0) {
            prefillApplied.current = null;
            return;
        }
        if (prefillApplied.current?.clientId !== effectiveClientId) {
            prefillApplied.current = { clientId: effectiveClientId, duration: false, rec: false };
        }
        const state = prefillApplied.current;
        const updates: Partial<typeof formData> = {};

        const profile = displayClient as { session_duration?: string | null } | undefined;
        if (!state.duration && profile?.session_duration) {
            const durationMap: Record<string, string> = {
                short_lt_1h: "45",
                medium_1h_to_1h30: "60",
                long_gt_1h30: "90",
            };
            updates.plannedDuration = durationMap[profile.session_duration] ?? "60";
            state.duration = true;
        }

        if (!state.rec && matchingBlock) {
            updates.plannedVolume = String(matchingBlock.volume_level);
            updates.plannedIntensity = String(matchingBlock.intensity_level);
            state.rec = true;
        } else if (!state.rec) {
            const rec = recommendationsData as { status?: string; recommendations?: { volume?: { level?: string }; intensity?: { level?: string } } } | undefined;
            if (rec?.status === "complete" && rec.recommendations) {
                const levelToSlider: Record<string, string> = {
                    low: "3",
                    Low: "3",
                    medium: "6",
                    Medium: "6",
                    high: "8",
                    High: "8",
                };
                const volLevel = rec.recommendations.volume?.level;
                const intLevel = rec.recommendations.intensity?.level;
                if (volLevel) updates.plannedVolume = levelToSlider[volLevel] ?? "6";
                if (intLevel) updates.plannedIntensity = levelToSlider[intLevel] ?? "6";
                state.rec = true;
            }
        }

        if (Object.keys(updates).length > 0) {
            setFormData((prev) => ({ ...prev, ...updates }));
        }
    }, [effectiveClientId, displayClient, recommendationsData, matchingBlock]);

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

    // P2: Standalone solo si no forzamos el plan activo (ruta cliente + GET active-by-client)
    const useStandaloneSession =
        !clientForcedPlan &&
        !planId &&
        !!resolvedClientId &&
        !isLoadingPlans &&
        !hasActivePlanForDate;

    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

    /** Fase 4+7: Constructor por bloques */
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);

    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const [createSessionBlock] = useCreateSessionBlockMutation();
    const [createSessionBlockExercise] = useCreateSessionBlockExerciseMutation();
    const [createSessionTemplate, { isLoading: isSavingTemplate }] = useCreateSessionTemplateMutation();

    /** Fase 3: avisos de coherencia tras crear sesión; al confirmar "Entendido" se redirige. */
    const [postCreateCoherenceWarnings, setPostCreateCoherenceWarnings] = useState<
        SessionCoherenceWarning[] | null
    >(null);
    const [postCreateRedirectPath, setPostCreateRedirectPath] = useState<string | null>(null);

    /** Flujo clients/.../sessions/new/constructor: el <main> del dashboard conserva scroll; alinear con "Nueva Sesión". */
    const clientFlowTitleAnchorRef = useRef<HTMLDivElement>(null);
    const embedLoadingScreen =
        isLoadingClient || isLoadingPlan || isLoadingPlans || (Boolean(clientIdProp) && isLoadingActivePlan);

    useLayoutEffect(() => {
        if (!clientIdProp) return;
        if (embedLoadingScreen) return;
        if (postCreateCoherenceWarnings != null && postCreateCoherenceWarnings.length > 0) return;
        clientFlowTitleAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, [clientIdProp, embedLoadingScreen, dateFromQuery, postCreateCoherenceWarnings]);

    /** Fase 4: Añadir ejercicio seleccionado a la fila del Constructor */
    const handleSelectFromPicker = (exercise: Exercise) => {
        if (!targetRowIdForPicker) return;
        const newEx: ConstructorExercise = {
            id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            exerciseId: exercise.id,
            exerciseName: exerciseDisplayName(exercise),
            plannedReps: "10",
            plannedWeight: null,
            plannedDuration: null,
            effortCharacter: null,
            effortValue: null,
            notes: null,
        };
        setConstructorRows((prev) =>
            prev.map((r) =>
                r.id === targetRowIdForPicker
                    ? { ...r, exercises: [...r.exercises, newEx] }
                    : r
            )
        );
        /* targetRowIdForPicker se mantiene: panel abierto para añadir más a la misma fila */
    };

    /** Guardar como plantilla — incluye bloques y ejercicios del Constructor */
    const handleSaveAsTemplate = async () => {
        const payload = buildTemplatePayloadFromConstructorRows({
            constructorRows,
            sessionName: formData.sessionName,
            sessionType: formData.sessionType,
            plannedDuration: formData.plannedDuration,
            notes: formData.notes,
        });
        try {
            await createSessionTemplate(payload).unwrap();
            showSuccess("Plantilla guardada correctamente", 2000);
            setTimeout(() => navigate(-1), 1500);
        } catch {
            showError("Error al guardar la plantilla. Inténtalo de nuevo.");
        }
    };

    const validateForm = useCallback((): { valid: boolean; errors: CreateSessionFormErrors } => {
        const errors: CreateSessionFormErrors = {};
        if (!formData.sessionName.trim()) {
            errors.sessionName = "El nombre de la sesión es obligatorio";
        }
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
        }
        if (!formData.sessionType) {
            errors.sessionType = "El tipo de sesión es obligatorio";
        }
        if (!useStandaloneSession && !selectedPlanId) {
            errors.trainingPlanId = "Debes seleccionar un plan de entrenamiento para esta sesión";
        }
        return { valid: Object.keys(errors).length === 0, errors };
    }, [formData.sessionName, formData.sessionDate, formData.sessionType, useStandaloneSession, selectedPlanId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const { valid, errors } = validateForm();
        if (!valid) {
            setFormErrors(errors);
            showWarning("Completa todos los campos obligatorios antes de crear la sesión", 5000);
            return;
        }

        if (!trainerId || !effectiveClientId) {
            showWarning("Selecciona un cliente para continuar con la creación de la sesión", 5000);
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
                // P2: Crear StandaloneSession (sesión libre) — ejercicios aplanados del Constructor
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

                let order = 0;
                const flatExercises = constructorRows.flatMap((r) =>
                    r.exercises.map((ex) => ({
                        exercise_id: ex.exerciseId,
                        order_in_session: ++order,
                        planned_sets: r.sets ?? 3,
                        planned_reps: convertPlannedReps(ex.plannedReps ?? ""),
                        planned_weight: ex.plannedWeight,
                        planned_rest: r.rest,
                        notes: ex.notes,
                    }))
                );

                if (flatExercises.length > 0) {
                    let savedCount = 0;
                    for (const ex of flatExercises) {
                        try {
                            await createStandaloneExercise({
                                sessionId: created.id,
                                data: {
                                    exercise_id: ex.exercise_id,
                                    order_in_session: ex.order_in_session,
                                    planned_sets: ex.planned_sets,
                                    planned_reps: ex.planned_reps,
                                    planned_weight: ex.planned_weight,
                                    planned_rest: ex.planned_rest,
                                    notes: ex.notes,
                                },
                            }).unwrap();
                            savedCount++;
                        } catch {
                            // continuar
                        }
                    }
                    showSuccess(
                        savedCount === flatExercises.length
                            ? `Sesión libre creada con ${savedCount} ejercicios.`
                            : `Sesión libre creada. ${savedCount}/${flatExercises.length} ejercicios guardados.`,
                        2000
                    );
                } else {
                    showSuccess("Sesión libre creada.", 2000);
                }
                setTimeout(() => navigate(redirectTo), 1500);
            } else {
                // Fase 7: TrainingSession con bloques
                const sessionData: TrainingSessionCreate = {
                    training_plan_id: selectedPlanId!,
                    period_block_id: matchingBlock?.id ?? null,
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

                if (constructorRows.length > 0) {
                    let blocksSaved = 0;
                    let exercisesSaved = 0;
                    for (let i = 0; i < constructorRows.length; i++) {
                        const row = constructorRows[i];
                        if (!row.blockTypeId) continue;
                        try {
                            const blockPayload = {
                                block_type_id: row.blockTypeId,
                                order_in_session: i + 1,
                                set_type: row.setType,
                                rounds: row.rounds,
                                time_cap: row.timeCap,
                                interval_seconds: row.intervalSeconds,
                                objective_text:
                                    row.setType === "for_time"
                                        ? "Objetivo: menor tiempo"
                                        : row.setType === "amrap"
                                        ? "Objetivo: máximo rendimiento"
                                        : null,
                            };
                            const createdBlock = await createSessionBlock({
                                sessionId: createdSession.id,
                                data: blockPayload,
                            }).unwrap();

                            for (let j = 0; j < row.exercises.length; j++) {
                                const ex = row.exercises[j];
                                try {
                                    const payload = buildExercisePayload(
                                        row,
                                        ex,
                                        j + 1,
                                        row.setType
                                    );
                                    await createSessionBlockExercise({
                                        blockId: createdBlock.id,
                                        data: payload,
                                    }).unwrap();
                                    exercisesSaved++;
                                } catch {
                                    // continuar
                                }
                            }
                            blocksSaved++;
                        } catch {
                            // continuar
                        }
                    }
                    const totalEx = constructorRows.reduce((s, r) => s + r.exercises.length, 0);
                    if (blocksSaved === constructorRows.length && exercisesSaved === totalEx) {
                        showSuccess(`Sesión creada con ${blocksSaved} bloques y ${exercisesSaved} ejercicios.`, 2000);
                    } else if (blocksSaved > 0) {
                        showSuccess(`Sesión creada. ${blocksSaved} bloques, ${exercisesSaved} ejercicios guardados.`, 3000);
                    } else {
                        showError("Sesión creada, pero hubo un error al guardar los bloques.");
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

    if (isLoadingClient || isLoadingPlan || isLoadingPlans || (Boolean(clientIdProp) && isLoadingActivePlan)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (postCreateCoherenceWarnings != null && postCreateCoherenceWarnings.length > 0 && postCreateRedirectPath) {
        return (
            <div className="mb-6 lg:mb-8">
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
            <div className="space-y-6 pb-24">
                {/* Header + Volver — mismo patrón que dashboard */}
                <div
                    ref={clientFlowTitleAnchorRef}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 scroll-mt-2"
                >
                    <PageTitle title="Nueva Sesión" titleAs={clientIdProp ? "h2" : "h1"} />
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
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                </div>

                {/* Tarjeta contexto cliente: combobox (diseño Lovable) o avatar */}
                {!resolvedClientId && !planId ? (
                    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm space-y-3">
                        <FormCombobox
                            value={selectedClientIdFromSelector?.toString() || ""}
                            onChange={(v) => setSelectedClientIdFromSelector(v ? Number(v) : null)}
                            options={[
                                { value: "", label: "Seleccionar cliente *" },
                                ...(trainerClientsData?.items || []).map((c) => ({
                                    value: c.id.toString(),
                                    label: `${c.nombre} ${c.apellidos}`,
                                })),
                            ]}
                            placeholder="Seleccionar cliente *"
                            aria-label="Seleccionar cliente"
                        />
                    </div>
                ) : displayClient && effectiveClientId ? (
                    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                        <ClientAvatar
                            clientId={effectiveClientId}
                            nombre={displayClient.nombre}
                            apellidos={displayClient.apellidos}
                            size="sm"
                        />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Creando sesión para {displayClient.nombre} {displayClient.apellidos}
                            </p>
                        </div>
                    </div>
                ) : null}

                <form id="create-session-form" onSubmit={handleSubmit}>
                {/* Grid: 3 primeras filas (nombre, fecha, duración) + columna derecha con plan — solo cuando hay cliente */}
                <div
                    className={cn(
                        "grid grid-cols-1 items-stretch gap-6",
                        effectiveClientId ? "lg:grid-cols-[1fr_420px]" : "",
                    )}
                >
                    <div className="min-h-0 space-y-5">
                            {/* Nombre de la Sesión + Plan de Entrenamiento (misma línea cuando hay cliente) */}
                            <div className={`grid gap-4 ${resolvedClientId ? "grid-cols-1 md:grid-cols-2" : ""}`}>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Nombre de la Sesión *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.sessionName}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, sessionName: e.target.value }))}
                                        required
                                        placeholder="Ej: Fuerza — Tren superior A"
                                        className="bg-surface"
                                    />
                                    {formErrors.sessionName && <p className="text-destructive text-xs mt-1">{formErrors.sessionName}</p>}
                                </div>
                                {resolvedClientId && (
                                <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Plan de Entrenamiento {!useStandaloneSession && "*"}
                                </label>
                                {useStandaloneSession ? (
                                        <Input
                                            type="text"
                                            value="Sesión libre"
                                            disabled
                                            className="bg-muted"
                                        />
                                    ) : clientForcedPlan ? (
                                        <Input
                                            type="text"
                                            value={
                                                activePlanForClient?.display_name ||
                                                activePlanForClient?.name ||
                                                "Plan activo"
                                            }
                                            disabled
                                            className="bg-muted"
                                            aria-label="Plan de entrenamiento activo (no modificable)"
                                        />
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
                                                onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : null)}
                                                required={!!resolvedClientId && !useStandaloneSession}
                                                options={[
                                                    { value: "", label: "Selecciona un plan" },
                                                    ...(clientPlans || []).map((p) => ({
                                                        value: p.id.toString(),
                                                        label: `${p.name} (${p.status === "active" ? "Activo" : "Inactivo"})`,
                                                    })),
                                                ]}
                                            />
                                            {(clientPlans || []).length === 0 && resolvedClientId && (
                                                <p className="text-xs text-destructive mt-2">
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
                                )}
                            </div>

                            {/* Fecha y Tipo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-session-date" className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Fecha de la Sesión *
                                    </label>
                                    <DatePickerButton
                                        label="Seleccionar fecha"
                                        value={formData.sessionDate}
                                        onChange={(v) => setFormData({ ...formData, sessionDate: v })}
                                        variant="form"
                                        disabled={clientForcedPlan}
                                        aria-label={
                                            clientForcedPlan
                                                ? "Fecha de la sesión: elige el día en el calendario de periodización"
                                                : "Fecha de la sesión"
                                        }
                                    />
                                    {clientForcedPlan && clientIdProp != null && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <Link
                                                to={`/dashboard/clients/${clientIdProp}/sessions/new?date=${encodeURIComponent(formData.sessionDate)}`}
                                                className="text-primary underline-offset-2 hover:underline font-medium"
                                            >
                                                Elegir otra fecha en el calendario
                                            </Link>
                                            <span className="text-muted-foreground"> (vigencia del plan activo).</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="create-session-type" className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Tipo de Sesión *
                                    </label>
                                    <FormSelect
                                        id="create-session-type"
                                        value={formData.sessionType}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, sessionType: e.target.value }))}
                                        required
                                        options={SESSION_TYPES}
                                    />
                                </div>
                            </div>

                            {/* Fila Duración + Volumen + Intensidad (grid 3 cols, spec 4.1.3) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Duración (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) => setFormData({ ...formData, plannedDuration: e.target.value })}
                                        placeholder="60"
                                        className="bg-surface"
                                    />
                                </div>
                                <div className="mt-3 md:mt-0">
                                    <Slider
                                        label="Volumen"
                                        labelIcon={<Gauge className="h-3.5 w-3.5 text-primary" aria-hidden />}
                                        value={formData.plannedVolume ? Number(formData.plannedVolume) : 5}
                                        min={1}
                                        max={10}
                                        color="primary"
                                        onChange={(v) => setFormData({ ...formData, plannedVolume: String(v) })}
                                    />
                                </div>
                                <div className="mt-3 md:mt-0">
                                    <Slider
                                        label="Intensidad"
                                        labelIcon={<Flame className="h-3.5 w-3.5 text-warning" aria-hidden />}
                                        value={formData.plannedIntensity ? Number(formData.plannedIntensity) : 5}
                                        min={1}
                                        max={10}
                                        color="warning"
                                        onChange={(v) => setFormData((prev) => ({ ...prev, plannedIntensity: String(v) }))}
                                    />
                                </div>
                            </div>
                    </div>

                    {/* Columna derecha: Plan del día — solo cuando hay cliente seleccionado */}
                    {effectiveClientId != null && effectiveClientId > 0 && (
                    <div className="flex h-full min-h-0 flex-col lg:self-stretch">
                        {useStandaloneSession ? (
                                <EmptyStateCard
                                    className="h-full min-h-0 flex-1"
                                    icon={<ClipboardList aria-hidden />}
                                    title="Sin plan asignado"
                                    description="Este cliente no tiene un plan de entrenamiento activo."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/50"
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/training-plans/create?clientId=${effectiveClientId}`,
                                                    {
                                                        state: { from: location.pathname },
                                                    }
                                                )
                                            }
                                        >
                                            <ClipboardList className="mr-2 h-3.5 w-3.5" aria-hidden />
                                            Crear plan
                                        </Button>
                                    }
                                    footer={
                                        <p className="text-[11px] text-muted-foreground">
                                            Puedes continuar sin plan y crear la sesión libremente.
                                        </p>
                                    }
                                />
                            ) : (
                                <SessionDayPlan
                                    clientId={effectiveClientId}
                                    sessionDate={formData.sessionDate}
                                    trainerId={trainerId}
                                />
                            )}
                    </div>
                    )}
                </div>

                {/* A partir de aquí todo ancho: banner lesiones, recomendaciones, bloques, constructor, notas */}
                <div className="mt-6 space-y-5 w-full">
                            {/* Alerta lesiones activas — solo cuando hay cliente seleccionado */}
                            {effectiveClientId && hasActiveInjuries && displayClient && (
                                <Alert variant="warning">
                                    Atención: {displayClient.nombre} {displayClient.apellidos} tiene lesiones activas (
                                    {clientActiveInjuries.map((i) => i.joint_name).filter(Boolean).join(", ") || "ver ficha del cliente"}
                                    ). Los ejercicios contraindicados están marcados en la lista.
                                </Alert>
                            )}

                            {/* Recomendaciones de plan (Lovable) — solo cuando hay cliente asignado */}
                            {effectiveClientId && (
                                <RecommendationsCards clientId={effectiveClientId} />
                            )}

                            {/* Bloques + Constructor + Panel lateral — flex cuando panel abierto */}
                            <div className="flex gap-6">
                                <div
                                    className={cn(
                                        "flex-1 space-y-5 min-w-0",
                                        showExercisePickerModal && "lg:max-w-[calc(100%-324px)]"
                                    )}
                                >
                                    <div className="space-y-5">
                                        <TrainingBlockSelector
                                            selectedBlockTypeIds={[...new Set(constructorRows.map((r) => r.blockTypeId).filter(Boolean))]}
                                            onSelect={(blockTypeId) => {
                                                if (!blockTypeId || !blockTypes.some((bt) => bt.id === blockTypeId)) return;
                                                const newRow: ConstructorRow = {
                                                    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                                                    blockTypeId: blockTypeId,
                                                    setType: SET_TYPE.SINGLE_SET,
                                                    sets: 3,
                                                    rounds: null,
                                                    timeCap: null,
                                                    intervalSeconds: null,
                                                    exercises: [],
                                                    rest: 60,
                                                    repsTipo: "reps",
                                                };
                                                setConstructorRows((prev) => [...prev, newRow]);
                                            }}
                                        />
                                        <SessionConstructor
                                            rows={constructorRows}
                                            blockTypes={blockTypes}
                                            onRowsChange={setConstructorRows}
                                            onAddExerciseRequest={(rowId) => {
                                                setTargetRowIdForPicker(rowId);
                                                setShowExercisePickerModal(true);
                                            }}
                                        />
                                    </div>

                                    {/* Notas — al final del formulario */}
                                    <div className="pt-6 border-t border-border">
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                            Notas de la Sesión
                                        </label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            placeholder="Instrucciones generales para la sesión..."
                                        />
                                    </div>
                                </div>

                                {showExercisePickerModal && (
                                    <ExercisePickerPanel
                                        isOpen={true}
                                        onClose={() => {
                                            setShowExercisePickerModal(false);
                                            setTargetRowIdForPicker(null);
                                        }}
                                        onSelect={handleSelectFromPicker}
                                        clientId={effectiveClientId ?? undefined}
                                        activeInjuries={clientActiveInjuries}
                                    />
                                )}
                            </div>
                </div>
                </form>
            </div>

            <DashboardFixedFooter>
                <div className="flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSaveAsTemplate}
                        disabled={isSavingTemplate}
                        isLoading={isSavingTemplate}
                    >
                        Guardar como Plantilla
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline-destructive"
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
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="create-session-form"
                            variant="primary"
                            size="sm"
                            disabled={
                                isCreatingSession ||
                                isCreatingStandalone ||
                                isSavingStandaloneExercises
                            }
                            isLoading={
                                isCreatingSession ||
                                isCreatingStandalone ||
                                isSavingStandaloneExercises
                            }
                            onClick={(e) => {
                                if (isCreatingSession || isCreatingStandalone || isSavingStandaloneExercises) return;
                                if (!effectiveClientId) {
                                    e.preventDefault();
                                    showWarning("Selecciona un cliente para continuar con la creación de la sesión");
                                    return;
                                }
                                const { valid, errors } = validateForm();
                                if (!valid) {
                                    e.preventDefault();
                                    setFormErrors(errors);
                                    showWarning("Completa todos los campos obligatorios antes de crear la sesión");
                                }
                            }}
                        >
                            Crear Sesión
                        </Button>
                    </div>
                </div>
            </DashboardFixedFooter>
        </>
    );
};
