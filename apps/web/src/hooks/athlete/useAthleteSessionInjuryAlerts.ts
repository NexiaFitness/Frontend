/**
 * useAthleteSessionInjuryAlerts.ts — Conflictos ejercicio↔lesión vía check-alert (F3b-FE-01).
 */

import { useEffect, useMemo, useState } from "react";
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

export function useAthleteSessionInjuryAlerts(
    clientId: number | null | undefined,
    exercises: SessionExerciseRef[],
    enabled = true
): AthleteSessionInjuryAlertsResult {
    const [checkAlert] = useCheckInjuryAlertMutation();
    const [conflicts, setConflicts] = useState<ExerciseInjuryConflict[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const exerciseKey = useMemo(
        () =>
            exercises
                .map((e) => `${e.exerciseId}:${e.exerciseName}`)
                .sort()
                .join("|"),
        [exercises]
    );

    useEffect(() => {
        if (!enabled || !clientId || exercises.length === 0) {
            setConflicts([]);
            setIsChecking(false);
            return;
        }

        let cancelled = false;
        setIsChecking(true);

        const exerciseList = exercises;

        void (async () => {
            const found: ExerciseInjuryConflict[] = [];

            for (const exercise of exerciseList) {
                if (cancelled) break;
                try {
                    const alert = await checkAlert({
                        client_id: clientId,
                        exercise_id: exercise.exerciseId,
                    }).unwrap();

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
                setConflicts(found);
                setIsChecking(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // exerciseKey estabiliza la lista; checkAlert (RTK) no va en deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId, enabled, exerciseKey]);

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
