/**
 * CreateSession.tsx — Página para crear sesión manual
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión manualmente
 * - Soporta: ?clientId=X (desde cliente) o ?planId=X (desde plan)
 * - Uso embebido: clientIdProp + returnToPath + backPath desde contexto cliente (navegación directa).
 * - Añadir ejercicio: botón abre ExercisePickerPanel (panel lateral, lista por letra)
 * - P2: Si no hay plan activo para la fecha seleccionada → StandaloneSession (sesión libre)
 *
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.4.0 - Panel lateral ExercisePickerPanel (reemplaza modal)
 * @updated Fase 1 U4 - Props opcionales para contexto cliente (no salir del cliente)
 * @updated Fase 3 - Coherencia tras crear: avisos en pantalla + Entendido, luego redirigir
 * @updated P2 - StandaloneSession cuando no hay plan activo en la fecha
 * @updated 2026-03-24 - Adaptado para TrainingPlanInstance[]
 *   Usa instance.source_plan_id para crear sesiones (training_plan_id)
 *   El selector muestra instances pero usa source_plan_id como value
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";
import { usePreserveDashboardScrollOnConstructorPicker } from "@/hooks/usePreserveDashboardScrollOnConstructorPicker";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormSelect, FormCombobox, Textarea, Slider, DatePickerButton } from "@/components/ui/forms";
import { useGetClientQuery, useGetClientTrainingPlansQuery, useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanQuery, useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
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
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { SessionMovementPatternsCard } from "@/components/sessions/SessionMovementPatternsCard";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import {
    applyExercisePickerSelection,
    getConstructorPersistLines,
} from "@/components/sessionProgramming/constructor";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { buildExercisePayloadFromLine } from "./buildExercisePayload";
import { aggregateConstructorRowsForSessionLoadDraft } from "./aggregateConstructorForSessionLoadDraft";
import { getRowVolumeSetsPerExercise } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";
import { buildTemplatePayloadFromConstructorRows } from "./buildTemplatePayload";
import { ArrowLeft, ClipboardList, Flame, Gauge } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { EmptyStateCard } from "@/components/ui/cards";
import { PageTitle } from "@/components/dashboard/shared";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import { WeeklyClientVolumePanel } from "@/components/sessionProgramming/WeeklyClientVolumePanel";
import { AxialLoadBar } from "@/components/sessionProgramming/AxialLoadBar";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import { useWeeklyClientVolumePanel } from "@nexia/shared/hooks/sessionProgramming/useWeeklyClientVolumePanel";
import { useSessionVolumeIntensityPrefill } from "@nexia/shared/hooks/sessionProgramming/useSessionVolumeIntensityPrefill";
import { getVolumeIntensityPrefillSourceLabel } from "@nexia/shared/training/sessionVolumeIntensityPrefill";
import type { RootState } from "@nexia/shared/store";
import type {
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    TrainingSessionCreate,
} from "@nexia/shared/types/trainingSessions";
import type { TrainingPlanInstance } from "@nexia/shared/types/training";
import type { TrainingPlanRecommendationsComplete } from "@nexia/shared/types/trainingRecommendations";
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

    useScrollDashboardWhenReady(
        !isLoadingClient && !isLoadingPlan && !isLoadingPlans,
    );

    // Estado para el plan seleccionado (si se elige manualmente o se autoselecciona)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(planId);

    // Autoseleccionar plan si solo hay uno activo
    // Usar source_plan_id para crear sesiones (training_plan_id espera el Plan ID, no Instance ID)
    useEffect(() => {
        if (!planId && clientPlans && clientPlans.length > 0) {
            const activePlans = clientPlans.filter((p) => p.status === "active");
            if (activePlans.length === 1) {
                setSelectedPlanId(activePlans[0].source_plan_id ?? activePlans[0].id);
            } else if (activePlans.length === 0 && clientPlans.length === 1) {
                const plan = clientPlans[0];
                setSelectedPlanId(plan.source_plan_id ?? plan.id);
            }
        }
    }, [clientPlans, planId]);

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

    // Recomendaciones de plan (tarjetas Lovable + panel volumen semanal)
    const { data: recommendationsData } = useGetTrainingPlanRecommendationsQuery(
        { clientId: effectiveClientId ?? 0 },
        { skip: !effectiveClientId || effectiveClientId <= 0 }
    );

    // Cliente a mostrar (prioridad: cliente directo > cliente del plan)
    const displayClient = client || planClient;

    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: dateFromQuery || new Date().toISOString().split("T")[0],
        sessionType: "strength",
        plannedDuration: "60",
        plannedIntensity: "5",
        plannedVolume: "5",
        notes: "",
    });

    const [volumeIntensityTouched, setVolumeIntensityTouched] = useState(false);

    const prefillApplied = useRef<{ clientId: number; duration: boolean } | null>(null);

    useEffect(() => {
        setVolumeIntensityTouched(false);
    }, [effectiveClientId]);

    useEffect(() => {
        if (!effectiveClientId || effectiveClientId <= 0) {
            prefillApplied.current = null;
            return;
        }
        if (prefillApplied.current?.clientId !== effectiveClientId) {
            prefillApplied.current = { clientId: effectiveClientId, duration: false };
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

        if (Object.keys(updates).length > 0) {
            setFormData((prev) => ({ ...prev, ...updates }));
        }
    }, [effectiveClientId, displayClient]);

    const volumeIntensityPrefill = useSessionVolumeIntensityPrefill({
        clientId: effectiveClientId,
        sessionDate: formData.sessionDate,
        trainerId,
        enabled: !!effectiveClientId && effectiveClientId > 0,
    });

    useEffect(() => {
        if (volumeIntensityTouched || volumeIntensityPrefill.isLoading) return;
        setFormData((prev) => ({
            ...prev,
            plannedVolume: String(volumeIntensityPrefill.volume),
            plannedIntensity: String(volumeIntensityPrefill.intensity),
        }));
    }, [
        volumeIntensityTouched,
        volumeIntensityPrefill.isLoading,
        volumeIntensityPrefill.volume,
        volumeIntensityPrefill.intensity,
        formData.sessionDate,
        effectiveClientId,
    ]);

    // Hook de mutación para crear sesión
    const [createTrainingSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();
    const [createStandaloneSession, { isLoading: isCreatingStandalone }] = useCreateStandaloneSessionMutation();
    const [createStandaloneExercise, { isLoading: isSavingStandaloneExercises }] = useCreateStandaloneSessionExerciseMutation();

    const volumeRecComplete =
        recommendationsData?.status === "complete"
            ? (recommendationsData as TrainingPlanRecommendationsComplete)
            : null;
    const volumeMaxSets = volumeRecComplete?.recommendations.volume.max_sets;
    const sliderValueNote = !volumeIntensityTouched
        ? getVolumeIntensityPrefillSourceLabel(volumeIntensityPrefill.source)
        : undefined;

    const plannedVolumeInt = Math.min(
        10,
        Math.max(1, Math.round(Number(formData.plannedVolume) || 5))
    );

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
    const useStandaloneSession = !planId && !!resolvedClientId && !isLoadingPlans && !hasActivePlanForDate;

    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

    /** Fase 4+7: Constructor por bloques */
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);
    const [targetExerciseSlotId, setTargetExerciseSlotId] = useState<string | null>(null);

    const { captureBeforePickerChange } = usePreserveDashboardScrollOnConstructorPicker(
        showExercisePickerModal,
        targetRowIdForPicker
    );

    const handleAddExerciseRequest = useCallback(
        (rowId: string, exerciseSlotId?: string) => {
            captureBeforePickerChange(rowId);
            setTargetRowIdForPicker(rowId);
            setTargetExerciseSlotId(exerciseSlotId ?? null);
            setShowExercisePickerModal(true);
        },
        [captureBeforePickerChange]
    );

    const draftExercisesForVolumePanel = useMemo(
        () => aggregateConstructorRowsForSessionLoadDraft(constructorRows),
        [constructorRows]
    );

    const weeklyVolumePanel = useWeeklyClientVolumePanel({
        clientId: effectiveClientId,
        sessionDateYmd: formData.sessionDate,
        plannedVolume1to10: plannedVolumeInt,
        recommendationsComplete: recommendationsData?.status === "complete",
        volumeMaxSets,
        includeStandalone: true,
        draftExercises: draftExercisesForVolumePanel,
        intent: "create_session",
    });

    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const [createSessionBlock] = useCreateSessionBlockMutation();
    const [createSessionBlockExercise] = useCreateSessionBlockExerciseMutation();
    const [createSessionTemplate, { isLoading: isSavingTemplate }] = useCreateSessionTemplateMutation();

    /** Fase 4: Añadir ejercicio seleccionado a la fila del Constructor */
    const handleSelectFromPicker = (exercise: Exercise) => {
        if (!targetRowIdForPicker) return;
        setConstructorRows((prev) =>
            applyExercisePickerSelection(
                prev,
                targetRowIdForPicker,
                { id: exercise.id, name: exerciseDisplayName(exercise) },
                targetExerciseSlotId
            )
        );
        setShowExercisePickerModal(false);
        setTargetRowIdForPicker(null);
        setTargetExerciseSlotId(null);
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
            `/dashboard/clients/${effectiveClientId}?tab=sessions`;

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

                const flatExercises = constructorRows.flatMap((r) => {
                    const planned_sets = getRowVolumeSetsPerExercise(r);
                    return r.exercises
                        .filter((ex) => ex.exerciseId > 0)
                        .map((ex) => ({
                            exercise_id: ex.exerciseId,
                            planned_sets,
                            planned_reps: convertPlannedReps(ex.plannedReps ?? ""),
                            planned_weight: ex.plannedWeight,
                            planned_rest: r.rest,
                            notes: ex.notes,
                        }));
                });
                let order = 0;
                const flatWithOrder = flatExercises.map((ex) => ({
                    ...ex,
                    order_in_session: ++order,
                }));

                if (flatWithOrder.length > 0) {
                    let savedCount = 0;
                    for (const ex of flatWithOrder) {
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
                                rounds: getBlockRoundsFromConstructorRow(row),
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

                            const persistable = getConstructorPersistLines(row);
                            for (let j = 0; j < persistable.length; j++) {
                                const line = persistable[j];
                                try {
                                    const payload = buildExercisePayloadFromLine(row, line);
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
                    const totalEx = constructorRows.reduce(
                        (s, r) => s + getConstructorPersistLines(r).length,
                        0
                    );
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

                navigate(`/dashboard/session-programming/sessions/${createdSession.id}/review`, {
                    state: { returnTo: "/dashboard/sessions", clientId: effectiveClientId },
                });
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

    return (
        <>
            <div className="space-y-6 pb-24">
                {/* Header + Volver — mismo patrón que dashboard */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageTitle title="Nueva Sesión" />
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
                                                    // Usar source_plan_id como value para crear sesiones correctamente
                                                    ...(clientPlans || []).map((p: TrainingPlanInstance) => ({
                                                        value: (p.source_plan_id ?? p.id).toString(),
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
                                    />
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
                                        valueNote={sliderValueNote}
                                        onChange={(v) => {
                                            setVolumeIntensityTouched(true);
                                            setFormData({ ...formData, plannedVolume: String(v) });
                                        }}
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
                                        valueNote={sliderValueNote}
                                        onChange={(v) => {
                                            setVolumeIntensityTouched(true);
                                            setFormData((prev) => ({ ...prev, plannedIntensity: String(v) }));
                                        }}
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
                                    {clientActiveInjuries.map((i) => i.joint_name_es || i.joint_name).filter(Boolean).join(", ") || "ver ficha del cliente"}
                                    ). Los ejercicios contraindicados están marcados en la lista.
                                </Alert>
                            )}

                            {/* Recomendaciones de plan (Lovable) — solo cuando hay cliente asignado */}
                            {effectiveClientId && (
                                <>
                                    <RecommendationsCards clientId={effectiveClientId} />
                                    <WeeklyClientVolumePanel
                                        weekLabel={weeklyVolumePanel.weekLabel}
                                        rows={weeklyVolumePanel.rows}
                                        isLoading={weeklyVolumePanel.isLoading}
                                        isError={weeklyVolumePanel.isError}
                                        hasClient={weeklyVolumePanel.hasClient}
                                        intent={weeklyVolumePanel.intent}
                                        usesDraftProjection={weeklyVolumePanel.usesDraftProjection}
                                        weeklyTarget={weeklyVolumePanel.weeklyTarget}
                                    />
                                    <SessionMovementPatternsCard
                                        clientId={effectiveClientId}
                                        sessionDate={formData.sessionDate}
                                        trainerId={trainerId}
                                    />
                                </>
                            )}

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
                                    onAddExerciseRequest={handleAddExerciseRequest}
                                    titleAccessory={
                                        constructorRows.length > 0 ? (
                                            <AxialLoadBar axialScore={weeklyVolumePanel.axialScore} />
                                        ) : undefined
                                    }
                                    activePickerRowId={targetRowIdForPicker}
                                    exercisePickerPanel={
                                        showExercisePickerModal ? (
                                            <ExercisePickerPanel
                                                mode="inline"
                                                isOpen={true}
                                                onClose={() => {
                                                    setShowExercisePickerModal(false);
                                                    setTargetRowIdForPicker(null);
                                                }}
                                                onSelect={handleSelectFromPicker}
                                                clientId={effectiveClientId ?? undefined}
                                                activeInjuries={clientActiveInjuries}
                                            />
                                        ) : null
                                    }
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
                </form>
            </div>

            {/* Barra inferior fija — pegada al bottom, respeta sidebar vía --sidebar-width */}
            <div
                className="fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4 pb-[env(safe-area-inset-bottom)]"
                style={{ left: "var(--sidebar-width, 0)" }}
            >
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
            </div>

        </>
    );
};
