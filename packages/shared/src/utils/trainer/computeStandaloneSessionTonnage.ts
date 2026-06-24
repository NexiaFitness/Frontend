/**
 * computeStandaloneSessionTonnage — Tonnage legacy desde actual_* (F5-FE-03).
 */

import type { StandaloneSessionExerciseOut } from "../../types/standaloneSessions";

export interface StandaloneExerciseTonnageRow {
    exerciseId: number;
    orderInSession: number;
    tonnageKg: number;
    sets: number;
    reps: number;
    weightKg: number;
}

export interface StandaloneSessionTonnageSummary {
    tonnageKg: number;
    exercisesWithLoad: number;
    rows: StandaloneExerciseTonnageRow[];
}

function roundKg(value: number): number {
    return Math.round(value * 10) / 10;
}

export function computeStandaloneSessionTonnage(
    exercises: StandaloneSessionExerciseOut[],
): StandaloneSessionTonnageSummary {
    const rows: StandaloneExerciseTonnageRow[] = [];

    for (const exercise of exercises) {
        const sets = exercise.actual_sets ?? 0;
        const reps = exercise.actual_reps ?? 0;
        const weightKg = exercise.actual_weight ?? 0;
        if (sets <= 0 || reps <= 0 || weightKg <= 0) {
            continue;
        }
        rows.push({
            exerciseId: exercise.exercise_id,
            orderInSession: exercise.order_in_session,
            tonnageKg: roundKg(sets * reps * weightKg),
            sets,
            reps,
            weightKg,
        });
    }

    const tonnageKg = roundKg(rows.reduce((sum, row) => sum + row.tonnageKg, 0));

    return {
        tonnageKg,
        exercisesWithLoad: rows.length,
        rows,
    };
}
