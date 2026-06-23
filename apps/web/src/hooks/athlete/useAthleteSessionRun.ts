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
import { useGetAthleteLastPerformanceQuery, useGetAthleteSuggestedLoadQuery } from "@nexia/shared/api/athleteApi";
import { hasAthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import { shouldShowSuggestedLoad } from "@nexia/shared/types/athleteSuggestedLoad";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useOfflineSessionLog } from "@nexia/shared/hooks/offline";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    buildAthleteRunSteps,
    resolveRestAfterCompletingRunStep,
    runStepToFlatExercise,
    type AthleteRunRoundSlot,
    type AthleteRunStep,
} from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    buildAthleteRunGroupContext,
    buildAthleteRunGroupContextFromEmomInterval,
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
import {
    buildEmomFailureEntryDefaults,
    buildEmomSavePayloads,
    getEmomTemplateSlots,
    isEmomCompletionValid,
    resizeEmomFailureEntries,
    type EmomFailureEntry,
} from "@nexia/shared/utils/athlete/emomResult";
import {
    buildForTimeSavePayloads,
    isForTimeCompletionValid,
} from "@nexia/shared/utils/athlete/forTimeResult";
import type { SlotLogValues } from "@/components/athlete/execution/AthleteMultiSlotLogger";
import { useAthleteExercisePr } from "@/hooks/athlete/useAthleteExercisePr";
import { useAthleteRunRestFlow } from "@/hooks/athlete/useAthleteRunRestFlow";
import { useAthleteBlockTimer } from "@/hooks/athlete/useAthleteBlockTimer";
import { useAthleteBlockWorkPhase } from "@/hooks/athlete/useAthleteBlockWorkPhase";
import { useAthleteEmomFlow } from "@/hooks/athlete/useAthleteEmomFlow";
import { useAthleteForTimeFlow } from "@/hooks/athlete/useAthleteForTimeFlow";
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
                            notes: data.notes,
                        },
                    }).unwrap();
                    return;
                }
                await updateBlockExercise({ id: blockExerciseId, data }).unwrap();
            },
            completeSession: async (sid: number) => {
                await updateSession({ id: sid, body: { status: "completed" } }).unwrap();
            },
        }),
        [structureSource, updateBlockExercise, updateSessionExercise, updateSession, clientId]
    );

    const {
        isOnline,
        pendingCount,
        cachedSnapshot,
        isUsingCache,
        logSet,
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
    const [amrapRounds, setAmrapRounds] = useState(0);
    const [amrapPartialReps, setAmrapPartialReps] = useState<Record<string, number>>({});
    const [amrapPartialOpen, setAmrapPartialOpen] = useState(false);
    const [emomAsPlanned, setEmomAsPlanned] = useState<boolean | null>(null);
    const [emomFailedCount, setEmomFailedCount] = useState(0);
    const [emomFailureEntries, setEmomFailureEntries] = useState<EmomFailureEntry[]>([]);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [prCelebration, setPrCelebration] = useState<AthletePrCelebration | null>(null);

    const loggedSetsRef = useRef<Map<number, number>>(new Map());
    const completedStepKeysRef = useRef<Set<string>>(new Set());
    const [savedStepKeys, setSavedStepKeys] = useState<ReadonlySet<string>>(() => new Set());

    useEffect(() => {
        setStep(0);
        loggedSetsRef.current = new Map();
        completedStepKeysRef.current = new Set();
        setSavedStepKeys(new Set());
        setSlotLogs({});
        setRoundRpe(null);
        setAmrapRounds(0);
        setAmrapPartialReps({});
        setAmrapPartialOpen(false);
        setEmomAsPlanned(null);
        setEmomFailedCount(0);
        setEmomFailureEntries([]);
    }, [sessionId]);

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

    const { data: lastPerformance } = useGetAthleteLastPerformanceQuery(
        singleExerciseId ?? 0,
        { skip: !singleExerciseId }
    );

    const { data: suggestedLoad } = useGetAthleteSuggestedLoadQuery(
        singleExerciseId ?? 0,
        { skip: !singleExerciseId }
    );

    const applyLastPerformance = useCallback(() => {
        if (!hasAthleteLastPerformance(lastPerformance)) return;
        setWeight(lastPerformance.weight_kg);
        if (lastPerformance.reps != null) {
            setReps(lastPerformance.reps);
        }
        if (lastPerformance.rpe != null) {
            setRpe(lastPerformance.rpe);
        }
    }, [lastPerformance]);

    const applySuggestedLoad = useCallback(() => {
        if (!shouldShowSuggestedLoad(suggestedLoad)) return;
        setWeight(suggestedLoad.suggested_weight_kg);
        if (suggestedLoad.basis?.reps != null) {
            setReps(suggestedLoad.basis.reps);
        }
        if (suggestedLoad.basis?.rpe != null) {
            setRpe(suggestedLoad.basis.rpe);
        }
    }, [suggestedLoad]);

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
            setAmrapPartialOpen((prev) => (prev === false ? prev : false));
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomFailedCount((prev) => (prev === 0 ? prev : 0));
            setEmomFailureEntries((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        if (runStep.groupKind === "emom" && runStep.emomIntervals?.length) {
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomFailedCount((prev) => (prev === 0 ? prev : 0));
            setEmomFailureEntries((prev) => (prev.length === 0 ? prev : []));
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
        setAmrapPartialOpen((prev) => (prev === false ? prev : false));
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
    const forTimeDataRef = useRef<{ cumulativeSplits: number[]; totalSeconds: number }>({
        cumulativeSplits: [],
        totalSeconds: 0,
    });

    const updateSlotLog = useCallback((slotKey: string, patch: Partial<SlotLogValues>) => {
        setSlotLogs((prev) => {
            const current = prev[slotKey];
            if (!current) return prev;
            return { ...prev, [slotKey]: { ...current, ...patch } };
        });
    }, []);

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

    const emomTemplateSlots = useMemo(
        () =>
            currentRunStep?.emomIntervals?.length
                ? getEmomTemplateSlots(currentRunStep.emomIntervals)
                : [],
        [currentRunStep?.emomIntervals]
    );

    const updateEmomFailureEntry = useCallback(
        (entryIndex: number, stepKey: string, value: number) => {
            setEmomFailureEntries((prev) => {
                const next = [...prev];
                const entry = { ...(next[entryIndex] ?? {}) };
                entry[stepKey] = value;
                next[entryIndex] = entry;
                return next;
            });
        },
        []
    );

    const handleEmomAsPlannedChange = useCallback(
        (value: boolean) => {
            setEmomAsPlanned(value);
            if (value) {
                setEmomFailedCount(0);
                setEmomFailureEntries([]);
                return;
            }
            setEmomFailedCount(1);
            setEmomFailureEntries([buildEmomFailureEntryDefaults(emomTemplateSlots)]);
        },
        [emomTemplateSlots]
    );

    const handleEmomFailedCountChange = useCallback(
        (value: number) => {
            const total = currentRunStep?.emomIntervals?.length ?? 1;
            const nextCount = Math.max(1, Math.min(total, value));
            setEmomFailedCount(nextCount);
            setEmomFailureEntries((prev) =>
                resizeEmomFailureEntries(prev, nextCount, emomTemplateSlots)
            );
        },
        [currentRunStep?.emomIntervals?.length, emomTemplateSlots]
    );

    const getNextActualSets = useCallback((blockExerciseId: number, loggedSets = 0) => {
        const fromRef = loggedSetsRef.current.get(blockExerciseId) ?? 0;
        return Math.max(fromRef, loggedSets) + 1;
    }, []);

    const handleSaveSet = useCallback(async () => {
        if (!current) return;
        if (completedStepKeysRef.current.has(current.stepKey)) return;

        setSaving(true);
        try {
            const nextSets = getNextActualSets(current.blockExerciseId, current.loggedSets ?? 0);
            loggedSetsRef.current.set(current.blockExerciseId, nextSets);

            const result = await logSet(current.blockExerciseId, {
                actual_weight: weight,
                actual_reps: String(reps),
                actual_sets: nextSets,
                actual_effort_value: rpe ?? undefined,
            });

            completedStepKeysRef.current.add(current.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));

            const prResult = evaluatePr(weight);
            if (prResult.isPr) {
                setPrCelebration({
                    exerciseName: current.name,
                    weight,
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
        getNextActualSets,
        logSet,
        onError,
        onSetSaved,
        currentRunStep,
        evaluatePr,
        reps,
        rpe,
        weight,
    ]);

    const handleSaveBatch = useCallback(async () => {
        if (!currentRunStep) return;
        if (currentRunStep.kind !== "group_round" && currentRunStep.kind !== "timed_block") {
            return;
        }
        if (completedStepKeysRef.current.has(currentRunStep.stepKey)) return;

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

                for (const payload of payloads) {
                    const slot = currentRunStep.slots.find(
                        (item) => item.blockExerciseId === payload.blockExerciseId
                    );
                    if (!slot || completedStepKeysRef.current.has(slot.stepKey)) continue;

                    loggedSetsRef.current.set(
                        payload.blockExerciseId,
                        payload.data.actual_sets
                    );

                    lastResult = await logSet(payload.blockExerciseId, payload.data);
                    completedStepKeysRef.current.add(slot.stepKey);
                }
            } else if (isEmom && currentRunStep.emomIntervals) {
                if (emomAsPlanned === null) return;

                const payloads = buildEmomSavePayloads({
                    intervals: currentRunStep.emomIntervals,
                    asPlanned: emomAsPlanned,
                    failedCount: emomFailedCount,
                    failureEntries: emomFailureEntries,
                    templateSlots: emomTemplateSlots,
                    roundRpe,
                });

                for (const payload of payloads) {
                    const nextSets = getNextActualSets(
                        payload.blockExerciseId,
                        payload.loggedSets
                    );
                    loggedSetsRef.current.set(payload.blockExerciseId, nextSets);

                    lastResult = await logSet(payload.blockExerciseId, {
                        ...payload.data,
                        actual_sets: nextSets,
                    });
                }
            } else         if (isForTime && currentRunStep.forTimeRounds) {
                const { cumulativeSplits, totalSeconds } = forTimeDataRef.current;
                if (
                    !isForTimeCompletionValid(
                        cumulativeSplits,
                        currentRunStep.forTimeRounds.length
                    )
                ) {
                    return;
                }
                const payloads = buildForTimeSavePayloads({
                    rounds: currentRunStep.forTimeRounds,
                    cumulativeSplits,
                    totalSeconds,
                    roundRpe,
                    getNextActualSets,
                });

                for (const payload of payloads) {
                    loggedSetsRef.current.set(
                        payload.blockExerciseId,
                        payload.data.actual_sets
                    );

                    lastResult = await logSet(payload.blockExerciseId, payload.data);
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

                    lastResult = await logSet(slot.blockExerciseId, {
                        actual_weight: log.weight,
                        actual_reps: String(log.reps),
                        actual_sets: nextSets,
                        actual_effort_value: roundRpe ?? undefined,
                    });

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
        emomAsPlanned,
        emomFailedCount,
        emomFailureEntries,
        emomTemplateSlots,
        getNextActualSets,
        isGroupRound,
        isTimedBlock,
        logSet,
        onError,
        onSetSaved,
        roundRpe,
        slotLogs,
    ]);

    const onConfirm = isBatchStep ? handleSaveBatch : handleSaveSet;

    const advanceAfterRest = useCallback(() => {
        if (step < runSteps.length - 1) {
            setStep((s) => s + 1);
        }
    }, [runSteps.length, step]);

    const restAfterSeconds = useMemo(() => {
        if (!currentRunStep) return null;
        return resolveRestAfterCompletingRunStep(currentRunStep, nextRunStep);
    }, [currentRunStep, nextRunStep]);

    const isDropsetRound = currentRunStep?.groupKind === "dropset";
    const isAmrapBlock = currentRunStep?.groupKind === "amrap";
    const isEmomBlock = currentRunStep?.groupKind === "emom";
    const isForTimeBlock = currentRunStep?.groupKind === "for_time";

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
                const partialTotal = computeAmrapPartialTotal(
                    currentRunStep.slots.map(
                        (slot) => amrapPartialReps[slot.stepKey] ?? 0
                    )
                );
                return amrapRounds > 0 || partialTotal > 0;
            }

            if (isEmomBlock && currentRunStep.emomIntervals?.length) {
                return isEmomCompletionValid({
                    asPlanned: emomAsPlanned,
                    failedCount: emomFailedCount,
                    failureEntries: emomFailureEntries,
                    intervals: currentRunStep.emomIntervals,
                    templateSlots: emomTemplateSlots,
                });
            }

            if (isForTimeBlock && currentRunStep.forTimeRounds?.length) {
                return isForTimeCompletionValid(
                    forTimeDataRef.current.cumulativeSplits,
                    currentRunStep.forTimeRounds.length
                );
            }

            if (!currentRunStep.slots?.length) return false;

            const slotsValid = currentRunStep.slots.every((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                };
                return log.reps > 0 && log.weight >= 0;
            });
            return slotsValid;
        }
        return reps > 0 && weight >= 0;
    }, [
        amrapPartialReps,
        amrapRounds,
        currentRunStep,
        emomAsPlanned,
        emomFailedCount,
        emomFailureEntries,
        emomTemplateSlots,
        isAmrapBlock,
        isEmomBlock,
        isForTimeBlock,
        isBatchStep,
        slotLogs,
        reps,
        weight,
    ]);

    const isLastStep = step === runSteps.length - 1;
    const isCurrentStepSaved = currentStepKey
        ? savedStepKeys.has(currentStepKey)
        : false;
    const showStepActions = Boolean(currentRunStep) && !isCurrentStepSaved;

    const restFlow = useAthleteRunRestFlow({
        restAfterSeconds,
        confirmLabel,
        stepKey: currentStepKey,
        onConfirm,
        onRestComplete: advanceAfterRest,
        isConfirmValid,
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

    const blockWork = useAthleteBlockWorkPhase(
        currentStepKey,
        isTimedBlock && showStepActions
    );

    const emomFlow = useAthleteEmomFlow(
        currentStepKey,
        currentRunStep?.emomIntervals ?? [],
        currentRunStep?.intervalSeconds ?? 60,
        isEmomBlock &&
            blockWork.isRunning &&
            restFlow.phase === "doing" &&
            showStepActions
    );

    const forTimeFlow = useAthleteForTimeFlow(
        currentStepKey,
        currentRunStep?.forTimeRounds ?? [],
        isForTimeBlock &&
            blockWork.isRunning &&
            restFlow.phase === "doing" &&
            showStepActions
    );

    forTimeDataRef.current = {
        cumulativeSplits: [...forTimeFlow.cumulativeSplits],
        totalSeconds: forTimeFlow.elapsedSeconds,
    };

    const emomActiveGroupContext = useMemo(() => {
        if (!isEmomBlock || !currentRunStep || !emomFlow.currentInterval) return null;
        return buildAthleteRunGroupContextFromEmomInterval(
            currentRunStep,
            emomFlow.currentInterval
        );
    }, [currentRunStep, emomFlow.currentInterval, isEmomBlock]);

    const forTimeActiveGroupContext = useMemo(() => {
        if (!isForTimeBlock || !currentRunStep || !forTimeFlow.currentRound) return null;
        return buildAthleteRunGroupContextFromForTimeRound(
            currentRunStep,
            forTimeFlow.currentRound
        );
    }, [currentRunStep, forTimeFlow.currentRound, isForTimeBlock]);

    const displayGroupContext =
        isEmomBlock && emomActiveGroupContext && blockWork.isRunning && restFlow.phase === "doing"
            ? emomActiveGroupContext
            : isForTimeBlock &&
                forTimeActiveGroupContext &&
                blockWork.isRunning &&
                restFlow.phase === "doing"
              ? forTimeActiveGroupContext
              : groupContext;

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
        if (!isEmomBlock || !blockWork.isRunning || restFlow.phase !== "doing") {
            return blockTimer;
        }
        return {
            displaySeconds: emomFlow.displaySeconds,
            elapsedSeconds: emomFlow.totalSeconds - emomFlow.displaySeconds,
            totalSeconds: emomFlow.totalSeconds,
            isExpired: false,
            isCountup: false,
        };
    }, [
        blockTimer,
        blockWork.isRunning,
        emomFlow.displaySeconds,
        emomFlow.totalSeconds,
        forTimeFlow.elapsedSeconds,
        isEmomBlock,
        isForTimeBlock,
        restFlow.phase,
    ]);

    const timedGroupKind = currentRunStep?.groupKind ?? "";

    const restFlowUi = useMemo(() => {
        if (!isTimedBlock || !showStepActions || restFlow.phase !== "doing") {
            return restFlow;
        }
        if (blockWork.isReady) {
            return {
                ...restFlow,
                stickyPrimaryLabel: getAthleteBlockStartLabel(timedGroupKind),
                stickyPrimaryAction: blockWork.start,
                stickyPrimaryDisabled: false,
                stickyPrimaryLoading: false,
            };
        }
        if (isEmomBlock && blockWork.isRunning && !emomFlow.allIntervalsComplete) {
            return {
                ...restFlow,
                stickyPrimaryLabel: undefined,
                stickyPrimaryAction: undefined,
                stickyPrimaryDisabled: true,
                stickyPrimaryLoading: false,
            };
        }
        if (isForTimeBlock && blockWork.isRunning && !forTimeFlow.allRoundsComplete) {
            const isLastForTimeRound =
                forTimeFlow.roundTotal > 0 &&
                forTimeFlow.roundIndex >= forTimeFlow.roundTotal - 1;
            return {
                ...restFlow,
                stickyPrimaryLabel: isLastForTimeRound
                    ? "Registrar tiempo final"
                    : `Ronda ${forTimeFlow.roundIndex + 1} completada`,
                stickyPrimaryAction: forTimeFlow.completeRound,
                stickyPrimaryDisabled: false,
                stickyPrimaryLoading: false,
            };
        }
        if (isForTimeBlock && blockWork.isRunning && forTimeFlow.allRoundsComplete) {
            return {
                ...restFlow,
                stickyPrimaryLabel: undefined,
                stickyPrimaryAction: undefined,
                stickyPrimaryDisabled: true,
                stickyPrimaryLoading: false,
            };
        }
        return restFlow;
    }, [
        blockWork.isReady,
        blockWork.isRunning,
        blockWork.start,
        emomFlow.allIntervalsComplete,
        forTimeFlow.allRoundsComplete,
        forTimeFlow.completeRound,
        forTimeFlow.roundIndex,
        forTimeFlow.roundTotal,
        isEmomBlock,
        isForTimeBlock,
        isTimedBlock,
        restFlow,
        showStepActions,
        timedGroupKind,
    ]);

    const startRestRef = useRef(restFlow.startRest);
    startRestRef.current = restFlow.startRest;

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

    useEffect(() => {
        if (!isEmomBlock || !emomFlow.allIntervalsComplete) return;
        if (!blockWork.isRunning) return;
        if (restFlow.phase !== "doing") return;
        startRestRef.current();
    }, [
        blockWork.isRunning,
        emomFlow.allIntervalsComplete,
        isEmomBlock,
        restFlow.phase,
    ]);

    const forTimeTechniqueSlots: AthleteRunRoundSlot[] = useMemo(() => {
        if (forTimeFlow.currentRound?.slots.length) {
            return forTimeFlow.currentRound.slots;
        }
        return currentRunStep?.forTimeRounds?.[0]?.slots ?? currentRunStep?.slots ?? [];
    }, [currentRunStep?.forTimeRounds, currentRunStep?.slots, forTimeFlow.currentRound]);

    const emomTechniqueSlots: AthleteRunRoundSlot[] = useMemo(() => {
        if (emomFlow.currentInterval?.slots.length) {
            return emomFlow.currentInterval.slots;
        }
        return currentRunStep?.emomIntervals?.[0]?.slots ?? currentRunStep?.slots ?? [];
    }, [currentRunStep?.emomIntervals, currentRunStep?.slots, emomFlow.currentInterval]);

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
        setRoundRpe,
        amrapRounds,
        setAmrapRounds,
        amrapPartialReps,
        updateAmrapPartialReps,
        amrapPartialOpen,
        setAmrapPartialOpen,
        emomAsPlanned,
        setEmomAsPlanned: handleEmomAsPlannedChange,
        emomFailedCount,
        setEmomFailedCount: handleEmomFailedCountChange,
        emomFailureEntries,
        updateEmomFailureEntry,
        emomTemplateSlots,
        emomIntervalLabel: emomFlow.intervalLabel,
        emomTechniqueSlots,
        forTimeRoundLabel: forTimeFlow.roundLabel,
        forTimeRoundIndex: forTimeFlow.roundIndex,
        forTimeRoundTotal: forTimeFlow.roundTotal,
        forTimeSplitViews: forTimeFlow.splitViews,
        forTimeRoundAdvanceCue: forTimeFlow.roundAdvanceCue,
        forTimeCumulativeSplits: forTimeFlow.cumulativeSplits,
        forTimeTechniqueSlots,
        blockTimer: displayBlockTimer,
        blockWorkIsReady: blockWork.isReady,
        weight,
        reps,
        rpe,
        setWeight,
        setReps,
        setRpe,
        saving,
        completing,
        restFlow: restFlowUi,
        handleFinish,
        isLoading,
        isLastStep,
        showStepActions,
        isCurrentStepSaved,
        prCelebration,
        lastPerformance,
        applyLastPerformance,
        suggestedLoad,
        applySuggestedLoad,
    };
}
