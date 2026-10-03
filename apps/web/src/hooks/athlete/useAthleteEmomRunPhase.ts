/**
 * useAthleteEmomRunPhase.ts — EMOM en guiado: timer, sticky P1-7, persistencia (extracción FE-4/bridge).
 */

import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import type {
    AthleteRunExecutionCreate,
    AthleteRunTimedResultCreate,
} from "@nexia/shared/types/athleteRunReference";
import { buildAthleteRunExecutionPayloadFromSlot } from "@nexia/shared/utils/athlete/runReferenceUtils";
import { buildEmomTimedResultPayload } from "@nexia/shared/utils/athlete/timedBlockRunUtils";
import {
    buildEmomSavePayloads,
    getEmomTemplateSlots,
    type EmomFailureEntry,
    resolveEmomFailureState,
} from "@nexia/shared/utils/athlete/emomResult";
import {
    buildAthleteRunGroupContextFromEmomInterval,
    type AthleteRunGroupContextView,
} from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import type { AthleteRunRoundSlot, AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { getAthleteBlockStartLabel } from "@/components/athlete/execution/athleteRunPresentation";
import { useAthleteEmomFlow } from "@/hooks/athlete/useAthleteEmomFlow";
import type { AthleteRunRestPhase } from "@/hooks/athlete/useAthleteRunRestFlow";
import type { AthleteSessionRunSaveContext } from "@/hooks/athlete/useAthleteSessionRun";
import type { UseAthleteBlockTimerResult } from "@/hooks/athlete/useAthleteBlockTimer";
import type { useAthleteBlockWorkPhase } from "@/hooks/athlete/useAthleteBlockWorkPhase";

type BlockWorkPhase = ReturnType<typeof useAthleteBlockWorkPhase>;
type BlockTimerState = UseAthleteBlockTimerResult;

export interface EmomRestFlowUi {
    stickyPrimaryLabel?: string;
    stickyPrimaryAction?: () => void;
    stickyPrimaryDisabled?: boolean;
    stickyPrimaryLoading?: boolean;
}

export interface UseAthleteEmomRunPhaseOptions {
    sessionId: number;
    currentRunStep: AthleteRunStep | undefined;
    currentStepKey: string | null;
    isEmomBlock: boolean;
    isTimedBlock: boolean;
    showStepActions: boolean;
    blockWork: BlockWorkPhase;
    restPhase: AthleteRunRestPhase;
    timedGroupKind: string;
    beginLoggingRest: () => void;
    emomAsPlanned: boolean | null;
    emomAthleteNote: string;
    setEmomAsPlanned: (value: boolean | null) => void;
    setEmomAthleteNote: (value: string) => void;
    isOnline: boolean;
    roundRpe: number | null;
    slotReferences: Record<
        string,
        { suggestion?: import("@nexia/shared/types/athleteRunSuggestion").AthleteRunSuggestion | null }
    >;
    getNextActualSets: (blockExerciseId: number, loggedSets?: number) => number;
    postRunExecution: (payload: AthleteRunExecutionCreate) => { unwrap: () => Promise<unknown> };
    postTimedResult: (payload: AthleteRunTimedResultCreate) => { unwrap: () => Promise<unknown> };
    logExecution: (payload: AthleteRunExecutionCreate) => Promise<"synced" | "queued" | "offline">;
    logTimedResult: (payload: AthleteRunTimedResultCreate) => Promise<"synced" | "queued" | "offline">;
    logSet: (
        blockExerciseId: number,
        data: Record<string, unknown>
    ) => Promise<"synced" | "queued" | "offline">;
    onSetSaved?: (result: "synced" | "queued" | "offline", context: AthleteSessionRunSaveContext) => void;
    onError?: (message: string) => void;
    completedStepKeysRef: MutableRefObject<Set<string>>;
    setSavedStepKeys: (keys: ReadonlySet<string>) => void;
    setSaving: (value: boolean) => void;
}

export function useAthleteEmomRunPhase({
    sessionId,
    currentRunStep,
    currentStepKey,
    isEmomBlock,
    isTimedBlock,
    showStepActions,
    blockWork,
    restPhase,
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
}: UseAthleteEmomRunPhaseOptions) {
    const emomTemplateSlots = useMemo(
        () =>
            currentRunStep?.emomIntervals?.length
                ? getEmomTemplateSlots(currentRunStep.emomIntervals)
                : [],
        [currentRunStep?.emomIntervals]
    );

    const handleEmomAsPlannedChange = useCallback(
        (value: boolean) => {
            setEmomAsPlanned(value);
            if (value) setEmomAthleteNote("");
        },
        [setEmomAsPlanned, setEmomAthleteNote]
    );

    const emomFlow = useAthleteEmomFlow(
        currentStepKey,
        currentRunStep?.emomIntervals ?? [],
        currentRunStep?.intervalSeconds ?? 60,
        isEmomBlock &&
            blockWork.isRunning &&
            restPhase === "doing" &&
            showStepActions
    );

    const emomActiveGroupContext = useMemo((): AthleteRunGroupContextView | null => {
        if (!isEmomBlock || !currentRunStep || !emomFlow.currentInterval) return null;
        return buildAthleteRunGroupContextFromEmomInterval(
            currentRunStep,
            emomFlow.currentInterval
        );
    }, [currentRunStep, emomFlow.currentInterval, isEmomBlock]);

    const emomTechniqueSlots: AthleteRunRoundSlot[] = useMemo(() => {
        if (emomFlow.currentInterval?.slots.length) {
            return emomFlow.currentInterval.slots;
        }
        return currentRunStep?.emomIntervals?.[0]?.slots ?? currentRunStep?.slots ?? [];
    }, [currentRunStep?.emomIntervals, currentRunStep?.slots, emomFlow.currentInterval]);

    const startRestRef = useRef(beginLoggingRest);
    startRestRef.current = beginLoggingRest;

    useEffect(() => {
        if (!isEmomBlock || !emomFlow.allIntervalsComplete) return;
        if (!blockWork.isRunning) return;
        if (restPhase !== "doing") return;
        startRestRef.current();
    }, [blockWork.isRunning, emomFlow.allIntervalsComplete, isEmomBlock, restPhase]);

    const mergeDisplayGroupContext = useCallback(
        (groupContext: AthleteRunGroupContextView | null): AthleteRunGroupContextView | null => {
            if (
                isEmomBlock &&
                emomActiveGroupContext &&
                blockWork.isRunning &&
                restPhase === "doing"
            ) {
                return emomActiveGroupContext;
            }
            return groupContext;
        },
        [blockWork.isRunning, emomActiveGroupContext, isEmomBlock, restPhase]
    );

    const mergeDisplayBlockTimer = useCallback(
        (blockTimer: BlockTimerState): BlockTimerState => {
            if (!isEmomBlock || !blockWork.isRunning || restPhase !== "doing") {
                return blockTimer;
            }
            return {
                displaySeconds: emomFlow.displaySeconds,
                elapsedSeconds: emomFlow.totalSeconds - emomFlow.displaySeconds,
                totalSeconds: emomFlow.totalSeconds,
                isExpired: false,
                isCountup: false,
            };
        },
        [
            blockWork.isRunning,
            emomFlow.displaySeconds,
            emomFlow.totalSeconds,
            isEmomBlock,
            restPhase,
        ]
    );

    const enrichRestFlowUi = useCallback(
        <T extends Record<string, unknown>>(flow: T): T => {
            if (!isTimedBlock || !showStepActions || restPhase !== "doing") {
                return flow;
            }
            if (blockWork.isReady) {
                return {
                    ...flow,
                    stickyPrimaryLabel: getAthleteBlockStartLabel(timedGroupKind),
                    stickyPrimaryAction: blockWork.start,
                    stickyPrimaryDisabled: false,
                    stickyPrimaryLoading: false,
                };
            }
            if (isEmomBlock && blockWork.isRunning && !emomFlow.allIntervalsComplete) {
                return {
                    ...flow,
                    stickyPrimaryLabel: "Terminar",
                    stickyPrimaryAction: emomFlow.finishEarly,
                    stickyPrimaryDisabled: false,
                    stickyPrimaryLoading: false,
                };
            }
            return flow;
        },
        [
            blockWork.isReady,
            blockWork.isRunning,
            blockWork.start,
            emomFlow.allIntervalsComplete,
            emomFlow.finishEarly,
            isEmomBlock,
            isTimedBlock,
            restPhase,
            showStepActions,
            timedGroupKind,
        ]
    );

    const saveEmomBlock = useCallback(async (): Promise<"synced" | "queued" | "offline"> => {
        if (!currentRunStep?.emomIntervals?.length) return "synced";
        if (emomAsPlanned === null) return "synced";

        const intervalTotal = currentRunStep.emomIntervals.length;
        const completedCount = emomFlow.completedIntervalCount;
        const failedCount =
            emomAsPlanned || !emomFlow.finishedEarly
                ? 0
                : Math.max(0, intervalTotal - completedCount);

        const emomFailureState = emomAsPlanned
            ? { failedCount: 0, failureEntries: [] as EmomFailureEntry[] }
            : resolveEmomFailureState({
                  intervals: currentRunStep.emomIntervals,
                  templateSlots: emomTemplateSlots,
                  asPlanned: false,
              });

        const effectiveFailedCount = emomFlow.finishedEarly && !emomAsPlanned
            ? failedCount
            : emomFailureState.failedCount;

        const payloads = buildEmomSavePayloads({
            intervals: currentRunStep.emomIntervals,
            asPlanned: emomAsPlanned,
            failedCount: effectiveFailedCount,
            failureEntries: emomFailureState.failureEntries,
            templateSlots: emomTemplateSlots,
            roundRpe,
        });

        const emomTimedPayload = buildEmomTimedResultPayload({
            sessionId,
            runStep: currentRunStep,
            intervals: currentRunStep.emomIntervals,
            asPlanned: emomAsPlanned,
            failedCount: effectiveFailedCount,
            athleteNote: emomAthleteNote,
            completedIntervalCount: completedCount,
            finishedEarly: emomFlow.finishedEarly,
        });

        let lastResult: "synced" | "queued" | "offline" = "synced";

        setSaving(true);
        try {
            if (isOnline) {
                await postTimedResult(emomTimedPayload).unwrap();
            } else {
                lastResult = await logTimedResult(emomTimedPayload);
            }

            for (const payload of payloads) {
                const interval = currentRunStep.emomIntervals.find(
                    (item) => item.intervalKey === payload.intervalKey
                );
                const slot =
                    interval?.slots.find(
                        (item) => item.blockExerciseId === payload.blockExerciseId
                    ) ?? null;

                const nextSets = getNextActualSets(payload.blockExerciseId, payload.loggedSets);

                if (slot) {
                    const executionPayload = buildAthleteRunExecutionPayloadFromSlot(
                        sessionId,
                        currentRunStep,
                        slot,
                        {
                            weight: payload.data.actual_weight,
                            reps: Number.parseInt(payload.data.actual_reps, 10) || 0,
                            rpe: payload.data.actual_effort_value ?? roundRpe,
                        },
                        slotReferences[slot.stepKey]?.suggestion
                    );
                    if (isOnline) {
                        await postRunExecution(executionPayload).unwrap();
                        lastResult = "synced";
                    } else {
                        lastResult = await logExecution(executionPayload);
                    }
                } else if (!isOnline) {
                    lastResult = await logSet(payload.blockExerciseId, {
                        ...payload.data,
                        actual_sets: nextSets,
                    });
                }
            }

            completedStepKeysRef.current.add(currentRunStep.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
            onSetSaved?.(lastResult, {
                isGroupRound: false,
                isTimedBlock: true,
                groupKind: currentRunStep.groupKind,
            });
            return lastResult;
        } catch {
            onError?.("No se pudo guardar la ronda");
            throw new Error("save failed");
        } finally {
            setSaving(false);
        }
    }, [
        completedStepKeysRef,
        currentRunStep,
        emomAsPlanned,
        emomAthleteNote,
        emomFlow.completedIntervalCount,
        emomFlow.finishedEarly,
        emomTemplateSlots,
        getNextActualSets,
        isOnline,
        logExecution,
        logSet,
        logTimedResult,
        onError,
        onSetSaved,
        postRunExecution,
        postTimedResult,
        roundRpe,
        sessionId,
        setSavedStepKeys,
        setSaving,
        slotReferences,
    ]);

    return {
        handleEmomAsPlannedChange,
        emomTemplateSlots,
        emomIntervalLabel: emomFlow.intervalLabel,
        emomTechniqueSlots,
        emomFlow,
        mergeDisplayGroupContext,
        mergeDisplayBlockTimer,
        enrichRestFlowUi,
        emomAllIntervalsComplete: emomFlow.allIntervalsComplete,
        saveEmomBlock,
    };
}
