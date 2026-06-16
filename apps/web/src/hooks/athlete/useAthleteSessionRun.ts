/**
 * useAthleteSessionRun.ts — Lógica de ejecución sesión atleta (F1 100%).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useUpdateSessionBlockExerciseMutation } from "@nexia/shared/api/sessionProgrammingApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useOfflineSessionLog } from "@nexia/shared/hooks/offline";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";

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
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const [updateExercise] = useUpdateSessionBlockExerciseMutation();
    const [updateSession] = useUpdateTrainingSessionMutation();

    const flatExercisesFromApi = useMemo(() => flattenAthleteExercises(view), [view]);

    const adapter = useMemo(
        () => ({
            updateExercise: async (
                blockExerciseId: number,
                data: Parameters<typeof updateExercise>[0]["data"]
            ) => {
                await updateExercise({ id: blockExerciseId, data }).unwrap();
            },
            completeSession: async (sid: number) => {
                await updateSession({ id: sid, body: { status: "completed" } }).unwrap();
            },
        }),
        [updateExercise, updateSession]
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

    const [step, setStep] = useState(0);
    const [weight, setWeight] = useState(0);
    const [reps, setReps] = useState(8);
    const [rpe, setRpe] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [restSeconds, setRestSeconds] = useState<number | null>(null);

    const loggedSetsRef = useRef<Map<number, number>>(new Map());

    useEffect(() => {
        setStep(0);
        loggedSetsRef.current = new Map();
    }, [sessionId]);

    const current = flatExercises[step];

    useEffect(() => {
        if (!current) return;
        setWeight(current.defaultWeight);
        setReps(current.defaultReps);
        setRpe(current.defaultRpe);
    }, [current]);

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
                navigate(`/dashboard/sessions/${sessionId}/feedback`);
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
    };
}
