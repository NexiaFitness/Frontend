/**
 * EditSession.tsx — Página para editar sesión de entrenamiento
 *
 * Contexto:
 * - Vista protegida (solo trainers) para editar sesión existente
 * - Permite modificar todos los detalles de la sesión
 * - Redirige al plan después de actualizar
 * - Fase 8: Constructor por bloques con diff create/update/delete
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";
import { usePreserveDashboardScrollOnConstructorPicker } from "@/hooks/usePreserveDashboardScrollOnConstructorPicker";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, Textarea, DatePickerButton } from "@/components/ui/forms";
import { useGetClientQuery, useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetWeeklyStructureQuery } from "@nexia/shared/api/weeklyStructureApi";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionFullMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import type {
    TrainingSessionUpdate,
} from "@nexia/shared/types/trainingSessions";
import {
    useGetSessionBlocksQuery,
    useGetTrainingBlockTypesQuery,
} from "@nexia/shared/api/sessionProgrammingApi";
import { sessionProgrammingApi } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import {
    exerciseDisplayName,
    normalizeSessionName,
    useDefaultSessionName,
    listStructureDriftPlannedSessionIds,
} from "@nexia/shared";
import { formatLocalDateOnly } from "@nexia/shared/training/activePeriodBlock";
import {
    STRUCTURE_DRIFT_EDIT_BANNER_BODY,
    STRUCTURE_DRIFT_EDIT_BANNER_TITLE,
} from "@/components/trainingPlans/periodization/structureDriftPresentation";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import type { AppDispatch, RootState } from "@nexia/shared/store";
import { SessionDayContextPanel } from "@/components/sessions/SessionDayContextPanel";
import { ClientAvatar } from "@/components/ui/avatar";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";

import type {
    ConstructorRow,
    ConstructorExercise,
    RepsTipo,
} from "@/components/sessionProgramming/constructorTypes";
import {
    buildExercisePayloadFromLine,
} from "./buildExercisePayload";
import {
    applyExercisePickerSelection,
    getConstructorPersistLines,
    ConstructorValidationProvider,
    formatConstructorValidationToast,
    hydrateSingleSetConstructorRow,
    canHydrateDropsetApiLines,
    hydrateDropsetConstructorRow,
    isCollapsedSingleSetApiLines,
    normalizeSupersetRow,
    normalizeSingleSetRow,
    normalizeDropsetRow,
    normalizeGiantSetRow,
    normalizeForTimeRow,
    normalizeEmomRow,
    hydrateEmomConstructorRow,
    normalizeAmrapRow,
    hydrateSupersetConstructorRow,
    hydrateGiantSetConstructorRow,
    hydrateForTimeConstructorRow,
} from "@/components/sessionProgramming/constructor";
import { aggregateConstructorRowsForSessionLoadDraft } from "./aggregateConstructorForSessionLoadDraft";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    SET_TYPE,
    type SessionBlockExercise,
} from "@nexia/shared/types/sessionProgramming";
import { ArrowLeft, ChevronRight, ClipboardList } from "lucide-react";
import { buildReviewNavigationState } from "@/lib/sessionDetailNavigation";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { BlockLevelMeter } from "@/components/trainingPlans/periodization/BlockLevelMeter";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    SESSION_PROGRAMMING_BACK_BUTTON,
    SESSION_PROGRAMMING_CLIENT_BANNER,
    SESSION_PROGRAMMING_CLIENT_BANNER_SUBTITLE,
    SESSION_PROGRAMMING_CLIENT_BANNER_TEXT,
    SESSION_PROGRAMMING_COPY,
    SESSION_PROGRAMMING_EMPTY_ACTION,
    SESSION_PROGRAMMING_EMPTY_DESCRIPTION,
    SESSION_PROGRAMMING_EMPTY_FOOTER,
    SESSION_PROGRAMMING_EMPTY_GLOW,
    SESSION_PROGRAMMING_EMPTY_SIDEBAR,
    SESSION_PROGRAMMING_EMPTY_TITLE,
    SESSION_PROGRAMMING_FIELD_COMPACT,
    SESSION_PROGRAMMING_FIELD_CONTROL,
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
    SESSION_PROGRAMMING_FORM_STACK,
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
    SESSION_PROGRAMMING_STACK,
} from "@/components/sessionProgramming/sessionProgrammingPresentation";
import { WeeklyClientVolumePanel } from "@/components/sessionProgramming/WeeklyClientVolumePanel";
import { useWeeklyClientVolumePanel } from "@nexia/shared/hooks/sessionProgramming/useWeeklyClientVolumePanel";
import { useSessionVolumeIntensityPrefill } from "@nexia/shared/hooks/sessionProgramming/useSessionVolumeIntensityPrefill";
import { getVolumeIntensityPrefillSourceLabel } from "@nexia/shared/training/sessionVolumeIntensityPrefill";
import { AxialLoadBar } from "@/components/sessionProgramming/AxialLoadBar";
import type { TrainingPlanRecommendationsComplete } from "@nexia/shared/types/trainingRecommendations";
import { SESSION_TYPES } from "./sessionFormConstants";
import { useConstructorValidation } from "@/hooks/useConstructorValidation";
import { useScrollToConstructorValidationIssue } from "@/hooks/useScrollToConstructorValidationIssue";

/** Escala 1–10 del slider; el API a veces devuelve floats o valores fuera de rango. */
function clampIntSlider1to10(value: unknown, fallback: number): string {
    const n = Number(value);
    if (Number.isNaN(n)) return String(fallback);
    return String(Math.min(10, Math.max(1, Math.round(n))));
}

