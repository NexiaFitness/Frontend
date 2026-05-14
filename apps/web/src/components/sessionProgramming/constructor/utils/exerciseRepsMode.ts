/**
 * exerciseRepsMode.ts — Modo Reps/Tiempo por ejercicio (superset A1/A2).
 * @author Frontend Team
 * @since v5.3.0
 */

import type { ConstructorExercise, RepsTipo } from "../../constructorTypes";

export function getExerciseRepsTipo(
    exercise: Pick<ConstructorExercise, "repsTipo" | "plannedReps" | "plannedDuration">,
    rowFallback: RepsTipo = "reps"
): RepsTipo {
    if (exercise.repsTipo) {
        return exercise.repsTipo;
    }
    if (
        exercise.plannedDuration != null &&
        (exercise.plannedReps == null || exercise.plannedReps === "")
    ) {
        return "tiempo";
    }
    return rowFallback;
}

export function repsTipoExercisePatch(
    exercise: ConstructorExercise,
    mode: RepsTipo
): Partial<ConstructorExercise> {
    if (mode === "tiempo") {
        return {
            repsTipo: "tiempo",
            plannedReps: null,
            plannedDuration: exercise.plannedDuration ?? 30,
        };
    }
    return {
        repsTipo: "reps",
        plannedDuration: null,
        plannedReps: exercise.plannedReps ?? "10",
    };
}
