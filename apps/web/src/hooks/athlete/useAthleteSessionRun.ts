/**
 * useAthleteSessionRun.ts — Lógica de ejecución sesión atleta (F1 100%, V05 B.2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionMutation,
    useUpdateSessionExerciseMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useUpdateSessionBlockExerciseMutation } from "@nexia/shared/api/sessionProgrammingApi";
import {
    useGetAthleteRunReferenceQuery,
    usePostAthleteRunExecutionMutation,
    usePostAthleteRunTimedResultMutation,
} from "@nexia/shared/api/athleteApi";
import { shouldShowRunSuggestion } from "@nexia/shared/types/athleteRunSuggestion";
import { hasAthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import type {
    AthleteRunExecutionCreate,
    AthleteRunTimedResultCreate,
} from "@nexia/shared/types/athleteRunReference";
import {
    buildAthleteRunExecutionPayload,
    buildAthleteRunExecutionPayloadFromSlot,
    buildAthleteRunReferenceQuery,
    resolveRunLoggerDefaults,
} from "@nexia/shared/utils/athlete/runReferenceUtils";
import {
    buildAmrapTimedResultPayload,
    buildAthleteRunTimedReferenceQuery,
    buildForTimeTimedResultPayload,
} from "@nexia/shared/utils/athlete/timedBlockRunUtils";
import { resolveLocalRunReference } from "@nexia/shared/utils/athlete/localRunReferenceUtils";
import { useAthleteRunSlotReferences } from "@/hooks/athlete/useAthleteRunSlotReferences";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useOfflineSessionLog } from "@nexia/shared/hooks/offline";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { resolveSeriesWeightAutofillKey } from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import {
    buildAthleteRunSteps,
    resolveRestAfterCompletingRunStep,
    runStepToFlatExercise,
    type AthleteRunRoundSlot,
    type AthleteRunStep,
} from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { touchRunStepKeysForPersist } from "@nexia/shared/utils/athlete/athleteRunProgressSteps";
import {
    buildAthleteRunGroupContext,
    buildAthleteRunGroupContextFromForTimeRound,
    buildAthleteRunGroupContextFromStep,
    type AthleteRunGroupContextView,
} from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import {
    applyAmrapPartialChange,
    buildAmrapSavePayloads,
    buildInitialAmrapPartial,
    computeAmrapPartialTotal,
} from "@nexia/shared/utils/athlete/amrapResult";
import { isEmomCompletionValid } from "@nexia/shared/utils/athlete/emomResult";
import {
    buildForTimeSavePayloads,
    clampForTimeTotalSeconds,
    isForTimeCompletionValid,
} from "@nexia/shared/utils/athlete/forTimeResult";
import type { SlotLogValues } from "@/components/athlete/execution/AthleteMultiSlotLogger";
import { useAthleteExercisePr } from "@/hooks/athlete/useAthleteExercisePr";
import { useAthleteRunRestFlow } from "@/hooks/athlete/useAthleteRunRestFlow";
import { useAthleteBlockTimer } from "@/hooks/athlete/useAthleteBlockTimer";
import { useAthleteRunWakeLock } from "@/hooks/athlete/useAthleteRunWakeLock";
import { useAthleteBlockWorkPhase } from "@/hooks/athlete/useAthleteBlockWorkPhase";
import { useAthleteForTimeFlow } from "@/hooks/athlete/useAthleteForTimeFlow";
import { useAthleteEmomRunPhase } from "@/hooks/athlete/useAthleteEmomRunPhase";
import { useAthleteRunProgressResume } from "@/hooks/athlete/useAthleteRunProgressResume";
import { getAthleteBlockStartLabel } from "@/components/athlete/execution/athleteRunPresentation";

export interface AthletePrCelebration {
    exerciseName: string;
    weight: number;
    previousMaxWeight: number | null;
}

export interface AthleteSessionRunSaveContext {
    isGroupRound: boolean;
    isTimedBlock?: boolean;
    groupKind?: AthleteRunStep["groupKind"];
}

export interface UseAthleteSessionRunOptions {
    sessionId: number;
    onSetSaved?: (result: "synced" | "queued" | "offline", context: AthleteSessionRunSaveContext) => void;
    onSessionFinished?: (result: "synced" | "queued" | "offline") => void;
    onSyncSuccess?: () => void;
    onConflict?: () => void;
    onError?: (message: string) => void;
}

export function useAthleteSessionRun({
    sessionId,
    onSetSaved,
    onSessionFinished,
    onSyncSuccess,
    onConflict,
    onError,
}: UseAthleteSessionRunOptions) {
    const navigate = useNavigate();
    const { clientId } = useAthleteContext();

    const { data: session, isLoading: loadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });
    const { view, source: structureSource, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const [updateBlockExercise] = useUpdateSessionBlockExerciseMutation();
    const [updateSessionExercise] = useUpdateSessionExerciseMutation();
    const [updateSession] = useUpdateTrainingSessionMutation();
    const [postRunExecution] = usePostAthleteRunExecutionMutation();
    const [postTimedResult] = usePostAthleteRunTimedResultMutation();

    const runSteps = useMemo(() => buildAthleteRunSteps(view), [view]);
    const flatExercisesFromApi = useMemo(() => flattenAthleteExercises(view), [view]);

    const adapter = useMemo(
        () => ({
            updateExercise: async (
                blockExerciseId: number,
                data: Parameters<typeof updateBlockExercise>[0]["data"]
            ) => {
                if (structureSource === "legacy") {
                    await updateSessionExercise({
                        id: blockExerciseId,
                        clientId: clientId ?? undefined,
                        data: {
                            actual_weight: data.actual_weight,
                            actual_reps: data.actual_reps,
                            actual_sets: data.actual_sets,
                        },
                    }).unwrap();
                    return;
                }
                await updateBlockExercise({ id: blockExerciseId, data }).unwrap();
            },
            completeSession: async (sid: number) => {
                await updateSession({ id: sid, body: { status: "completed" } }).unwrap();
            },
            postExecution: async (payload: AthleteRunExecutionCreate) => {
                await postRunExecution(payload).unwrap();
            },
            postTimedResult: async (payload: AthleteRunTimedResultCreate) => {
                await postTimedResult(payload).unwrap();
            },
        }),
        [structureSource, updateBlockExercise, updateSessionExercise, updateSession, clientId, postRunExecution, postTimedResult]
    );

    const {
        isOnline,
        pendingCount,
        cachedSnapshot,
        localExecutions,
        isUsingCache,
        logSet,
        logExecution,
        logTimedResult,
        finishSession,
    } = useOfflineSessionLog({
        sessionId,
        clientId,
        sessionName: session?.session_name ?? "Entrenamiento",
        flatExercises: flatExercisesFromApi,
        adapter,
        onSynced: () => onSyncSuccess?.(),
        onConflict,
    });

    const flatExercises = useMemo(
        () =>
            flatExercisesFromApi.length > 0
                ? flatExercisesFromApi
                : isUsingCache
                  ? (cachedSnapshot?.flatExercises ?? [])
                  : [],
        [flatExercisesFromApi, isUsingCache, cachedSnapshot?.flatExercises]
    );

    const flatExercisesRef = useRef(flatExercises);
    flatExercisesRef.current = flatExercises;

    const runStepsRef = useRef(runSteps);
    runStepsRef.current = runSteps;

    const [step, setStep] = useState(0);
    const [weight, setWeight] = useState(0);
    const [reps, setReps] = useState(8);
    const [rpe, setRpe] = useState<number | null>(null);
    const [slotLogs, setSlotLogs] = useState<Record<string, SlotLogValues>>({});
    const [roundRpe, setRoundRpe] = useState<number | null>(null);
    const [forTimeTotalSeconds, setForTimeTotalSeconds] = useState(0);
    const [amrapRounds, setAmrapRounds] = useState(0);
    const [amrapPartialReps, setAmrapPartialReps] = useState<Record<string, number>>({});
    const [amrapValidationVisible, setAmrapValidationVisible] = useState(false);
    const [emomAsPlanned, setEmomAsPlanned] = useState<boolean | null>(null);
    const [emomAthleteNote, setEmomAthleteNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [prCelebration, setPrCelebration] = useState<AthletePrCelebration | null>(null);

    const loggedSetsRef = useRef<Map<number, number>>(new Map());
    const completedStepKeysRef = useRef<Set<string>>(new Set());
    const touchedWeightStepKeysRef = useRef<Set<string>>(new Set());
    const seriesAutofillWeightRef = useRef<Map<string, number>>(new Map());
    const [savedStepKeys, setSavedStepKeys] = useState<ReadonlySet<string>>(() => new Set());

    useEffect(() => {
        setStep(0);
        loggedSetsRef.current = new Map();
        completedStepKeysRef.current = new Set();
        touchedWeightStepKeysRef.current = new Set();
        seriesAutofillWeightRef.current = new Map();
        setSavedStepKeys(new Set());
        setSlotLogs({});
        setRoundRpe(null);
        setAmrapRounds(0);
        setAmrapPartialReps({});
        setAmrapValidationVisible(false);
        setEmomAsPlanned(null);
        setEmomAthleteNote("");
        setForTimeTotalSeconds(0);
    }, [sessionId]);

    const {
        runProgress,
        skipPersistForCurrentStep,
        isStepSavedOnServer,
        findNextPendingStepIndex,
    } = useAthleteRunProgressResume({
        sessionId,
        runSteps,
        isOnline,
        completedStepKeysRef,
        touchedWeightStepKeysRef,
        setSavedStepKeys,
        setStep,
    });

    const saveEmomBlockRef = useRef<
        () => Promise<"synced" | "queued" | "offline">
    >(async () => "synced");

    const currentRunStep: AthleteRunStep | undefined = runSteps[step];
    const currentStepKey = currentRunStep?.stepKey ?? null;
    const isGroupRound = currentRunStep?.kind === "group_round";
    const isTimedBlock = currentRunStep?.kind === "timed_block";
    const isBatchStep = isGroupRound || isTimedBlock;

    const current = useMemo(() => {
        if (!currentRunStep || isBatchStep) return undefined;
        return runStepToFlatExercise(currentRunStep);
    }, [currentRunStep, isBatchStep]);

    const nextRunStep = step < runSteps.length - 1 ? runSteps[step + 1] : undefined;

    const groupContext: AthleteRunGroupContextView | null = useMemo(() => {
        if (!currentRunStep) return null;
        if (currentRunStep.kind === "group_round" || currentRunStep.kind === "timed_block") {
            return buildAthleteRunGroupContextFromStep(currentRunStep);
        }
        if (!currentStepKey || !current) return null;
        return buildAthleteRunGroupContext(flatExercises, currentStepKey);
    }, [current, currentRunStep, currentStepKey, flatExercises]);

    const singleExerciseId = isBatchStep ? null : (current?.exerciseId ?? null);

    const { evaluatePr } = useAthleteExercisePr(clientId, singleExerciseId);

    const runReferenceQueryArg = useMemo(() => {
        if (!current || !sessionId) return null;
        return buildAthleteRunReferenceQuery(sessionId, current);
    }, [current, sessionId]);

    const { data: runReference, isLoading: isRunReferenceQueryLoading } =
        useGetAthleteRunReferenceQuery(
        runReferenceQueryArg ?? {
            training_session_id: 0,
            step_key: "",
            exercise_id: 0,
        },
        { skip: !runReferenceQueryArg || isBatchStep || !isOnline }
    );

    const localReferencePoint = useMemo(() => {
        if (!current || isOnline) return null;
        return resolveLocalRunReference({
            exerciseId: current.exerciseId,
            setIndex: current.setIndex,
            roundIndex: current.roundIndex,
            slotLabel: current.slotLabel,
            groupKind: current.groupKind,
            localExecutions,
        });
    }, [current, isOnline, localExecutions]);

    const effectiveRunReference = useMemo(() => {
        if (runReference) {
            if (runReference.reference || !localReferencePoint) return runReference;
            return { ...runReference, reference: localReferencePoint };
        }
        if (!current || !localReferencePoint) return undefined;
        return {
            exercise_id: current.exerciseId,
            step_key: current.stepKey,
            reference: localReferencePoint,
            personal_best: null,
            suggestion: null,
        };
    }, [runReference, localReferencePoint, current]);

    const { slotReferences, isLoading: isSlotReferencesLoading } = useAthleteRunSlotReferences(
        sessionId,
        currentRunStep,
        isGroupRound && isOnline
    );

    const timedReferenceQueryArg = useMemo(() => {
        if (!isTimedBlock || !sessionId || !currentRunStep?.groupId) return null;
        return buildAthleteRunTimedReferenceQuery(sessionId, currentRunStep);
    }, [currentRunStep, isTimedBlock, sessionId]);

    const { data: timedRunReference, isLoading: isTimedRunReferenceQueryLoading } =
        useGetAthleteRunReferenceQuery(
        timedReferenceQueryArg ?? {
            training_session_id: 0,
            step_key: "",
            exercise_id: 0,
        },
        { skip: !timedReferenceQueryArg || !isOnline }
    );

    const isRunReferenceLoading =
        isOnline && !isBatchStep && Boolean(runReferenceQueryArg) && isRunReferenceQueryLoading;
    const isTimedRunReferenceLoading =
        isOnline && Boolean(timedReferenceQueryArg) && isTimedRunReferenceQueryLoading;

    const applyReferenceValues = useCallback(() => {
        const ref = effectiveRunReference?.reference;
        if (!hasAthleteRunReferencePoint(ref)) return;
        setWeight(ref.weight_kg);
        if (ref.reps != null) setReps(ref.reps);
        if (ref.rpe != null) setRpe(ref.rpe);
    }, [effectiveRunReference?.reference]);

    const applySuggestionValues = useCallback(() => {
        const suggestion = effectiveRunReference?.suggestion ?? runReference?.suggestion;
        if (!shouldShowRunSuggestion(suggestion)) return;
        setWeight(suggestion.suggested_value);
        const ref = effectiveRunReference?.reference ?? runReference?.reference;
        if (ref?.reps != null) setReps(ref.reps);
        if (ref?.rpe != null) setRpe(ref.rpe);
    }, [
        effectiveRunReference?.reference,
        effectiveRunReference?.suggestion,
        runReference?.reference,
        runReference?.suggestion,
    ]);

    const currentRunSuggestion =
        effectiveRunReference?.suggestion ?? runReference?.suggestion ?? null;

    const touchRunStepForPersist = useCallback((step: AthleteRunStep | undefined) => {
        touchRunStepKeysForPersist(touchedWeightStepKeysRef.current, step);
    }, []);

    const handleWeightChange = useCallback(
        (value: number) => {
            setWeight(value);
            if (!current) return;
            touchRunStepForPersist(currentRunStep ?? undefined);
            touchedWeightStepKeysRef.current.add(current.stepKey);
            if (value > 0) {
                seriesAutofillWeightRef.current.set(
                    resolveSeriesWeightAutofillKey(current),
                    value
                );
            }
        },
        [current, currentRunStep, touchRunStepForPersist]
    );

    const handleRepsChange = useCallback(
        (value: number) => {
            setReps(value);
            touchRunStepForPersist(currentRunStep ?? undefined);
            if (current) touchedWeightStepKeysRef.current.add(current.stepKey);
        },
        [current, currentRunStep, touchRunStepForPersist]
    );

    const handleRpeChange = useCallback(
        (value: number | null) => {
            setRpe(value);
            touchRunStepForPersist(currentRunStep ?? undefined);
            if (current) touchedWeightStepKeysRef.current.add(current.stepKey);
        },
        [current, currentRunStep, touchRunStepForPersist]
    );

    const handleRoundRpeChange = useCallback(
        (value: number | null) => {
            setRoundRpe(value);
            touchRunStepForPersist(currentRunStep ?? undefined);
        },
        [currentRunStep, touchRunStepForPersist]
    );

    useEffect(() => {
        setPrCelebration(null);
    }, [currentStepKey]);

    useEffect(() => {
        if (!currentStepKey) return;

        const runStep = runStepsRef.current.find((item) => item.stepKey === currentStepKey);
        if (!runStep || (runStep.kind !== "group_round" && runStep.kind !== "timed_block") || (!runStep.slots?.length && !runStep.emomIntervals?.length)) {
            setSlotLogs((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setRoundRpe((prev) => (prev === null ? prev : null));
            setAmrapRounds((prev) => (prev === 0 ? prev : 0));
            setAmrapPartialReps((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomAthleteNote((prev) => (prev === "" ? prev : ""));
            return;
        }

        if (runStep.groupKind === "emom" && runStep.emomIntervals?.length) {
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomAthleteNote((prev) => (prev === "" ? prev : ""));
        }

        if (!runStep.slots?.length) return;

        const partialSlots = runStep.slots.map((slot) => ({
            stepKey: slot.stepKey,
            maxReps: slot.defaultReps,
        }));
        const initialPartial = buildInitialAmrapPartial(partialSlots);
        const initial: Record<string, SlotLogValues> = {};
        for (const slot of runStep.slots) {
            initial[slot.stepKey] = {
                weight: slot.defaultWeight,
                reps: slot.defaultReps,
            };
        }

        const prescribedRpe =
            runStep.slots.find((slot) => slot.defaultRpe != null)?.defaultRpe ?? null;

        setSlotLogs((prev) => {
            const keys = Object.keys(initial);
            if (
                keys.length === Object.keys(prev).length &&
                keys.every((key) => {
                    const previous = prev[key];
                    const next = initial[key];
                    return (
                        previous &&
                        next &&
                        previous.weight === next.weight &&
                        previous.reps === next.reps
                    );
                })
            ) {
                return prev;
            }
            return initial;
        });

        setRoundRpe((prev) => (prev === prescribedRpe ? prev : prescribedRpe));
        setAmrapRounds((prev) => (prev === 0 ? prev : 0));
        setAmrapPartialReps((prev) => {
            const keys = Object.keys(initialPartial);
            if (
                keys.length === Object.keys(prev).length &&
                keys.every((key) => (prev[key] ?? 0) === (initialPartial[key] ?? 0))
            ) {
                return prev;
            }
            return initialPartial;
        });
        setAmrapValidationVisible((prev) => (prev === false ? prev : false));
    }, [currentStepKey]);

    useEffect(() => {
        if (!currentStepKey || isBatchStep) return;
        const exercise = flatExercisesRef.current.find((item) => item.stepKey === currentStepKey);
        if (!exercise) {
            const fromRun = runStepsRef.current.find((item) => item.stepKey === currentStepKey);
            if (!fromRun) return;
            setWeight(fromRun.defaultWeight);
            setReps(fromRun.defaultReps);
            setRpe(fromRun.defaultRpe);
            return;
        }
        setWeight(exercise.defaultWeight);
        setReps(exercise.defaultReps);
        setRpe(exercise.defaultRpe);
    }, [currentStepKey, isBatchStep]);

    const blockTimerRef = useRef(0);
    const forTimeDataRef = useRef<{ totalSeconds: number }>({
        totalSeconds: 0,
    });

    const updateSlotLog = useCallback(
        (slotKey: string, patch: Partial<SlotLogValues>) => {
            if (patch.weight != null || patch.reps != null) {
                touchedWeightStepKeysRef.current.add(slotKey);
                touchRunStepForPersist(currentRunStep ?? undefined);
            }
            setSlotLogs((prev) => {
                const current = prev[slotKey];
                if (!current) return prev;
                return { ...prev, [slotKey]: { ...current, ...patch } };
            });
        },
        [currentRunStep, touchRunStepForPersist]
    );

    const updateAmrapPartialReps = useCallback(
        (stepKey: string, value: number) => {
            if (!currentRunStep?.slots?.length) return;
            const partialSlots = currentRunStep.slots.map((slot) => ({
                stepKey: slot.stepKey,
                maxReps: slot.defaultReps,
            }));
            setAmrapPartialReps((prev) =>
                applyAmrapPartialChange(prev, partialSlots, stepKey, value)
            );
        },
        [currentRunStep?.slots]
    );

    const convertAmrapPartialToFullRound = useCallback(() => {
        if (!currentRunStep?.slots?.length) return;
        setAmrapRounds((prev) => prev + 1);
        setAmrapPartialReps(
            buildInitialAmrapPartial(
                currentRunStep.slots.map((slot) => ({
                    stepKey: slot.stepKey,
                    maxReps: slot.defaultReps,
                }))
            )
        );
        setAmrapValidationVisible(false);
    }, [currentRunStep?.slots]);

    const getNextActualSets = useCallback((blockExerciseId: number, loggedSets = 0) => {
        const fromRef = loggedSetsRef.current.get(blockExerciseId) ?? 0;
        return Math.max(fromRef, loggedSets) + 1;
    }, []);

    const handleSaveSet = useCallback(async () => {
        if (!current) return;
        if (completedStepKeysRef.current.has(current.stepKey)) return;
        if (currentRunStep && skipPersistForCurrentStep(currentRunStep)) {
            completedStepKeysRef.current.add(current.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
            onSetSaved?.("synced", {
                isGroupRound: false,
                isTimedBlock: false,
                groupKind: currentRunStep.groupKind,
            });
            return;
        }

        const payloadWeight = weight;
        const payloadReps = reps;
        const payloadRpe = rpe;

        setSaving(true);
        try {
            let result: "synced" | "queued" | "offline";

            if (isOnline) {
                await postRunExecution(
                    buildAthleteRunExecutionPayload(sessionId, current, {
                        weight: payloadWeight,
                        reps: payloadReps,
                        rpe: payloadRpe,
                        durationSeconds: payloadReps,
                    }, currentRunSuggestion)
                ).unwrap();
                loggedSetsRef.current.set(
                    current.blockExerciseId,
                    (loggedSetsRef.current.get(current.blockExerciseId) ??
                        current.loggedSets ??
                        0) + 1
                );
                result = "synced";
            } else {
                result = await logExecution(
                    buildAthleteRunExecutionPayload(sessionId, current, {
                        weight: payloadWeight,
                        reps: payloadReps,
                        rpe: payloadRpe,
                        durationSeconds: payloadReps,
                    }, currentRunSuggestion)
                );
                loggedSetsRef.current.set(
                    current.blockExerciseId,
                    (loggedSetsRef.current.get(current.blockExerciseId) ??
                        current.loggedSets ??
                        0) + 1
                );
            }

            completedStepKeysRef.current.add(current.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));

            if (payloadWeight > 0) {
                seriesAutofillWeightRef.current.set(
                    resolveSeriesWeightAutofillKey(current),
                    payloadWeight
                );
            }

            const prResult = evaluatePr(payloadWeight);
            if (prResult.isPr) {
                setPrCelebration({
                    exerciseName: current.name,
                    weight: payloadWeight,
                    previousMaxWeight: prResult.previousMaxWeight,
                });
            }

            onSetSaved?.(result, {
                isGroupRound: false,
                isTimedBlock: false,
                groupKind: currentRunStep?.groupKind,
            });
        } catch {
            onError?.("No se pudo guardar la serie");
            throw new Error("save failed");
        } finally {
            setSaving(false);
        }
    }, [
        current,
        currentRunSuggestion,
        isOnline,
        logExecution,
        onError,
        onSetSaved,
        currentRunStep,
        evaluatePr,
        postRunExecution,
        reps,
        rpe,
        sessionId,
        skipPersistForCurrentStep,
        weight,
    ]);

    const handleSaveBatch = useCallback(async () => {
        if (!currentRunStep) return;
        if (currentRunStep.kind !== "group_round" && currentRunStep.kind !== "timed_block") {
            return;
        }
        if (completedStepKeysRef.current.has(currentRunStep.stepKey)) return;
        if (skipPersistForCurrentStep(currentRunStep)) {
            completedStepKeysRef.current.add(currentRunStep.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
            onSetSaved?.("synced", {
                isGroupRound,
                isTimedBlock,
                groupKind: currentRunStep.groupKind,
            });
            return;
        }

        const isAmrap = currentRunStep.groupKind === "amrap";
        const isEmom = currentRunStep.groupKind === "emom";
        const isForTime = currentRunStep.groupKind === "for_time";

        if (isAmrap && !currentRunStep.slots?.length) return;
        if (isEmom && !currentRunStep.emomIntervals?.length) return;
        if (isForTime && !currentRunStep.forTimeRounds?.length) return;
        if (!isAmrap && !isEmom && !isForTime && !currentRunStep.slots?.length) return;

        setSaving(true);
        let lastResult: "synced" | "queued" | "offline" = "synced";

        try {
            if (isAmrap && currentRunStep.slots) {
                const payloads = buildAmrapSavePayloads({
                    fullRounds: amrapRounds,
                    slots: currentRunStep.slots.map((slot) => ({
                        stepKey: slot.stepKey,
                        blockExerciseId: slot.blockExerciseId,
                        plannedRepsPerRound: slot.defaultReps,
                        defaultWeight: slot.defaultWeight,
                        loggedSets: slot.loggedSets,
                    })),
                    partialReps: amrapPartialReps,
                    roundRpe,
                    getNextActualSets,
                });

                if (isOnline) {
                    await postTimedResult(
                        buildAmrapTimedResultPayload({
                            sessionId,
                            runStep: currentRunStep,
                            fullRounds: amrapRounds,
                            slots: currentRunStep.slots,
                            partialReps: amrapPartialReps,
                        })
                    ).unwrap();
                } else {
                    lastResult = await logTimedResult(
                        buildAmrapTimedResultPayload({
                            sessionId,
                            runStep: currentRunStep,
                            fullRounds: amrapRounds,
                            slots: currentRunStep.slots,
                            partialReps: amrapPartialReps,
                        })
                    );
                }

                for (const payload of payloads) {
                    const slot = currentRunStep.slots.find(
                        (item) => item.blockExerciseId === payload.blockExerciseId
                    );
                    if (!slot || completedStepKeysRef.current.has(slot.stepKey)) continue;

                    loggedSetsRef.current.set(
                        payload.blockExerciseId,
                        payload.data.actual_sets
                    );

                    const executionPayload = buildAthleteRunExecutionPayloadFromSlot(
                        sessionId,
                        currentRunStep,
                        slot,
                        {
                            weight: payload.data.actual_weight,
                            reps: Number.parseInt(payload.data.actual_reps, 10) || 0,
                            rpe: roundRpe,
                        },
                        slotReferences[slot.stepKey]?.suggestion
                    );

                    if (isOnline) {
                        await postRunExecution(executionPayload).unwrap();
                        lastResult = "synced";
                    } else {
                        lastResult = await logExecution(executionPayload);
                    }
                    completedStepKeysRef.current.add(slot.stepKey);
                }
            } else if (isEmom && currentRunStep.emomIntervals) {
                await saveEmomBlockRef.current();
                return;
            } else if (isForTime && currentRunStep.forTimeRounds) {
                const { totalSeconds } = forTimeDataRef.current;
                if (!isForTimeCompletionValid(totalSeconds)) {
                    return;
                }
                const payloads = buildForTimeSavePayloads({
                    rounds: currentRunStep.forTimeRounds,
                    cumulativeSplits: [],
                    totalSeconds,
                    roundRpe,
                    getNextActualSets,
                });

                if (isOnline) {
                    await postTimedResult(
                        buildForTimeTimedResultPayload({
                            sessionId,
                            runStep: currentRunStep,
                            totalSeconds,
                            cumulativeSplits: [],
                        })
                    ).unwrap();
                } else {
                    lastResult = await logTimedResult(
                        buildForTimeTimedResultPayload({
                            sessionId,
                            runStep: currentRunStep,
                            totalSeconds,
                            cumulativeSplits: [],
                        })
                    );
                }

                // Post-session %: bloques AMRAP/EMOM/FOR TIME cuentan por TimedBlockResult;
                // además persistimos sets vía payloads de ejecución abajo.

                for (const payload of payloads) {
                    const round = currentRunStep.forTimeRounds.find(
                        (item) => item.roundKey === payload.roundKey
                    );
                    const slot =
                        round?.slots.find(
                            (item) => item.blockExerciseId === payload.blockExerciseId
                        ) ?? null;

                    loggedSetsRef.current.set(
                        payload.blockExerciseId,
                        payload.data.actual_sets
                    );

                    if (slot) {
                        const executionPayload = {
                            ...buildAthleteRunExecutionPayloadFromSlot(
                                sessionId,
                                currentRunStep,
                                slot,
                                {
                                    weight: payload.data.actual_weight,
                                    reps: Number.parseInt(payload.data.actual_reps, 10) || 0,
                                    rpe: payload.data.actual_effort_value ?? roundRpe,
                                },
                                slotReferences[slot.stepKey]?.suggestion
                            ),
                            input_mode: "duration" as const,
                        };
                        if (isOnline) {
                            await postRunExecution(executionPayload).unwrap();
                            lastResult = "synced";
                        } else {
                            lastResult = await logExecution(executionPayload);
                        }
                    } else if (!isOnline) {
                        lastResult = await logSet(payload.blockExerciseId, payload.data);
                    }
                }
            } else if (currentRunStep.slots) {
                for (const slot of currentRunStep.slots) {
                    if (completedStepKeysRef.current.has(slot.stepKey)) continue;

                    const log = slotLogs[slot.stepKey] ?? {
                        weight: slot.defaultWeight,
                        reps: slot.defaultReps,
                    };

                    const nextSets = getNextActualSets(slot.blockExerciseId, slot.loggedSets);
                    loggedSetsRef.current.set(slot.blockExerciseId, nextSets);

                    const executionPayload = buildAthleteRunExecutionPayloadFromSlot(
                        sessionId,
                        currentRunStep,
                        slot,
                        {
                            weight: log.weight,
                            reps: log.reps,
                            rpe: roundRpe,
                            durationSeconds: log.durationSeconds ?? log.reps,
                        },
                        slotReferences[slot.stepKey]?.suggestion
                    );

                    if (isOnline) {
                        await postRunExecution(executionPayload).unwrap();
                        lastResult = "synced";
                    } else {
                        lastResult = await logExecution(executionPayload);
                    }

                    completedStepKeysRef.current.add(slot.stepKey);
                }
            }

            completedStepKeysRef.current.add(currentRunStep.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
            onSetSaved?.(lastResult, {
                isGroupRound,
                isTimedBlock,
                groupKind: currentRunStep.groupKind,
            });
        } catch {
            onError?.("No se pudo guardar la ronda");
            throw new Error("save failed");
        } finally {
            setSaving(false);
        }
    }, [
        amrapPartialReps,
        amrapRounds,
        currentRunStep,
        getNextActualSets,
        isGroupRound,
        isOnline,
        isTimedBlock,
        logExecution,
        logSet,
        logTimedResult,
        onError,
        onSetSaved,
        postRunExecution,
        postTimedResult,
        roundRpe,
        sessionId,
        skipPersistForCurrentStep,
        slotLogs,
        slotReferences,
    ]);

    const advanceAfterRest = useCallback(() => {
        const nextIndex = findNextPendingStepIndex(step);
        if (nextIndex < runSteps.length) {
            setStep(nextIndex);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
        }
    }, [findNextPendingStepIndex, runSteps.length, step]);

    const restAfterSeconds = useMemo(() => {
        if (!currentRunStep) return null;
        return resolveRestAfterCompletingRunStep(currentRunStep, nextRunStep);
    }, [currentRunStep, nextRunStep]);

    const isDropsetRound = currentRunStep?.groupKind === "dropset";
    const isAmrapBlock = currentRunStep?.groupKind === "amrap";
    const isEmomBlock = currentRunStep?.groupKind === "emom";
    const isForTimeBlock = currentRunStep?.groupKind === "for_time";

    const amrapPartialTotal = useMemo(() => {
        if (!isAmrapBlock || !currentRunStep?.slots?.length) return 0;
        return computeAmrapPartialTotal(
            currentRunStep.slots.map((slot) => amrapPartialReps[slot.stepKey] ?? 0)
        );
    }, [amrapPartialReps, currentRunStep?.slots, isAmrapBlock]);

    const confirmLabel = isTimedBlock
        ? isAmrapBlock || isEmomBlock || isForTimeBlock
            ? "Bloque completado"
            : "Ronda completada"
        : isGroupRound
          ? isDropsetRound
              ? "Dropset completado"
              : "Ronda completada"
          : "Serie completada";

    const isConfirmValid = useMemo(() => {
        if (isBatchStep && currentRunStep) {
            if (isAmrapBlock && currentRunStep.slots?.length) {
                return amrapRounds > 0 || amrapPartialTotal > 0;
            }

            if (isEmomBlock && currentRunStep.emomIntervals?.length) {
                return isEmomCompletionValid({
                    asPlanned: emomAsPlanned,
                    intervals: currentRunStep.emomIntervals,
                });
            }

            if (isForTimeBlock && currentRunStep.forTimeRounds?.length) {
                const total =
                    forTimeTotalSeconds > 0
                        ? forTimeTotalSeconds
                        : forTimeDataRef.current.totalSeconds;
                return isForTimeCompletionValid(total);
            }

            if (!currentRunStep.slots?.length) return false;

            const slotsValid = currentRunStep.slots.every((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    durationSeconds: slot.defaultReps,
                };
                if (slot.inputMode === "duration") {
                    return (log.durationSeconds ?? log.reps) > 0;
                }
                if (slot.inputMode === "reps_only") {
                    return log.reps > 0;
                }
                return log.reps > 0 && log.weight >= 0;
            });
            return slotsValid;
        }
        const inputMode = current?.inputMode ?? "weight_reps";
        if (inputMode === "duration") return reps > 0;
        if (inputMode === "reps_only") return reps > 0;
        return reps > 0 && weight >= 0;
    }, [
        amrapPartialTotal,
        amrapRounds,
        current,
        currentRunStep,
        emomAsPlanned,
        isAmrapBlock,
        isEmomBlock,
        isForTimeBlock,
        isBatchStep,
        slotLogs,
        reps,
        weight,
        forTimeTotalSeconds,
    ]);

    const isLastStep = step === runSteps.length - 1;
    const isCurrentStepSaved = currentStepKey
        ? savedStepKeys.has(currentStepKey) ||
          isStepSavedOnServer(currentRunStep)
        : false;
    const showStepActions = Boolean(currentRunStep) && !isCurrentStepSaved;

    const handleForTimeTotalSecondsChange = useCallback(
        (seconds: number) => {
            const clamped = clampForTimeTotalSeconds(seconds);
            setForTimeTotalSeconds(clamped);
            forTimeDataRef.current.totalSeconds = clamped;
            touchRunStepForPersist(currentRunStep ?? undefined);
        },
        [currentRunStep, touchRunStepForPersist]
    );

    const onConfirm = useCallback(async (): Promise<boolean> => {
        if (isAmrapBlock) {
            if (amrapRounds === 0 && amrapPartialTotal === 0) {
                setAmrapValidationVisible(true);
                return false;
            }
            setAmrapValidationVisible(false);
        }
        if (isBatchStep) {
            await handleSaveBatch();
        } else {
            await handleSaveSet();
        }
        return true;
    }, [
        amrapPartialTotal,
        amrapRounds,
        handleSaveBatch,
        handleSaveSet,
        isAmrapBlock,
        isBatchStep,
    ]);

    const restFlow = useAthleteRunRestFlow({
        restAfterSeconds,
        confirmLabel,
        stepKey: currentStepKey,
        onConfirm,
        onRestComplete: advanceAfterRest,
        isConfirmValid: isAmrapBlock ? true : isConfirmValid,
        requireStartBeforeLog: isDropsetRound || isTimedBlock,
        startRestLabel: isDropsetRound
            ? "Registrar dropset"
            : isAmrapBlock
              ? "Registrar AMRAP"
              : isEmomBlock
                ? getAthleteBlockStartLabel("emom")
                : isForTimeBlock
                  ? getAthleteBlockStartLabel("for_time")
                  : "Empezar descanso",
    });

    const loggerDefaultsStepRef = useRef<string | null>(null);

    useEffect(() => {
        loggerDefaultsStepRef.current = null;
    }, [currentStepKey]);

    useEffect(() => {
        if (!restFlow.showLogger || !current || isBatchStep) return;
        const defaultsKey = current.stepKey;
        if (loggerDefaultsStepRef.current === defaultsKey) return;

        const defaults = resolveRunLoggerDefaults({
            setIndex: current.setIndex,
            prescribedReps: current.defaultReps,
            prescribedRpe: current.defaultRpe,
            plannedWeight: current.plannedWeight,
            defaultWeight: current.defaultWeight,
            reference: effectiveRunReference?.reference,
        });

        const seriesPosition = Math.max(current.setIndex, current.roundIndex ?? 1);
        let nextWeight = defaults.weight;
        if (
            seriesPosition > 1 &&
            !touchedWeightStepKeysRef.current.has(current.stepKey)
        ) {
            const autofill = seriesAutofillWeightRef.current.get(
                resolveSeriesWeightAutofillKey(current)
            );
            if (autofill != null && autofill > 0) {
                nextWeight = autofill;
            }
        }
        setWeight(nextWeight);
        const nextReps =
            current.inputMode === "duration"
                ? current.plannedDurationSeconds ?? current.defaultReps
                : defaults.reps;
        setReps(nextReps);
        setRpe(defaults.rpe);
        loggerDefaultsStepRef.current = defaultsKey;
    }, [restFlow.showLogger, current, isBatchStep, effectiveRunReference?.reference]);

    useEffect(() => {
        if (
            restFlow.phase !== "logging_rest" ||
            !isGroupRound ||
            !currentRunStep?.slots?.length
        ) {
            return;
        }

        const refFingerprint = currentRunStep.slots
            .map((slot) => {
                const apiRef = slotReferences[slot.stepKey]?.reference;
                const localRef = resolveLocalRunReference({
                    exerciseId: slot.exerciseId,
                    roundIndex: currentRunStep.roundIndex,
                    slotLabel: slot.slotLabel,
                    groupKind: currentRunStep.groupKind,
                    localExecutions,
                });
                const weight = apiRef?.weight_kg ?? localRef?.weight_kg ?? "pending";
                return `${slot.stepKey}:${weight}`;
            })
            .join("|");
        const defaultsKey = `${currentRunStep.stepKey}:${refFingerprint}`;
        if (loggerDefaultsStepRef.current === defaultsKey) return;

        setSlotLogs((prev) => {
            const next = { ...prev };
            for (const slot of currentRunStep.slots!) {
                const reference =
                    slotReferences[slot.stepKey]?.reference ??
                    resolveLocalRunReference({
                        exerciseId: slot.exerciseId,
                        roundIndex: currentRunStep.roundIndex,
                        slotLabel: slot.slotLabel,
                        groupKind: currentRunStep.groupKind,
                        localExecutions,
                    });
                const defaults = resolveRunLoggerDefaults({
                    setIndex: currentRunStep.roundIndex,
                    prescribedReps: slot.defaultReps,
                    prescribedRpe: slot.defaultRpe,
                    plannedWeight: null,
                    defaultWeight: slot.defaultWeight,
                    reference,
                });
                next[slot.stepKey] = {
                    weight: defaults.weight,
                    reps: defaults.reps,
                };
            }
            return next;
        });

        const prescribedRpe =
            currentRunStep.slots.find((slot) => slot.defaultRpe != null)?.defaultRpe ??
            null;
        const refRpe = currentRunStep.slots
            .map((slot) => slotReferences[slot.stepKey]?.reference?.rpe)
            .find((value) => value != null);
        if (currentRunStep.roundIndex > 1 && refRpe != null) {
            setRoundRpe(refRpe);
        } else if (prescribedRpe != null) {
            setRoundRpe(prescribedRpe);
        }

        loggerDefaultsStepRef.current = defaultsKey;
    }, [
        restFlow.phase,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
    ]);

    const blockWork = useAthleteBlockWorkPhase(
        currentStepKey,
        isTimedBlock && showStepActions
    );

    const timedGroupKind = currentRunStep?.groupKind ?? "";

    const beginLoggingRest = useCallback(() => {
        if (currentStepKey) {
            touchedWeightStepKeysRef.current.delete(currentStepKey);
        }
        restFlow.startRest();
    }, [currentStepKey, restFlow]);

    const restFlowForUi = useMemo(
        () => ({ ...restFlow, startRest: beginLoggingRest }),
        [beginLoggingRest, restFlow]
    );

    const emomPhase = useAthleteEmomRunPhase({
        sessionId,
        currentRunStep,
        currentStepKey,
        isEmomBlock,
        isTimedBlock,
        showStepActions,
        blockWork,
        restPhase: restFlow.phase,
        timedGroupKind,
        beginLoggingRest,
        emomAsPlanned,
        emomAthleteNote,
        setEmomAsPlanned,
        setEmomAthleteNote,
        isOnline,
        roundRpe,
        slotReferences,
        getNextActualSets,
        postRunExecution,
        postTimedResult,
        logExecution,
        logTimedResult,
        logSet,
        onSetSaved,
        onError,
        completedStepKeysRef,
        setSavedStepKeys,
        setSaving,
    });
    saveEmomBlockRef.current = emomPhase.saveEmomBlock;

    const forTimeFlow = useAthleteForTimeFlow(
        currentStepKey,
        currentRunStep?.forTimeRounds ?? [],
        isForTimeBlock &&
            blockWork.isRunning &&
            restFlow.phase === "doing" &&
            showStepActions
    );

    const resolvedForTimeTotalSeconds =
        forTimeTotalSeconds > 0 ? forTimeTotalSeconds : forTimeFlow.elapsedSeconds;

    forTimeDataRef.current = {
        totalSeconds: resolvedForTimeTotalSeconds,
    };

    useEffect(() => {
        if (!isForTimeBlock || !forTimeFlow.allRoundsComplete) return;
        setForTimeTotalSeconds((previous) =>
            previous > 0 ? previous : forTimeFlow.elapsedSeconds
        );
    }, [forTimeFlow.allRoundsComplete, forTimeFlow.elapsedSeconds, isForTimeBlock]);

    const forTimeActiveGroupContext = useMemo(() => {
        if (!isForTimeBlock || !currentRunStep || !forTimeFlow.currentRound) return null;
        return buildAthleteRunGroupContextFromForTimeRound(
            currentRunStep,
            forTimeFlow.currentRound
        );
    }, [currentRunStep, forTimeFlow.currentRound, isForTimeBlock]);

    const displayGroupContext = emomPhase.mergeDisplayGroupContext(
        isForTimeBlock &&
            forTimeActiveGroupContext &&
            blockWork.isRunning &&
            restFlow.phase === "doing"
            ? forTimeActiveGroupContext
            : groupContext
    );

    const blockTimer = useAthleteBlockTimer(
        currentRunStep,
        isTimedBlock &&
            !isEmomBlock &&
            !isForTimeBlock &&
            blockWork.isRunning &&
            restFlow.phase === "doing" &&
            showStepActions
    );
    blockTimerRef.current = blockTimer.elapsedSeconds;

    const displayBlockTimer = useMemo(() => {
        if (
            isForTimeBlock &&
            blockWork.isRunning &&
            restFlow.phase === "doing"
        ) {
            return {
                displaySeconds: forTimeFlow.elapsedSeconds,
                elapsedSeconds: forTimeFlow.elapsedSeconds,
                totalSeconds: null,
                isExpired: false,
                isCountup: true,
            };
        }
        return emomPhase.mergeDisplayBlockTimer(blockTimer);
    }, [
        blockTimer,
        blockWork.isRunning,
        emomPhase,
        forTimeFlow.elapsedSeconds,
        isForTimeBlock,
        restFlow.phase,
    ]);

    const restFlowUi = useMemo(() => {
        let flow = emomPhase.enrichRestFlowUi(restFlowForUi);
        if (
            isForTimeBlock &&
            blockWork.isRunning &&
            !forTimeFlow.allRoundsComplete &&
            isTimedBlock &&
            showStepActions &&
            restFlow.phase === "doing"
        ) {
            flow = {
                ...flow,
                stickyPrimaryLabel: "Terminar",
                stickyPrimaryAction: forTimeFlow.finishBlock,
                stickyPrimaryDisabled: false,
                stickyPrimaryLoading: false,
            };
        }
        return flow;
    }, [
        blockWork.isRunning,
        emomPhase,
        forTimeFlow.allRoundsComplete,
        forTimeFlow.finishBlock,
        isForTimeBlock,
        isTimedBlock,
        restFlowForUi,
        restFlow.phase,
        showStepActions,
    ]);

    const startRestRef = useRef(beginLoggingRest);
    startRestRef.current = beginLoggingRest;

    useEffect(() => {
        if (isEmomBlock || isForTimeBlock) return;
        if (!isTimedBlock || !blockWork.isRunning) return;
        if (restFlow.phase !== "doing") return;
        if (blockTimer.isCountup || !blockTimer.isExpired) return;
        startRestRef.current();
    }, [
        blockTimer.isCountup,
        blockTimer.isExpired,
        blockWork.isRunning,
        isEmomBlock,
        isForTimeBlock,
        isTimedBlock,
        restFlow.phase,
    ]);

    // FOR TIME: «Terminar» marca allRoundsComplete → entra en logging_rest (descanso prescrito
    // post-bloque) sin esperar time cap ni splits por ronda.
    useEffect(() => {
        if (!isForTimeBlock || !forTimeFlow.allRoundsComplete) return;
        if (!blockWork.isRunning) return;
        if (restFlow.phase !== "doing") return;
        startRestRef.current();
    }, [
        blockWork.isRunning,
        forTimeFlow.allRoundsComplete,
        isForTimeBlock,
        restFlow.phase,
    ]);

    const forTimeTechniqueSlots: AthleteRunRoundSlot[] = useMemo(() => {
        if (currentRunStep?.forTimeRounds?.length) {
            return currentRunStep.forTimeRounds.flatMap((round) => round.slots);
        }
        return currentRunStep?.slots ?? [];
    }, [currentRunStep?.forTimeRounds, currentRunStep?.slots]);

    const forTimeReferenceLabel = useMemo(() => {
        const total = forTimeFlow.roundTotal;
        if (total <= 0) return null;
        return total === 1 ? "1 ronda (referencia)" : `${total} rondas (referencia)`;
    }, [forTimeFlow.roundTotal]);

    const handleFinish = useCallback(async () => {
        setCompleting(true);
        try {
            const result = await finishSession();
            onSessionFinished?.(result);
            if (result === "synced") {
                navigate(`/dashboard/sessions/${sessionId}/feedback?from=finish`);
            } else {
                navigate("/dashboard/sessions");
            }
        } catch {
            onError?.("No se pudo completar la sesión");
        } finally {
            setCompleting(false);
        }
    }, [finishSession, navigate, onError, onSessionFinished, sessionId]);

    const loadingFromNetwork = loadingSession || loadingStructure;
    const waitingForCache = !isOnline && loadingFromNetwork && !cachedSnapshot;
    const isLoading = (loadingFromNetwork && !isUsingCache && isOnline) || waitingForCache;

    const timedBlockClockActive =
        showStepActions &&
        isTimedBlock &&
        blockWork.isRunning &&
        restFlow.phase === "doing" &&
        !(isForTimeBlock && forTimeFlow.allRoundsComplete) &&
        !(isEmomBlock && emomPhase.emomAllIntervalsComplete);

    const restWakeLockActive =
        showStepActions &&
        restFlow.hasRestTimer &&
        restFlow.remainingSeconds > 0 &&
        (restFlow.phase === "logging_rest" || restFlow.phase === "rest_overlay");

    useAthleteRunWakeLock(timedBlockClockActive || restWakeLockActive);

    return {
        session,
        isOnline,
        pendingCount,
        runSteps,
        flatExercises,
        step,
        currentRunStep,
        isGroupRound,
        isTimedBlock,
        current,
        groupContext: displayGroupContext,
        slotLogs,
        updateSlotLog,
        roundRpe,
        setRoundRpe: handleRoundRpeChange,
        amrapRounds,
        setAmrapRounds,
        amrapPartialReps,
        updateAmrapPartialReps,
        amrapValidationVisible,
        resetAmrapValidation: () => setAmrapValidationVisible(false),
        emomAsPlanned,
        setEmomAsPlanned: emomPhase.handleEmomAsPlannedChange,
        emomAthleteNote,
        setEmomAthleteNote,
        convertAmrapPartialToFullRound,
        emomTemplateSlots: emomPhase.emomTemplateSlots,
        emomIntervalLabel: emomPhase.emomIntervalLabel,
        emomTechniqueSlots: emomPhase.emomTechniqueSlots,
        forTimeRoundLabel: forTimeReferenceLabel ?? forTimeFlow.roundLabel,
        forTimeTotalSeconds,
        onForTimeTotalSecondsChange: handleForTimeTotalSecondsChange,
        forTimeRoundTotal: forTimeFlow.roundTotal,
        forTimeTechniqueSlots,
        blockTimer: displayBlockTimer,
        blockWorkIsReady: blockWork.isReady,
        weight,
        reps,
        rpe,
        setWeight: handleWeightChange,
        setReps: handleRepsChange,
        setRpe: handleRpeChange,
        saving,
        completing,
        restFlow: restFlowUi,
        handleFinish,
        isLoading,
        isLastStep,
        showStepActions,
        isCurrentStepSaved,
        prCelebration,
        runReference: effectiveRunReference,
        isRunReferenceLoading,
        timedRunReference,
        isTimedRunReferenceLoading,
        slotReferences,
        isSlotReferencesLoading,
        applyReferenceValues,
        applySuggestionValues,
        runProgress,
        progressPendingStepCount: runProgress?.pending_count ?? 0,
        sessionName: session?.session_name ?? "Entrenamiento",
        finishSession,
    };
}