function sliderDisplay1to10(raw: string, fallback: number): number {
    const n = Math.round(Number(raw));
    if (Number.isNaN(n)) return fallback;
    return Math.min(10, Math.max(1, n));
}

export const EditSession: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;
    const { showSuccess, showError, showWarning } = useToast();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });

    const trainerId = trainerProfile?.id ?? 0;

    // Cargar sesión
    const { 
        data: session, 
        isLoading: isLoadingSession, 
        isError: isErrorSession 
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    useScrollDashboardWhenReady(!isLoadingSession && !!session);

    // Cargar plan y cliente
    const { data: plan } = useGetTrainingPlanQuery(
        session?.training_plan_id || 0, 
        { skip: !session?.training_plan_id }
    );
    const { data: client } = useGetClientQuery(session?.client_id ?? 0, {
        skip: !session?.client_id,
    });
    const { activeInjuries: clientActiveInjuries = [], hasActiveInjuries } = useClientInjuries({
        clientId: session?.client_id ?? 0,
        includeHistory: false,
    });

    const { data: editRecommendationsData } = useGetTrainingPlanRecommendationsQuery(
        { clientId: session?.client_id ?? 0 },
        { skip: !session?.client_id }
    );

    // Hook de mutación atómica para actualizar sesión completa
    const [updateTrainingSessionFull, { isLoading: isUpdatingSessionFull }] =
        useUpdateTrainingSessionFullMutation();

    // Estado de guardado local (cubre todo el proceso, no solo la mutación)
    const [isSaving, setIsSaving] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionType: "training",
        plannedDuration: "",
        plannedIntensity: "",
        plannedVolume: "",
        notes: "",
    });

    const [originalSessionDate, setOriginalSessionDate] = useState<string | null>(null);
    const [volumeIntensityTouched, setVolumeIntensityTouched] = useState(false);

    const volumeIntensityPrefill = useSessionVolumeIntensityPrefill({
        clientId: session?.client_id,
        sessionDate: formData.sessionDate,
        trainerId,
        enabled: !!session?.client_id && trainerId > 0,
    });

    const shouldApplyVolumeIntensityPrefill =
        !volumeIntensityTouched &&
        originalSessionDate != null &&
        formData.sessionDate !== originalSessionDate;

    useEffect(() => {
        if (!shouldApplyVolumeIntensityPrefill || volumeIntensityPrefill.isLoading) return;
        setFormData((prev) => ({
            ...prev,
            plannedVolume: String(volumeIntensityPrefill.volume),
            plannedIntensity: String(volumeIntensityPrefill.intensity),
        }));
    }, [
        shouldApplyVolumeIntensityPrefill,
        volumeIntensityPrefill.isLoading,
        volumeIntensityPrefill.volume,
        volumeIntensityPrefill.intensity,
    ]);

    const editSliderValueNote =
        !volumeIntensityTouched && shouldApplyVolumeIntensityPrefill
            ? getVolumeIntensityPrefillSourceLabel(volumeIntensityPrefill.source)
            : undefined;

    const editVolumeRecComplete =
        editRecommendationsData?.status === "complete"
            ? (editRecommendationsData as TrainingPlanRecommendationsComplete)
            : null;
    const editVolumeMaxSets = editVolumeRecComplete?.recommendations.volume.max_sets;
    const editPlannedVolumeInt = sliderDisplay1to10(formData.plannedVolume, 5);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const nameTouchedRef = useRef(false);
    const sessionUsesAutoNameRef = useRef(false);

    const isStandaloneSession = !session?.training_plan_id;

    const defaultSessionName = useDefaultSessionName({
        clientId: session?.client_id,
        trainerId,
        sessionDate: formData.sessionDate,
        isStandalone: isStandaloneSession,
        enabled: !!session?.client_id && trainerId > 0,
    });

    useEffect(() => {
        if (!session || !originalSessionDate || formData.sessionDate !== originalSessionDate) return;
        if (nameTouchedRef.current) return;
        sessionUsesAutoNameRef.current =
            normalizeSessionName(session.session_name || "") ===
            normalizeSessionName(defaultSessionName);
    }, [session, originalSessionDate, defaultSessionName, formData.sessionDate]);

    useEffect(() => {
        if (!sessionUsesAutoNameRef.current || nameTouchedRef.current) return;
        setFormData((prev) =>
            prev.sessionName === defaultSessionName
                ? prev
                : { ...prev, sessionName: defaultSessionName },
        );
    }, [defaultSessionName]);


    /** Fase 8: Constructor por bloques */
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const constructorValidation = useConstructorValidation();
    const scrollToConstructorIssue = useScrollToConstructorValidationIssue();
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);
    const [targetExerciseSlotId, setTargetExerciseSlotId] = useState<string | null>(null);
    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

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
        clientId: session?.client_id,
        sessionDateYmd: formData.sessionDate,
        plannedVolume1to10: editPlannedVolumeInt,
        recommendationsComplete: editRecommendationsData?.status === "complete",
        volumeMaxSets: editVolumeMaxSets,
        excludeTrainingSessionId: sessionId > 0 ? sessionId : undefined,
        includeStandalone: true,
        draftExercises: draftExercisesForVolumePanel,
        intent: "edit_session",
    });

    const { data: periodBlocks = [] } = useGetPeriodBlocksQuery(
        session?.training_plan_id ?? 0,
        { skip: !session?.training_plan_id },
    );
    const periodBlockMeta = useMemo(
        () =>
            periodBlocks.find((b) => b.id === session?.period_block_id) ?? null,
        [periodBlocks, session?.period_block_id],
    );
    const { data: weeklyStructureForDrift } = useGetWeeklyStructureQuery(
        {
            planId: session?.training_plan_id ?? 0,
            blockId: session?.period_block_id ?? 0,
        },
        {
            skip: !session?.training_plan_id || !session?.period_block_id,
        },
    );
    const { data: clientProgramSessions = [] } = useGetClientTrainingSessionsQuery(
        { clientId: session?.client_id ?? 0, skip: 0, limit: 1000 },
        { skip: !session?.client_id },
    );

    const showStructureDriftBanner = useMemo(() => {
        if (!session?.id || !periodBlockMeta || !weeklyStructureForDrift?.weeks) {
            return false;
        }
        const driftIds = listStructureDriftPlannedSessionIds(
            clientProgramSessions.map((s) => ({
                id: s.id,
                session_date: s.session_date,
                status: s.status,
                period_block_id: s.period_block_id ?? null,
            })),
            {
                id: periodBlockMeta.id,
                start_date: periodBlockMeta.start_date,
                end_date: periodBlockMeta.end_date,
            },
            weeklyStructureForDrift.weeks,
            formatLocalDateOnly(new Date()),
        );
        return driftIds.includes(session.id);
    }, [
        session?.id,
        periodBlockMeta,
        weeklyStructureForDrift?.weeks,
        clientProgramSessions,
    ]);


    const dispatch = useDispatch<AppDispatch>();
    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const { data: exercisesData } = useGetExercisesQuery({ skip: 0, limit: 1000 });
    const { data: blocks = [], isLoading: isLoadingSessionBlocks } = useGetSessionBlocksQuery(
        sessionId,
        {
            skip: !sessionId || isNaN(sessionId),
        },
    );


    /** Al cambiar de sesión, vaciar constructor hasta que lleguen los bloques (evita mezclar sesiones). */
    useEffect(() => {
        setConstructorRows([]);
    }, [sessionId]);

    /**
     * Hidratar constructor desde API: orden de bloques y ejercicios como en backend.
     * Si la sesión no tiene bloques, el constructor queda vacío (p. ej. sesión solo con cabecera).
     */
    useEffect(() => {
        if (!sessionId || isNaN(sessionId)) return;
        if (isLoadingSessionBlocks) return;

        if (blocks.length === 0) {
            setConstructorRows([]);
            return;
        }

        const sortedBlocks = [...blocks].sort((a, b) => a.order_in_session - b.order_in_session);

        let cancelled = false;

        const load = async () => {
            const exercisesByBlock: Record<number, SessionBlockExercise[]> = {};

            for (const b of sortedBlocks) {
                const result = await dispatch(
                    sessionProgrammingApi.endpoints.getSessionBlockExercises.initiate(b.id),
                );
                if ("data" in result && result.data) {
                    exercisesByBlock[b.id] = [...result.data].sort(
                        (x, y) => x.order_in_block - y.order_in_block,
                    );
                }
            }

            if (cancelled) return;

            const inferRepsTipo = (
                ex: { planned_reps: string | null; planned_duration: number | null },
            ): RepsTipo => {
                if (ex.planned_duration != null && !ex.planned_reps?.trim()) return "tiempo";
                return "reps";
            };

            const rows: ConstructorRow[] = sortedBlocks.map((b, i) => {
                const exs = exercisesByBlock[b.id] ?? [];
                const firstEx = exs[0];
                const setType =
                    (b.set_type as ConstructorRow["setType"]) ?? SET_TYPE.SINGLE_SET;

                const base: ConstructorRow = {
                    id: `row-${b.id}-${i}`,
                    serverBlockId: b.id,
                    blockTypeId: b.block_type_id,
                    setType,
                    sets: exs[0]?.planned_sets ?? null,
                    rounds: b.rounds,
                    timeCap: b.time_cap,
                    intervalSeconds: b.interval_seconds,
                    rest: exs[0]?.planned_rest ?? 60,
                    repsTipo: firstEx ? inferRepsTipo(firstEx) : "reps",
                    exercises: [],
                };

                if (
                    setType === SET_TYPE.SINGLE_SET &&
                    isCollapsedSingleSetApiLines(exs)
                ) {
                    return hydrateSingleSetConstructorRow(base, exs);
                }

                if (setType === SET_TYPE.DROPSET && canHydrateDropsetApiLines(exs)) {
                    return hydrateDropsetConstructorRow(base, exs);
                }

                if (setType === SET_TYPE.SUPERSET && exs.length > 0) {
                    return hydrateSupersetConstructorRow(base, exs);
                }

                if (setType === SET_TYPE.GIANT_SET && exs.length > 0) {
                    return hydrateGiantSetConstructorRow(base, exs);
                }

                if (setType === SET_TYPE.FOR_TIME && exs.length > 0) {
                    return hydrateForTimeConstructorRow(base, exs);
                }

                if (setType === SET_TYPE.EMOM && exs.length > 0) {
                    return hydrateEmomConstructorRow(base, exs);
                }

                return {
                    ...base,
                    exercises: exs.map((ex, j) => ({
                        id: `ex-${ex.id}-${j}`,
                        serverExerciseId: ex.id,
                        exerciseId: ex.exercise_id,
                        exerciseName: `Ejercicio #${ex.exercise_id}`,
                        plannedReps: ex.planned_reps,
                        plannedWeight: ex.planned_weight,
        plannedAssistanceKg: ex.planned_assistance_kg ?? null,
                        plannedDuration: ex.planned_duration,
                        effortCharacter:
                            ex.effort_character as ConstructorExercise["effortCharacter"],
                        effortValue: ex.effort_value,
                        notes: ex.notes,
                    })),
                };
            });

            setConstructorRows(
                rows.map((row) => {
                    if (row.setType === SET_TYPE.SUPERSET) {
                        return normalizeSupersetRow(row);
                    }
                    if (row.setType === SET_TYPE.SINGLE_SET) {
                        return normalizeSingleSetRow(row);
                    }
                    if (row.setType === SET_TYPE.DROPSET) {
                        return normalizeDropsetRow(row);
                    }
                    if (row.setType === SET_TYPE.GIANT_SET) {
                        return normalizeGiantSetRow(row);
                    }
                    if (row.setType === SET_TYPE.FOR_TIME) {
                        return normalizeForTimeRow(row);
                    }
                    if (row.setType === SET_TYPE.EMOM) {
                        return normalizeEmomRow(row);
                    }
                    if (row.setType === SET_TYPE.AMRAP) {
                        return normalizeAmrapRow(row);
                    }
                    return row;
                })
            );
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [sessionId, blocks, isLoadingSessionBlocks, dispatch]);

    /** Nombres del catálogo sin re-hidratar el constructor (evita perder edición y scroll). */
    useEffect(() => {
        if (!exercisesData?.exercises?.length) return;

        const nameMap: Record<number, string> = {};
        for (const ex of exercisesData.exercises) {
            nameMap[ex.id] = ex.nombre;
        }

        setConstructorRows((prev) => {
            if (prev.length === 0) return prev;

            let changed = false;
            const next = prev.map((row) => ({
                ...row,
                exercises: row.exercises.map((exercise) => {
                    const resolved = nameMap[exercise.exerciseId];
                    if (!resolved || exercise.exerciseName === resolved) {
                        return exercise;
                    }
                    changed = true;
                    return { ...exercise, exerciseName: resolved };
                }),
            }));

            return changed ? next : prev;
        });
    }, [exercisesData]);

    const handleSelectFromPicker = useCallback(
        (exercise: Exercise) => {
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
        },
        [targetRowIdForPicker, targetExerciseSlotId]
    );

    // Prellenar formulario cuando se carga la sesión
    useEffect(() => {
        if (session) {
            const sessionDateYmd = session.session_date
                ? session.session_date.split("T")[0]
                : new Date().toISOString().split("T")[0];
            setOriginalSessionDate(sessionDateYmd);
            setVolumeIntensityTouched(false);
            nameTouchedRef.current = false;
            sessionUsesAutoNameRef.current = false;
            setFormData({
                sessionName: session.session_name || "",
                sessionDate: sessionDateYmd,
                sessionType: session.session_type || "training",
                plannedDuration: session.planned_duration?.toString() || "",
                plannedIntensity: clampIntSlider1to10(session.planned_intensity, 5),
                plannedVolume: clampIntSlider1to10(session.planned_volume, 5),
                notes: session.notes || "",
            });
        }
    }, [session]);

    // Validar que haya sessionId
    useEffect(() => {
        if (!sessionId || isNaN(sessionId)) {
            showError("ID de sesión inválido");
            navigate("/dashboard");
        }
    }, [sessionId, navigate, showError]);

    // Manejar error al cargar sesión
    useEffect(() => {
        if (isErrorSession) {
            showError("Error al cargar la sesión");
            navigate("/dashboard");
        }
    }, [isErrorSession, navigate, showError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
        }
        if (!formData.sessionType) {
            errors.sessionType = "El tipo de sesión es obligatorio";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (!session) {
            showError("No se pudo obtener la información de la sesión");
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

        setIsSaving(true);
        try {
            const resolvedSessionName = formData.sessionName.trim() || defaultSessionName;
            const sessionData: TrainingSessionUpdate = {
                session_name: resolvedSessionName,
                session_date: formData.sessionDate,
                session_type: formData.sessionType,
                planned_duration: formData.plannedDuration ? Number(formData.plannedDuration) : null,
                planned_intensity: formData.plannedIntensity
                    ? sliderDisplay1to10(formData.plannedIntensity, 5)
                    : null,
                planned_volume: formData.plannedVolume
                    ? sliderDisplay1to10(formData.plannedVolume, 5)
                    : null,
                notes: formData.notes.trim() || null,
            };

            const blocksPayload = constructorRows.map((row, i) => {
                const persistLines = getConstructorPersistLines(row);
                const exercises = persistLines.map((line) => {
                    const base = buildExercisePayloadFromLine(row, line);
                    return {
                        ...(line.serverExerciseId ? { id: line.serverExerciseId } : {}),
                        ...base,
                    };
                });

                return {
                    ...(row.serverBlockId ? { id: row.serverBlockId } : {}),
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
                    exercises,
                };
            });

            const updatedSession = await updateTrainingSessionFull({
                id: sessionId,
                body: {
                    session: sessionData,
                    blocks: blocksPayload,
                },
            }).unwrap();

            showSuccess("Sesión actualizada exitosamente. Redirigiendo...", 2000);

            navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
                state: buildReviewNavigationState(
                    location,
                    updatedSession.coherence ?? null,
                ),
            });
        } catch (err) {
            console.error("Error actualizando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String(
                          (err as { data: unknown }).data || "Error al actualizar la sesión"
                      )
                    : "Error al actualizar la sesión";
            showError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const trainerIdForDayPlan = trainerProfile?.id ?? session?.trainer_id ?? 0;
    const canReviewAlignment = !!(session?.training_plan_id && session?.session_date);

    const handleReviewAlignment = useCallback(() => {
        if (!sessionId || !canReviewAlignment) return;
        navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
            state: buildReviewNavigationState(location),
        });
    }, [navigate, sessionId, canReviewAlignment, location]);

    if (isLoadingSession) {
        return (
            <div className={SESSION_PROGRAMMING_LOADING_ROW}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const useStandaloneSession = !session.training_plan_id;

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
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            Volver
                        </Button>
                    </header>

                    {session.client_id && client ? (
                        <div className={SESSION_PROGRAMMING_CLIENT_BANNER}>
                            <NexiaGlassAccentRim />
                            <ClientAvatar
                                clientId={session.client_id}
                                nombre={client.nombre}
                                apellidos={client.apellidos}
                                size="sm"
                            />
                            <div className="min-w-0">
                                <p className={SESSION_PROGRAMMING_CLIENT_BANNER_TEXT}>
                                    {SESSION_PROGRAMMING_COPY.editClientBannerPrefix}{" "}
                                    {client.nombre} {client.apellidos}
                                </p>
                                <p className={SESSION_PROGRAMMING_CLIENT_BANNER_SUBTITLE}>
                                    {SESSION_PROGRAMMING_COPY.editSubtitle}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <form id="edit-session-form" onSubmit={handleSubmit} className={SESSION_PROGRAMMING_FORM_STACK}>
                        <div
                            className={
                                session.client_id && useStandaloneSession
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
                                    <div
                                        className={
                                            session.client_id
                                                ? SESSION_PROGRAMMING_FIELD_NAME
                                                : SESSION_PROGRAMMING_FIELD_NAME_SOLO
                                        }
                                    >
                                        <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                            Nombre de la sesión
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.sessionName}
                                            onChange={(e) => {
                                                nameTouchedRef.current = true;
                                                sessionUsesAutoNameRef.current = false;
                                                setFormData({ ...formData, sessionName: e.target.value });
                                            }}
                                            placeholder="Ej: Fuerza — Tren superior A"
                                            className={cn(SESSION_PROGRAMMING_FIELD_CONTROL, "bg-surface")}
                                        />
                                        <p className={SESSION_PROGRAMMING_FIELD_HINT}>
                                            {SESSION_PROGRAMMING_COPY.nameHint}
                                        </p>
                                        {formErrors.sessionName ? (
                                            <p className={SESSION_PROGRAMMING_FIELD_ERROR}>
                                                {formErrors.sessionName}
                                            </p>
                                        ) : null}
                                    </div>

                                    {session.client_id ? (
                                        <div className={SESSION_PROGRAMMING_FIELD_PLAN}>
                                            <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                                Plan de Entrenamiento
                                            </label>
                                            <div className={SESSION_PROGRAMMING_FIELD_CONTROL}>
                                                {session.training_plan_id && plan ? (
                                                    <Input
                                                        type="text"
                                                        value={plan.name || "Cargando..."}
                                                        disabled
                                                        className="bg-muted"
                                                    />
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        value="Sesión libre"
                                                        disabled
                                                        className="bg-muted"
                                                    />
                                                )}
                                            </div>
                                            {session.training_plan_id && plan ? (
                                                <p className={SESSION_PROGRAMMING_FIELD_HINT}>
                                                    {SESSION_PROGRAMMING_COPY.planHint}
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                        <label htmlFor="edit-session-date" className={SESSION_PROGRAMMING_FIELD_LABEL}>
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
                                        {formErrors.sessionDate ? (
                                            <p className={SESSION_PROGRAMMING_FIELD_ERROR}>
                                                {formErrors.sessionDate}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                        <label htmlFor="edit-session-type" className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                            Tipo *
                                        </label>
                                        <div className={SESSION_PROGRAMMING_FIELD_CONTROL}>
                                            <FormCombobox
                                                id="edit-session-type"
                                                value={formData.sessionType}
                                                onChange={(v) =>
                                                    setFormData({ ...formData, sessionType: v })
                                                }
                                                options={SESSION_TYPES}
                                                placeholder="Selecciona tipo"
                                                ariaLabel="Tipo de sesión"
                                            />
                                        </div>
                                        {formErrors.sessionType ? (
                                            <p className={SESSION_PROGRAMMING_FIELD_ERROR}>
                                                {formErrors.sessionType}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
                                        <label className={SESSION_PROGRAMMING_FIELD_LABEL}>
                                            Duración (min)
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.plannedDuration}
                                            onChange={(e) =>
                                                setFormData({ ...formData, plannedDuration: e.target.value })
                                            }
                                            placeholder="60"
                                            className={cn(
                                                SESSION_PROGRAMMING_FIELD_CONTROL,
                                                "max-w-[7rem] bg-surface lg:max-w-none",
                                            )}
                                        />
                                    </div>

                                    <div className={SESSION_PROGRAMMING_FIELD_METER}>
                                        <BlockLevelMeter
                                            id="edit-session-volume"
                                            tone="volume"
                                            prefix="Volumen"
                                            level={
                                                formData.plannedVolume
                                                    ? Number(formData.plannedVolume)
                                                    : 5
                                            }
                                            hint={editSliderValueNote}
                                            onChange={(v) => {
                                                setVolumeIntensityTouched(true);
                                                setFormData({ ...formData, plannedVolume: String(v) });
                                            }}
                                        />
                                    </div>
                                    <div className={SESSION_PROGRAMMING_FIELD_METER}>
                                        <BlockLevelMeter
                                            id="edit-session-intensity"
                                            tone="intensity"
                                            prefix="Intensidad"
                                            level={
                                                formData.plannedIntensity
                                                    ? Number(formData.plannedIntensity)
                                                    : 5
                                            }
                                            hint={editSliderValueNote}
                                            onChange={(v) => {
                                                setVolumeIntensityTouched(true);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    plannedIntensity: String(v),
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {session.client_id && useStandaloneSession ? (
                                <aside className={SESSION_PROGRAMMING_SIDEBAR}>
                                    <div className={SESSION_PROGRAMMING_EMPTY_SIDEBAR}>
                                        <div className={SESSION_PROGRAMMING_EMPTY_GLOW} aria-hidden />
                                        <div className="relative z-[1] py-2 text-center">
                                            <div className="mx-auto mb-3 text-muted-foreground/50 [&>svg]:h-8 [&>svg]:w-8">
                                                <ClipboardList aria-hidden />
                                            </div>
                                            <p className={SESSION_PROGRAMMING_EMPTY_TITLE}>Sin plan asignado</p>
                                            <p className={SESSION_PROGRAMMING_EMPTY_DESCRIPTION}>
                                                Esta sesión no está vinculada a un plan de entrenamiento.
                                            </p>
                                            <div className={SESSION_PROGRAMMING_EMPTY_ACTION}>
                                                <Button
                                                    type="button"
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() =>
                                                        navigate(
                                                            `/dashboard/training-plans/create?clientId=${session.client_id}`,
                                                            { state: { from: location.pathname } },
                                                        )
                                                    }
                                                >
                                                    <ClipboardList className="mr-2 h-3.5 w-3.5" aria-hidden />
                                                    Crear plan
                                                </Button>
                                            </div>
                                            <p className={cn(SESSION_PROGRAMMING_EMPTY_FOOTER, "mt-3")}>
                                                Puedes seguir editando la sesión libremente.
                                            </p>
                                        </div>
                                    </div>
                                </aside>
                            ) : null}
                        </div>

                        <div className={SESSION_PROGRAMMING_LOWER_STACK}>
                            {session.client_id && !useStandaloneSession ? (
                                <SessionDayContextPanel
                                    layout="hero"
                                    clientId={session.client_id}
                                    sessionDate={formData.sessionDate}
                                    trainerId={trainerIdForDayPlan}
                                    trainingPlanId={session.training_plan_id}
                                />
                            ) : null}

                            {showStructureDriftBanner ? (
                                <Alert variant="warning">
                                    <p className="font-semibold">
                                        {STRUCTURE_DRIFT_EDIT_BANNER_TITLE}
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {STRUCTURE_DRIFT_EDIT_BANNER_BODY}
                                    </p>
                                </Alert>
                            ) : null}

                            {session.client_id && hasActiveInjuries && client ? (
                                <Alert variant="warning">
                                    Atención: {client.nombre} {client.apellidos} tiene lesiones activas (
                                    {clientActiveInjuries
                                        .map((i) => i.joint_name_es || i.joint_name)
                                        .filter(Boolean)
                                        .join(", ") || "ver ficha del cliente"}
                                    ). Los ejercicios contraindicados están marcados en la lista.
                                </Alert>
                            ) : null}

                            {session.client_id ? (
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
                                    coverageStatus={weeklyVolumePanel.coverageStatus}
                                    sessionsInWeek={weeklyVolumePanel.sessionsInWeek}
                                    expectedTrainingDays={weeklyVolumePanel.expectedTrainingDays}
                                    sessionSlices={weeklyVolumePanel.sessionSlices}
                                    priorWeekRows={weeklyVolumePanel.priorWeekRows}
                                    priorWeekLabel={weeklyVolumePanel.priorWeekLabel}
                                    showWeeklyConsultExtras={weeklyVolumePanel.showWeeklyConsultExtras}
                                />
                            ) : null}

                            <div className="space-y-5">
                                <TrainingBlockSelector
                                    selectedBlockTypeIds={[
                                        ...new Set(
                                            constructorRows.map((r) => r.blockTypeId).filter(Boolean),
                                        ),
                                    ]}
                                    onSelect={(blockTypeId) => {
                                        if (!blockTypeId || !blockTypes.some((bt) => bt.id === blockTypeId))
                                            return;
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
                                                    clientId={session.client_id ?? undefined}
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
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
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
                    {canReviewAlignment ? (
                        <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            className={SESSION_PROGRAMMING_FOOTER_SECONDARY}
                            onClick={handleReviewAlignment}
                        >
                            Revisar alineación
                            <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                        </Button>
                    ) : (
                        <span className="hidden sm:block sm:flex-1" aria-hidden />
                    )}
                    <div className={SESSION_PROGRAMMING_FOOTER_ACTIONS}>
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            className={SESSION_PROGRAMMING_FOOTER_CANCEL}
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="edit-session-form"
                            variant="primary"
                            size="sm"
                            className={SESSION_PROGRAMMING_FOOTER_PRIMARY}
                            disabled={isSaving || isUpdatingSessionFull}
                            isLoading={isSaving || isUpdatingSessionFull}
                        >
                            Actualizar sesión
                        </Button>
                    </div>
                </div>
            </DashboardFixedFooter>
        </>
    );
};





