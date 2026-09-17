/**
 * Map constructor ↔ standalone session exercises (flat API, no blocks).
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor";
import { getPersistLinePlannedSets } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { StandaloneSessionExerciseOut } from "@nexia/shared/types/standaloneSessions";
import type { StandaloneExerciseLine } from "../sessionProgramming/persistCreateSessionContent";

export function convertPlannedRepsString(repsStr: string): number | null {
    if (!repsStr?.trim()) return null;
    const s = repsStr.trim();
    if (s.includes("-")) {
        const firstNum = parseInt(s.split("-")[0].trim(), 10);
        return !isNaN(firstNum) ? firstNum : null;
    }
    const parsed = parseInt(s, 10);
    return !isNaN(parsed) ? parsed : null;
}

export type StandaloneExerciseDesiredLine = StandaloneExerciseLine & {
    serverExerciseId?: number;
};

export function buildStandaloneExerciseLinesFromConstructor(
    constructorRows: ConstructorRow[],
): StandaloneExerciseDesiredLine[] {
    let order = 0;
    const lines: StandaloneExerciseDesiredLine[] = [];
    for (const row of constructorRows) {
        for (const line of getConstructorPersistLines(row)) {
            order += 1;
            lines.push({
                exercise_id: line.exercise.exerciseId,
                order_in_session: order,
                planned_sets: getPersistLinePlannedSets(row, line),
                planned_reps: convertPlannedRepsString(line.exercise.plannedReps ?? ""),
                planned_weight: line.exercise.plannedWeight,
                planned_rest: row.rest,
                notes: line.exercise.notes,
                serverExerciseId: line.exercise.serverExerciseId,
            });
        }
    }
    return lines;
}

export function hydrateConstructorRowsFromStandaloneExercises(args: {
    exercises: StandaloneSessionExerciseOut[];
    defaultBlockTypeId: number;
    exerciseNameById: Map<number, string>;
}): ConstructorRow[] {
    const sorted = [...args.exercises].sort(
        (a, b) => a.order_in_session - b.order_in_session,
    );
    return sorted.map((ex) => {
        const reps =
            ex.planned_reps != null && !Number.isNaN(ex.planned_reps)
                ? String(ex.planned_reps)
                : null;
        return {
            id: `standalone-row-${ex.id}`,
            blockTypeId: args.defaultBlockTypeId,
            setType: SET_TYPE.SINGLE_SET,
            sets: ex.planned_sets ?? 1,
            rounds: null,
            timeCap: null,
            intervalSeconds: null,
            rest: ex.planned_rest ?? 60,
            repsTipo: "reps",
            exercises: [
                {
                    id: `standalone-ex-${ex.id}`,
                    exerciseId: ex.exercise_id,
                    exerciseName:
                        args.exerciseNameById.get(ex.exercise_id) ??
                        `Ejercicio #${ex.exercise_id}`,
                    plannedReps: reps,
                    plannedWeight: ex.planned_weight,
                    plannedAssistanceKg: ex.planned_assistance_kg ?? null,
                    plannedDuration: ex.planned_duration,
                    effortCharacter: null,
                    effortValue: null,
                    notes: ex.notes,
                    serverExerciseId: ex.id,
                },
            ],
        };
    });
}
