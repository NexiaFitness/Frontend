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
import { Input, FormSelect, Textarea, Slider, DatePickerButton } from "@/components/ui/forms";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanRecommendationsQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionFullMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import type { TrainingSessionUpdate } from "@nexia/shared/types/trainingSessions";
import {
    useGetSessionBlocksQuery,
    useGetTrainingBlockTypesQuery,
} from "@nexia/shared/api/sessionProgrammingApi";
import { sessionProgrammingApi } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName, normalizeSessionName, useDefaultSessionName } from "@nexia/shared";
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
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import { ArrowLeft, ChevronRight, Flame, Gauge } from "lucide-react";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { DASHBOARD_FIXED_FOOTER_SHELL_CLASS, PageTitle } from "@/components/dashboard/shared";
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
            const exercisesByBlock: Record<
                number,
                {
                    id: number;
                    exercise_id: number;
                    planned_reps: string | null;
                    planned_weight: number | null;
                    planned_rest: number | null;
                    planned_sets: number | null;
                    effort_character: unknown;
                    effort_value: number | null;
                    notes: string | null;
                    planned_duration: number | null;
                    order_in_block: number;
                    superset_group_id: number | null;
                }[]
            > = {};

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

            await updateTrainingSessionFull({
                id: sessionId,
                body: {
                    session: sessionData,
                    blocks: blocksPayload,
                },
            }).unwrap();

            showSuccess("Sesión actualizada exitosamente. Redirigiendo...", 2000);

            navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
                state: returnToStateFromView(location),
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
    const canReviewAlignment = !!session?.period_block_id;

    const handleReviewAlignment = useCallback(() => {
        if (!sessionId || !canReviewAlignment) return;
        navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
            state: returnToStateFromView(location),
        });
    }, [navigate, sessionId, canReviewAlignment, location]);

    if (isLoadingSession) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <>
            <div className="space-y-6 pb-24">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageTitle title="Editar Sesión" />
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                </div>

                {session.client_id && client && (
                    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                        <ClientAvatar
                            clientId={session.client_id}
                            nombre={client.nombre}
                            apellidos={client.apellidos}
                            size="sm"
                        />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Editando sesión para {client.nombre} {client.apellidos}
                            </p>
                        </div>
                    </div>
                )}

                <form id="edit-session-form" onSubmit={handleSubmit}>
                    <div
                        className={cn(
                            "grid grid-cols-1 items-stretch gap-6",
                            session.client_id ? "lg:grid-cols-[1fr_420px]" : "",
                        )}
                    >
                        <div className="min-h-0 space-y-5">
                            <div
                                className={cn(
                                    "grid gap-4",
                                    session.client_id ? "grid-cols-1 md:grid-cols-2" : "",
                                )}
                            >
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
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
                                        className="bg-surface"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se genera automáticamente; puedes cambiarlo
                                    </p>
                                    {formErrors.sessionName && (
                                        <p className="text-destructive text-xs mt-1">{formErrors.sessionName}</p>
                                    )}
                                </div>
                                {session.client_id ? (
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                            Plan de Entrenamiento
                                        </label>
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
                                        {session.training_plan_id && plan ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                La sesión está vinculada a este plan para el seguimiento de
                                                carga.
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="edit-session-date"
                                        className="block text-xs font-medium text-muted-foreground mb-1.5"
                                    >
                                        Fecha de la Sesión *
                                    </label>
                                    <DatePickerButton
                                        label="Seleccionar fecha"
                                        value={formData.sessionDate}
                                        onChange={(v) => setFormData({ ...formData, sessionDate: v })}
                                        variant="form"
                                    />
                                    {formErrors.sessionDate && (
                                        <p className="mt-1 text-xs text-destructive">{formErrors.sessionDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="edit-session-type"
                                        className="block text-xs font-medium text-muted-foreground mb-1.5"
                                    >
                                        Tipo de Sesión *
                                    </label>
                                    <FormSelect
                                        id="edit-session-type"
                                        value={formData.sessionType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sessionType: e.target.value })
                                        }
                                        required
                                        options={SESSION_TYPES}
                                    />
                                    {formErrors.sessionType && (
                                        <p className="text-destructive text-xs mt-1">{formErrors.sessionType}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Duración (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedDuration: e.target.value })
                                        }
                                        placeholder="60"
                                        className="bg-surface"
                                    />
                                </div>
                                <div className="mt-3 md:mt-0">
                                    <Slider
                                        label="Volumen"
                                        labelIcon={<Gauge className="h-3.5 w-3.5 text-primary" aria-hidden />}
                                        value={sliderDisplay1to10(formData.plannedVolume, 5)}
                                        min={1}
                                        max={10}
                                        color="primary"
                                        valueNote={editSliderValueNote}
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
                                        value={sliderDisplay1to10(formData.plannedIntensity, 5)}
                                        min={1}
                                        max={10}
                                        color="warning"
                                        valueNote={editSliderValueNote}
                                        onChange={(v) => {
                                            setVolumeIntensityTouched(true);
                                            setFormData((prev) => ({ ...prev, plannedIntensity: String(v) }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {session.client_id ? (
                            <div className="flex h-full min-h-0 flex-col lg:self-stretch">
                                <SessionDayContextPanel
                                    layout="sidebar"
                                    clientId={session.client_id}
                                    sessionDate={formData.sessionDate}
                                    trainerId={trainerIdForDayPlan}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-6 space-y-5 w-full">
                        {session.client_id ? (
                            <SessionDayContextPanel
                                layout="hero"
                                clientId={session.client_id}
                                sessionDate={formData.sessionDate}
                                trainerId={trainerIdForDayPlan}
                            />
                        ) : null}

                        {session.client_id && hasActiveInjuries && client ? (
                            <Alert variant="warning">
                                Atención: {client.nombre} {client.apellidos} tiene lesiones activas (
                                {clientActiveInjuries.map((i) => i.joint_name_es || i.joint_name).filter(Boolean).join(", ") ||
                                    "ver ficha del cliente"}
                                ). Los ejercicios contraindicados están marcados en la lista.
                            </Alert>
                        ) : null}

                        {session.client_id ? (
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
                                    selectedBlockTypeIds={[
                                        ...new Set(constructorRows.map((r) => r.blockTypeId).filter(Boolean)),
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

                            <div className="border-t border-border pt-6">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Notas de la Sesión
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Instrucciones generales para la sesión..."
                                />
                            </div>
                    </div>
                </form>
            </div>

            <div
                className={DASHBOARD_FIXED_FOOTER_SHELL_CLASS}
                style={{ left: "var(--sidebar-width, 0)" }}
            >
                <div className="flex items-center justify-between gap-3">
                    {canReviewAlignment ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReviewAlignment}
                            className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            Revisar alineación
                            <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
                        </Button>
                    ) : (
                        <span className="shrink-0" aria-hidden />
                    )}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="edit-session-form"
                            variant="primary"
                            size="sm"
                            disabled={isSaving || isUpdatingSessionFull}
                            isLoading={isSaving || isUpdatingSessionFull}
                        >
                            Actualizar Sesión
                        </Button>
                    </div>
                </div>
            </div>

        </>
    );
};





