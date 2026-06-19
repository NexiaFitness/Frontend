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
    type AthleteRunStep,
} from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    buildAthleteRunGroupContext,
    buildAthleteRunGroupContextFromStep,
    type AthleteRunGroupContextView,
} from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import type { SlotLogValues } from "@/components/athlete/execution/AthleteMultiSlotLogger";
import { useAthleteExercisePr } from "@/hooks/athlete/useAthleteExercisePr";
import { useAthleteRunRestFlow } from "@/hooks/athlete/useAthleteRunRestFlow";

export interface AthletePrCelebration {
    exerciseName: string;
    weight: number;
    previousMaxWeight: number | null;
}

export interface AthleteSessionRunSaveContext {
    isGroupRound: boolean;
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
    }, [sessionId]);

    const currentRunStep: AthleteRunStep | undefined = runSteps[step];
    const currentStepKey = currentRunStep?.stepKey ?? null;
    const isGroupRound = currentRunStep?.kind === "group_round";

    const current = useMemo(() => {
        if (!currentRunStep || isGroupRound) return undefined;
        return runStepToFlatExercise(currentRunStep);
    }, [currentRunStep, isGroupRound]);

    const nextRunStep = step < runSteps.length - 1 ? runSteps[step + 1] : undefined;

    const groupContext: AthleteRunGroupContextView | null = useMemo(() => {
        if (!currentRunStep) return null;
        if (currentRunStep.kind === "group_round") {
            return buildAthleteRunGroupContextFromStep(currentRunStep);
        }
        if (!currentStepKey || !current) return null;
        return buildAthleteRunGroupContext(flatExercises, currentStepKey);
    }, [current, currentRunStep, currentStepKey, flatExercises]);

    const singleExerciseId = isGroupRound ? null : (current?.exerciseId ?? null);

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
        if (!runStep || runStep.kind !== "group_round" || !runStep.slots?.length) {
            setSlotLogs((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            return;
        }

        const initial: Record<string, SlotLogValues> = {};
        for (const slot of runStep.slots) {
            initial[slot.stepKey] = {
                weight: slot.defaultWeight,
                reps: slot.defaultReps,
                rpe: slot.defaultRpe,
            };
        }

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
                        previous.reps === next.reps &&
                        previous.rpe === next.rpe
                    );
                })
            ) {
                return prev;
            }
            return initial;
        });
    }, [currentStepKey]);

    useEffect(() => {
        if (!currentStepKey || isGroupRound) return;
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
    }, [currentStepKey, isGroupRound]);

    const updateSlotLog = useCallback((slotKey: string, patch: Partial<SlotLogValues>) => {
        setSlotLogs((prev) => {
            const current = prev[slotKey];
            if (!current) return prev;
            return { ...prev, [slotKey]: { ...current, ...patch } };
        });
    }, []);

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
                groupKind: current.groupKind,
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
        evaluatePr,
        reps,
        rpe,
        weight,
    ]);

    const handleSaveRound = useCallback(async () => {
        if (!currentRunStep || currentRunStep.kind !== "group_round" || !currentRunStep.slots?.length) {
            return;
        }
        if (completedStepKeysRef.current.has(currentRunStep.stepKey)) return;

        setSaving(true);
        let lastResult: "synced" | "queued" | "offline" = "synced";

        try {
            for (const slot of currentRunStep.slots) {
                if (completedStepKeysRef.current.has(slot.stepKey)) continue;

                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    rpe: slot.defaultRpe,
                };

                const nextSets = getNextActualSets(slot.blockExerciseId, slot.loggedSets);
                loggedSetsRef.current.set(slot.blockExerciseId, nextSets);

                lastResult = await logSet(slot.blockExerciseId, {
                    actual_weight: log.weight,
                    actual_reps: String(log.reps),
                    actual_sets: nextSets,
                    actual_effort_value: log.rpe ?? undefined,
                });

                completedStepKeysRef.current.add(slot.stepKey);
            }

            completedStepKeysRef.current.add(currentRunStep.stepKey);
            setSavedStepKeys(new Set(completedStepKeysRef.current));
            onSetSaved?.(lastResult, {
                isGroupRound: true,
                groupKind: currentRunStep.groupKind,
            });
        } catch {
            onError?.("No se pudo guardar la ronda");
            throw new Error("save failed");
        } finally {
            setSaving(false);
        }
    }, [currentRunStep, getNextActualSets, logSet, onError, onSetSaved, slotLogs]);

    const onConfirm = isGroupRound ? handleSaveRound : handleSaveSet;

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

    const confirmLabel = isGroupRound
        ? isDropsetRound
            ? "Dropset completado"
            : "Ronda completada"
        : "Serie completada";

    const isConfirmValid = useMemo(() => {
        if (isGroupRound && currentRunStep?.slots?.length) {
            return currentRunStep.slots.every((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    rpe: slot.defaultRpe,
                };
                return log.reps > 0 && log.weight >= 0;
            });
        }
        return reps > 0 && weight >= 0;
    }, [currentRunStep, isGroupRound, slotLogs, reps, weight]);

    const restFlow = useAthleteRunRestFlow({
        restAfterSeconds,
        confirmLabel,
        stepKey: currentStepKey,
        onConfirm,
        onRestComplete: advanceAfterRest,
        isConfirmValid,
        requireStartBeforeLog: isDropsetRound,
        startRestLabel: isDropsetRound ? "Registrar dropset" : "Empezar descanso",
    });

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
    const isLastStep = step === runSteps.length - 1;
    const isCurrentStepSaved = currentStepKey
        ? savedStepKeys.has(currentStepKey)
        : false;
    const showStepActions = Boolean(currentRunStep) && !isCurrentStepSaved;

    return {
        session,
        isOnline,
        pendingCount,
        runSteps,
        flatExercises,
        step,
        currentRunStep,
        isGroupRound,
        current,
        groupContext,
        slotLogs,
        updateSlotLog,
        weight,
        reps,
        rpe,
        setWeight,
        setReps,
        setRpe,
        saving,
        completing,
        restFlow,
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
