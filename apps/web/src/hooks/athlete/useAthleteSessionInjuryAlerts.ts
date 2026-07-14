/**
 * useAthleteSessionInjuryAlerts.ts — Conflictos ejercicio↔lesión vía check-alert (F3b-FE-01).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useCheckInjuryAlertMutation } from "@nexia/shared/api/injuriesApi";
import type {
    ExerciseInjuryConflict,
    SessionExerciseRef,
} from "@nexia/shared/types/injuryAlert";

export interface AthleteSessionInjuryAlertsResult {
    conflicts: ExerciseInjuryConflict[];
    conflictByExerciseId: Map<number, ExerciseInjuryConflict>;
    isChecking: boolean;
    hasConflicts: boolean;
}

interface CheckState {
    requestKey: string;
    conflicts: ExerciseInjuryConflict[];
    isChecking: boolean;
}

const IDLE_STATE: CheckState = {
    requestKey: "",
    conflicts: [],
    isChecking: false,
};

const EMPTY_CONFLICTS: ExerciseInjuryConflict[] = [];

export function useAthleteSessionInjuryAlerts(
    clientId: number | null | undefined,
    exercises: SessionExerciseRef[],
    enabled = true
): AthleteSessionInjuryAlertsResult {
    const [checkAlert] = useCheckInjuryAlertMutation();
    const [checkState, setCheckState] = useState<CheckState>(IDLE_STATE);
    const checkAlertRef = useRef(checkAlert);
    checkAlertRef.current = checkAlert;
    const exercisesRef = useRef(exercises);
    exercisesRef.current = exercises;

    const isActive = Boolean(enabled && clientId && exercises.length > 0);

    const exerciseKey = useMemo(
        () =>
            exercises
                .map((e) => `${e.exerciseId}:${e.exerciseName}`)
                .sort()
                .join("|"),
        [exercises]
    );

    const requestKey = isActive ? `${clientId}:${exerciseKey}` : "";

    useEffect(() => {
        if (!isActive || !clientId) {
            return;
        }

        let cancelled = false;
        const activeKey = requestKey;

        setCheckState({
            requestKey: activeKey,
            conflicts: [],
            isChecking: true,
        });

        void (async () => {
            const found: ExerciseInjuryConflict[] = [];

            for (const exercise of exercisesRef.current) {
                if (cancelled) break;
                try {
                    const alert = await checkAlertRef
                        .current({
                            client_id: clientId,
                            exercise_id: exercise.exerciseId,
                        })
                        .unwrap();

                    if (alert.has_conflict) {
                        found.push({
                            exerciseId: exercise.exerciseId,
                            exerciseName: exercise.exerciseName,
                            alert,
                        });
                    }
                } catch (error) {
                    console.error(
                        "[useAthleteSessionInjuryAlerts] check-alert failed",
                        exercise.exerciseId,
                        error
                    );
                }
            }

            if (!cancelled) {
                setCheckState({
                    requestKey: activeKey,
                    conflicts: found,
                    isChecking: false,
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [clientId, isActive, requestKey]);

    const isCurrentRequest = isActive && checkState.requestKey === requestKey;

    const conflicts = useMemo(
        () => (isCurrentRequest ? checkState.conflicts : EMPTY_CONFLICTS),
        [isCurrentRequest, checkState.conflicts]
    );
    const isChecking = isCurrentRequest ? checkState.isChecking : false;

    const conflictByExerciseId = useMemo(
        () => new Map(conflicts.map((c) => [c.exerciseId, c])),
        [conflicts]
    );

    return {
        conflicts,
        conflictByExerciseId,
        isChecking,
        hasConflicts: conflicts.length > 0,
    };
}
