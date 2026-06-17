/**
 * useAthleteSessionRun.ts — Lógica de ejecución sesión atleta (F1 100%).
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
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { useAthleteExercisePr } from "@/hooks/athlete/useAthleteExercisePr";

export interface AthletePrCelebration {
    exerciseName: string;
    weight: number;
    previousMaxWeight: number | null;
}

export interface UseAthleteSessionRunOptions {
    sessionId: number;
    onSetSaved?: (result: "synced" | "queued" | "offline") => void;
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

    const flatExercises =
        flatExercisesFromApi.length > 0
            ? flatExercisesFromApi
            : isUsingCache
              ? (cachedSnapshot?.flatExercises ?? [])
              : [];

    const flatExercisesRef = useRef(flatExercises);
    flatExercisesRef.current = flatExercises;

    const [step, setStep] = useState(0);
    const [weight, setWeight] = useState(0);
    const [reps, setReps] = useState(8);
    const [rpe, setRpe] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [restSeconds, setRestSeconds] = useState<number | null>(null);
    const [prCelebration, setPrCelebration] = useState<AthletePrCelebration | null>(null);

    const loggedSetsRef = useRef<Map<number, number>>(new Map());
    const completedStepKeysRef = useRef<Set<string>>(new Set());
    const [savedStepKeys, setSavedStepKeys] = useState<ReadonlySet<string>>(() => new Set());

    useEffect(() => {
        setStep(0);
        loggedSetsRef.current = new Map();
        completedStepKeysRef.current = new Set();
        setSavedStepKeys(new Set());
    }, [sessionId]);

    const current = flatExercises[step];
    const currentStepKey = current?.stepKey ?? null;

    const { evaluatePr } = useAthleteExercisePr(
        clientId,
        current?.exerciseId ?? null
    );

    const { data: lastPerformance } = useGetAthleteLastPerformanceQuery(
        current?.exerciseId ?? 0,
        { skip: !current?.exerciseId }
    );

    const { data: suggestedLoad } = useGetAthleteSuggestedLoadQuery(
        current?.exerciseId ?? 0,
        { skip: !current?.exerciseId }
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

    // Sincronizar steppers solo al cambiar de paso (stepKey), no en refetch RTK del mismo paso.
    // flatExercisesRef evita listar flatExercises en deps (HF-01).
    useEffect(() => {
        if (!currentStepKey) return;
        const exercise = flatExercisesRef.current.find(
            (item) => item.stepKey === currentStepKey
        );
        if (!exercise) return;
        setWeight(exercise.defaultWeight);
        setReps(exercise.defaultReps);
        setRpe(exercise.defaultRpe);
    }, [currentStepKey]);

    const getNextActualSets = useCallback(
        (exercise: AthleteFlatExercise) => {
            const fromRef = loggedSetsRef.current.get(exercise.blockExerciseId) ?? 0;
            const fromBackend = exercise.loggedSets ?? 0;
            return Math.max(fromRef, fromBackend) + 1;
        },
        []
    );

    const handleSaveSet = useCallback(async () => {
        if (!current) return;
        if (completedStepKeysRef.current.has(current.stepKey)) return;

        setSaving(true);
        try {
            const nextSets = getNextActualSets(current);
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

            onSetSaved?.(result);

            if (current.restSeconds && current.restSeconds > 0 && step < flatExercises.length - 1) {
                setRestSeconds(current.restSeconds);
            } else if (step < flatExercises.length - 1) {
                setStep((s) => s + 1);
            }
        } catch {
            onError?.("No se pudo guardar la serie");
        } finally {
            setSaving(false);
        }
    }, [
        current,
        flatExercises.length,
        getNextActualSets,
        logSet,
        onError,
        onSetSaved,
        evaluatePr,
        reps,
        rpe,
        step,
        weight,
    ]);

    const handleRestComplete = useCallback(() => {
        setRestSeconds(null);
        if (step < flatExercises.length - 1) {
            setStep((s) => s + 1);
        }
    }, [flatExercises.length, step]);

    const handleFinish = useCallback(async () => {
        setCompleting(true);
        try {
            const result = await finishSession();
            onSessionFinished?.(result);
            if (result === "synced") {
                navigate(`/dashboard/sessions/${sessionId}/summary`);
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
    const isLastStep = step === flatExercises.length - 1;
    const isCurrentStepSaved = current ? savedStepKeys.has(current.stepKey) : false;
    const showSaveSetButton = Boolean(current) && !isCurrentStepSaved;

    return {
        session,
        isOnline,
        pendingCount,
        flatExercises,
        step,
        current,
        weight,
        reps,
        rpe,
        setWeight,
        setReps,
        setRpe,
        saving,
        completing,
        restSeconds,
        setRestSeconds,
        handleSaveSet,
        handleRestComplete,
        handleFinish,
        isLoading,
        isLastStep,
        showSaveSetButton,
        prCelebration,
        lastPerformance,
        applyLastPerformance,
        suggestedLoad,
        applySuggestedLoad,
    };
}
