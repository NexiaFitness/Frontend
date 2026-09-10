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
import { buildReviewNavigationState } from "@/lib/sessionDetailNavigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@nexia/shared/store";
import { trainingSessionsApi } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, Textarea, DatePickerButton } from "@/components/ui/forms";
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
import { exerciseDisplayName, useDefaultSessionName } from "@nexia/shared";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import { SessionDayContextPanel } from "@/components/sessions/SessionDayContextPanel";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import {
    applyExercisePickerSelection,
    getConstructorPersistLines,
    ConstructorValidationProvider,
    formatConstructorValidationToast,
    emptySessionCreatedToast,
} from "@/components/sessionProgramming/constructor";
import { useConstructorValidation } from "@/hooks/useConstructorValidation";
import { useScrollToConstructorValidationIssue } from "@/hooks/useScrollToConstructorValidationIssue";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { buildExercisePayloadFromLine } from "./buildExercisePayload";
import { aggregateConstructorRowsForSessionLoadDraft } from "./aggregateConstructorForSessionLoadDraft";
import { getPersistLinePlannedSets } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";
import { buildTemplatePayloadFromConstructorRows } from "./buildTemplatePayload";
import { SaveAsTemplateModal } from "@/components/sessionProgramming/SaveAsTemplateModal";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { BlockLevelMeter } from "@/components/trainingPlans/periodization/BlockLevelMeter";
import { ClientAvatar } from "@/components/ui/avatar";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import {
    SESSION_PROGRAMMING_BACK_BUTTON,
    SESSION_PROGRAMMING_CLIENT_BANNER,
    SESSION_PROGRAMMING_CLIENT_BANNER_SUBTITLE,
    SESSION_PROGRAMMING_CLIENT_BANNER_TEXT,
    SESSION_PROGRAMMING_CLIENT_SELECTOR,
    SESSION_PROGRAMMING_COPY,
    SESSION_PROGRAMMING_EMPTY_ACTION,
    SESSION_PROGRAMMING_EMPTY_DESCRIPTION,
    SESSION_PROGRAMMING_EMPTY_FOOTER,
    SESSION_PROGRAMMING_EMPTY_GLOW,
    SESSION_PROGRAMMING_EMPTY_SIDEBAR,
    SESSION_PROGRAMMING_EMPTY_TITLE,
    SESSION_PROGRAMMING_FIELD_CONTROL,
    SESSION_PROGRAMMING_FIELD_COMPACT,
    SESSION_PROGRAMMING_FIELD_ERROR,
    SESSION_PROGRAMMING_FIELD_HINT,
    SESSION_PROGRAMMING_FIELD_LABEL,
    SESSION_PROGRAMMING_FIELD_METER,
    SESSION_PROGRAMMING_FIELD_NAME,
    SESSION_PROGRAMMING_FIELD_NAME_SOLO,
    SESSION_PROGRAMMING_FIELD_PLAN,
    SESSION_PROGRAMMING_SESSION_FIELDS_GRID,
    SESSION_PROGRAMMING_FOOTER_ACTIONS,
    SESSION_PROGRAMMING_FOOTER_CANCEL,
    SESSION_PROGRAMMING_FOOTER_PRIMARY,
    SESSION_PROGRAMMING_FOOTER_ROW,
    SESSION_PROGRAMMING_FOOTER_SECONDARY,
    SESSION_PROGRAMMING_FOOTER_SHELL,
    SESSION_PROGRAMMING_FORM_SECTION,
    SESSION_PROGRAMMING_GLOW,
    SESSION_PROGRAMMING_HEADER,
    SESSION_PROGRAMMING_LOADING_ROW,
    SESSION_PROGRAMMING_LOWER_STACK,
    SESSION_PROGRAMMING_MAIN_GRID,
    SESSION_PROGRAMMING_MAIN_GRID_WITH_SIDEBAR,
    SESSION_PROGRAMMING_NOTES_SECTION,
    SESSION_PROGRAMMING_PAGE,
    SESSION_PROGRAMMING_SECTION_TITLE,
    SESSION_PROGRAMMING_SIDEBAR,
    SESSION_PROGRAMMING_FORM_STACK,
    SESSION_PROGRAMMING_STACK,
} from "@/components/sessionProgramming/sessionProgrammingPresentation";
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
    const dispatch = useDispatch<AppDispatch>();
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

    const nameTouchedRef = useRef(false);
    const defaultSessionName = useDefaultSessionName({
        clientId: effectiveClientId,
        trainerId,
        sessionDate: formData.sessionDate,
        isStandalone: useStandaloneSession,
        enabled: !!effectiveClientId && effectiveClientId > 0,
    });

    useEffect(() => {
        nameTouchedRef.current = false;
    }, [effectiveClientId]);

    useEffect(() => {
        if (nameTouchedRef.current) return;
        setFormData((prev) =>
            prev.sessionName === defaultSessionName
                ? prev
                : { ...prev, sessionName: defaultSessionName },
        );
    }, [defaultSessionName]);

    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

    /** Fase 4+7: Constructor por bloques */
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const constructorValidation = useConstructorValidation();
    const scrollToConstructorIssue = useScrollToConstructorValidationIssue();
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

    const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

    /** Guardar como plantilla — modal con nombre obligatorio (B15) */
    const handleSaveAsTemplate = async (payload: { templateName: string; description: string }) => {
        if (constructorRows.length > 0) {
            const ctorResult = constructorValidation.validate(constructorRows);
            if (!ctorResult.valid) {
                showWarning(formatConstructorValidationToast(ctorResult.issues), 6000);
                scrollToConstructorIssue(ctorResult.issues);
                return;
            }
        }
        const templatePayload = buildTemplatePayloadFromConstructorRows({
            constructorRows,
            sessionName: payload.templateName,
            sessionType: formData.sessionType,
            plannedDuration: formData.plannedDuration,
            notes: payload.description || formData.notes,
        });
        try {
            await createSessionTemplate(templatePayload).unwrap();
            showSuccess("Plantilla guardada correctamente", 2000);
            setShowSaveTemplateModal(false);
            setTimeout(() => navigate(-1), 1500);
        } catch {
            showError("Error al guardar la plantilla. Inténtalo de nuevo.");
        }
    };

    const validateForm = useCallback((): { valid: boolean; errors: CreateSessionFormErrors } => {
        const errors: CreateSessionFormErrors = {};
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
    }, [formData.sessionDate, formData.sessionType, useStandaloneSession, selectedPlanId]);

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

        if (constructorRows.length > 0) {
            const ctorResult = constructorValidation.validate(constructorRows);
            if (!ctorResult.valid) {
                showWarning(formatConstructorValidationToast(ctorResult.issues), 6000);
                scrollToConstructorIssue(ctorResult.issues);
                return;
            }
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

        const resolvedSessionName = formData.sessionName.trim() || defaultSessionName;

        try {
            if (useStandaloneSession) {
                // P2: Crear StandaloneSession (sesión libre) — ejercicios aplanados del Constructor
                const standaloneData = {
                    trainer_id: trainerId,
                    client_id: effectiveClientId,
                    session_date: formData.sessionDate,
                    session_name: resolvedSessionName,
                    session_type: formData.sessionType,
                    planned_duration: formData.plannedDuration ? Number(formData.plannedDuration) : null,
                    actual_duration: null,
                    status: "planned",
                    notes: formData.notes.trim() || null,
                };
                const created = await createStandaloneSession(standaloneData).unwrap();

                const flatExercises = constructorRows.flatMap((r) =>
                    getConstructorPersistLines(r).map((line) => ({
                        exercise_id: line.exercise.exerciseId,
                        planned_sets: getPersistLinePlannedSets(r, line),
                        planned_reps: convertPlannedReps(line.exercise.plannedReps ?? ""),
                        planned_weight: line.exercise.plannedWeight,
                        planned_assistance_kg: line.exercise.plannedAssistanceKg ?? null,
                        planned_rest: r.rest,
                        notes: line.exercise.notes,
                    }))
                );
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
                    showSuccess(emptySessionCreatedToast(true), 2000);
                }
                setTimeout(() => navigate(redirectTo), 1500);
            } else {
                // Fase 7: TrainingSession con bloques
                const sessionData: TrainingSessionCreate = {
                    training_plan_id: selectedPlanId!,
                    client_id: effectiveClientId,
                    trainer_id: trainerId,
                    session_name: resolvedSessionName,
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
                    showSuccess(emptySessionCreatedToast(false), 2000);
                }

                let coherenceForReview: SessionCoherence | null | undefined =
                    createdSession.coherence ?? null;
                if (constructorRows.length > 0) {
                    try {
                        coherenceForReview = await dispatch(
                            trainingSessionsApi.endpoints.getSessionCoherence.initiate(
                                createdSession.id,
                            ),
                        ).unwrap();
                    } catch {
                        coherenceForReview = createdSession.coherence ?? null;
                    }
                }

                navigate(
                    `/dashboard/session-programming/sessions/${createdSession.id}/review`,
                    { state: buildReviewNavigationState(location, coherenceForReview) },
                );
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

    const handleGoBack = () => {
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
    };

    if (isLoadingClient || isLoadingPlan || isLoadingPlans) {
        return (
            <div className={SESSION_PROGRAMMING_LOADING_ROW}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <div className={SESSION_PROGRAMMING_PAGE}>
                <div className={SESSION_PROGRAMMING_GLOW} aria-hidden />
                <div className={SESSION_PROGRAMMING_STACK}>
                <header className={SESSION_PROGRAMMING_HEADER}>
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={SESSION_PROGRAMMING_BACK_BUTTON}
                        onClick={handleGoBack}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                </header>

                {!resolvedClientId && !planId ? (
                    <div className={SESSION_PROGRAMMING_CLIENT_SELECTOR}>
                        <NexiaGlassAccentRim />
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
                    <div className={SESSION_PROGRAMMING_CLIENT_BANNER}>
                        <NexiaGlassAccentRim />
                        <ClientAvatar
                            clientId={effectiveClientId}
                            nombre={displayClient.nombre}
                            apellidos={displayClient.apellidos}
                            size="sm"
                        />
                        <div className="min-w-0">
                            <p className={SESSION_PROGRAMMING_CLIENT_BANNER_TEXT}>
                                {SESSION_PROGRAMMING_COPY.clientBannerPrefix}{" "}
                                {displayClient.nombre} {displayClient.apellidos}
                            </p>
                            <p className={SESSION_PROGRAMMING_CLIENT_BANNER_SUBTITLE}>
                                {SESSION_PROGRAMMING_COPY.createSubtitle}
                            </p>
                        </div>
                    </div>
                ) : null}

                <form id="create-session-form" onSubmit={handleSubmit} className={SESSION_PROGRAMMING_FORM_STACK}>
                <div
                    className={
                        effectiveClientId && useStandaloneSession
                            ? SESSION_PROGRAMMING_MAIN_GRID_WITH_SIDEBAR
                            : SESSION_PROGRAMMING_MAIN_GRID
                    }
                >
                    <section className={SESSION_PROGRAMMING_FORM_SECTION}>
                        <NexiaGlassAccentRim />
                        <h2 className={SESSION_PROGRAMMING_SECTION_TITLE}>
                            {SESSION_PROGRAMMING_COPY.sectionSessionData}
                        </h2>
                        <div className={SESSION_PROGRAMMING_SESSION_FIELDS_GRID}>
                                <div className={resolvedClientId ? SESSION_PROGRAMMING_FIELD_NAME : SESSION_PROGRAMMING_FIELD_NAME_SOLO}>
                                    <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                        Nombre de la sesión
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.sessionName}
                                        onChange={(e) => {
                                            nameTouchedRef.current = true;
                                            setFormData((prev) => ({ ...prev, sessionName: e.target.value }));
                                        }}
                                        placeholder="Ej: Fuerza — Tren superior A"
                                        className={cn(SESSION_PROGRAMMING_FIELD_CONTROL, "bg-surface")}
                                    />
                                    <p className={SESSION_PROGRAMMING_FIELD_HINT}>
                                        {SESSION_PROGRAMMING_COPY.nameHint}
                                    </p>
                                    {formErrors.sessionName ? (
                                        <p className={SESSION_PROGRAMMING_FIELD_ERROR}>{formErrors.sessionName}</p>
                                    ) : null}
                                </div>
                                {resolvedClientId ? (
                                <div className={SESSION_PROGRAMMING_FIELD_PLAN}>
                                <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                    Plan de Entrenamiento {!useStandaloneSession && "*"}
                                </label>
                                <div className={SESSION_PROGRAMMING_FIELD_CONTROL}>
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
                                            <FormCombobox
                                                value={selectedPlanId?.toString() || ""}
                                                onChange={(v) => setSelectedPlanId(v ? Number(v) : null)}
                                                options={[
                                                    { value: "", label: "Selecciona un plan" },
                                                    ...(clientPlans || []).map((p: TrainingPlanInstance) => ({
                                                        value: (p.source_plan_id ?? p.id).toString(),
                                                        label: `${p.name} (${p.status === "active" ? "Activo" : "Inactivo"})`,
                                                    })),
                                                ]}
                                                placeholder="Selecciona un plan"
                                                ariaLabel="Plan de entrenamiento"
                                            />
                                            {(clientPlans || []).length === 0 && resolvedClientId ? (
                                                <p className={SESSION_PROGRAMMING_FIELD_ERROR}>
                                                    Este cliente no tiene planes disponibles. Crea un plan para poder programar sesiones.
                                                </p>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                                    {!useStandaloneSession ? (
                                        <p className={SESSION_PROGRAMMING_FIELD_HINT}>
                                            {SESSION_PROGRAMMING_COPY.planHint}
                                        </p>
                                    ) : null}
                                </div>
                                ) : null}

                                <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                    <label htmlFor="create-session-date" className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                        Fecha *
                                    </label>
                                    <div className={SESSION_PROGRAMMING_FIELD_CONTROL}>
                                        <DatePickerButton
                                            label="Seleccionar fecha"
                                            value={formData.sessionDate}
                                            onChange={(v) => setFormData({ ...formData, sessionDate: v })}
                                            variant="form"
                                        />
                                    </div>
                                </div>
                                <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                    <label htmlFor="create-session-type" className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                        Tipo *
                                    </label>
                                    <div className={SESSION_PROGRAMMING_FIELD_CONTROL}>
                                        <FormCombobox
                                            id="create-session-type"
                                            value={formData.sessionType}
                                            onChange={(v) => setFormData((prev) => ({ ...prev, sessionType: v }))}
                                            options={SESSION_TYPES}
                                            placeholder="Selecciona tipo"
                                            ariaLabel="Tipo de sesión"
                                        />
                                    </div>
                                </div>
                                <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                    <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                        Duración (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) => setFormData({ ...formData, plannedDuration: e.target.value })}
                                        placeholder="60"
                                        className={cn(SESSION_PROGRAMMING_FIELD_CONTROL, "max-w-[7rem] bg-surface lg:max-w-none")}
                                    />
                                </div>

                                <div className={SESSION_PROGRAMMING_FIELD_METER}>
                                    <BlockLevelMeter
                                        id="create-session-volume"
                                        tone="volume"
                                        prefix="Volumen"
                                        level={formData.plannedVolume ? Number(formData.plannedVolume) : 5}
                                        hint={sliderValueNote}
                                        onChange={(v) => {
                                            setVolumeIntensityTouched(true);
                                            setFormData({ ...formData, plannedVolume: String(v) });
                                        }}
                                    />
                                </div>
                                <div className={SESSION_PROGRAMMING_FIELD_METER}>
                                    <BlockLevelMeter
                                        id="create-session-intensity"
                                        tone="intensity"
                                        prefix="Intensidad"
                                        level={formData.plannedIntensity ? Number(formData.plannedIntensity) : 5}
                                        hint={sliderValueNote}
                                        onChange={(v) => {
                                            setVolumeIntensityTouched(true);
                                            setFormData((prev) => ({ ...prev, plannedIntensity: String(v) }));
                                        }}
                                    />
                                </div>
                        </div>
                    </section>

                    {effectiveClientId != null && effectiveClientId > 0 && useStandaloneSession ? (
                    <aside className={SESSION_PROGRAMMING_SIDEBAR}>
                                <div className={SESSION_PROGRAMMING_EMPTY_SIDEBAR}>
                                    <div className={SESSION_PROGRAMMING_EMPTY_GLOW} aria-hidden />
                                    <div className="relative z-[1] py-2 text-center">
                                        <div className="mx-auto mb-3 text-muted-foreground/50 [&>svg]:h-8 [&>svg]:w-8">
                                            <ClipboardList aria-hidden />
                                        </div>
                                        <p className={SESSION_PROGRAMMING_EMPTY_TITLE}>Sin plan asignado</p>
                                        <p className={SESSION_PROGRAMMING_EMPTY_DESCRIPTION}>
                                            Este cliente no tiene un plan de entrenamiento activo.
                                        </p>
                                        <div className={SESSION_PROGRAMMING_EMPTY_ACTION}>
                                            <Button
                                                type="button"
                                                variant="outline-primary"
                                                size="sm"
                                                className="w-full"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/training-plans/create?clientId=${effectiveClientId}`,
                                                        { state: { from: location.pathname } },
                                                    )
                                                }
                                            >
                                                <ClipboardList className="mr-2 h-3.5 w-3.5" aria-hidden />
                                                Crear plan
                                            </Button>
                                        </div>
                                        <p className={cn(SESSION_PROGRAMMING_EMPTY_FOOTER, "mt-3")}>
                                            Puedes continuar sin plan y crear la sesión libremente.
                                        </p>
                                    </div>
                                </div>
                    </aside>
                    ) : null}
                </div>

                <div className={SESSION_PROGRAMMING_LOWER_STACK}>
                            {effectiveClientId && !useStandaloneSession ? (
                                <SessionDayContextPanel
                                    layout="hero"
                                    clientId={effectiveClientId}
                                    sessionDate={formData.sessionDate}
                                    trainerId={trainerId}
                                />
                            ) : null}

                            {/* Alerta lesiones activas — solo cuando hay cliente seleccionado */}
                            {effectiveClientId && hasActiveInjuries && displayClient && (
                                <Alert variant="warning">
                                    Atención: {displayClient.nombre} {displayClient.apellidos} tiene lesiones activas (
                                    {clientActiveInjuries.map((i) => i.joint_name_es || i.joint_name).filter(Boolean).join(", ") || "ver ficha del cliente"}
                                    ). Los ejercicios contraindicados están marcados en la lista.
                                </Alert>
                            )}

                            {/* Recomendaciones de plan (Lovable) — solo cuando hay cliente asignado */}
                            {effectiveClientId ? (
                                <>
                                    <WeeklyClientVolumePanel
                                        weekLabel={weeklyVolumePanel.weekLabel}
                                        rows={weeklyVolumePanel.rows}
                                        isLoading={weeklyVolumePanel.isLoading}
                                        isError={weeklyVolumePanel.isError}
                                        hasClient={weeklyVolumePanel.hasClient}
                                        intent={weeklyVolumePanel.intent}
                                        usesDraftProjection={weeklyVolumePanel.usesDraftProjection}
                                        weeklyTarget={weeklyVolumePanel.weeklyTarget}
                                        unmappedExercises={weeklyVolumePanel.unmappedExercises}
                                    />
                                </>
                            ) : null}

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
                                <ConstructorValidationProvider
                                    issuesByKey={constructorValidation.issuesByKey}
                                    onClearField={constructorValidation.clearFieldError}
                                >
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
                                </ConstructorValidationProvider>
                            </div>

                            <section className={SESSION_PROGRAMMING_NOTES_SECTION}>
                                <NexiaGlassAccentRim />
                                <h2 className={SESSION_PROGRAMMING_SECTION_TITLE}>
                                    {SESSION_PROGRAMMING_COPY.sectionNotes}
                                </h2>
                                <label className={cn(SESSION_PROGRAMMING_FIELD_LABEL, "sr-only")}>
                                    Notas de la Sesión
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="mt-1.5"
                                    placeholder="Instrucciones generales para la sesión..."
                                />
                            </section>
                </div>
                </form>
                </div>
            </div>

            <DashboardFixedFooter className={SESSION_PROGRAMMING_FOOTER_SHELL}>
                <div className={SESSION_PROGRAMMING_FOOTER_ROW}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className={SESSION_PROGRAMMING_FOOTER_SECONDARY}
                        onClick={() => setShowSaveTemplateModal(true)}
                        disabled={isSavingTemplate}
                    >
                        Guardar como Plantilla
                    </Button>
                    <div className={SESSION_PROGRAMMING_FOOTER_ACTIONS}>
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            className={SESSION_PROGRAMMING_FOOTER_CANCEL}
                            onClick={handleGoBack}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="create-session-form"
                            variant="primary"
                            size="sm"
                            className={SESSION_PROGRAMMING_FOOTER_PRIMARY}
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

            <SaveAsTemplateModal
                isOpen={showSaveTemplateModal}
                onClose={() => setShowSaveTemplateModal(false)}
                onConfirm={handleSaveAsTemplate}
                isLoading={isSavingTemplate}
            />
        </>
    );
};
