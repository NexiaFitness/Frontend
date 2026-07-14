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
    if (exercise.plannedReps != null && exercise.plannedReps !== "") {
        return "reps";
    }
    return rowFallback;
}

export function mapExerciseRepsToPayload(
    exercise: Pick<
        ConstructorExercise,
        "repsTipo" | "plannedReps" | "plannedDuration" | "effortCharacter" | "effortValue"
    >,
    rowFallback: RepsTipo = "reps"
): {
    planned_reps: string | null;
    planned_duration: number | null;
    effort_character: ConstructorExercise["effortCharacter"];
    effort_value: number | null;
} {
    const repsTipo = getExerciseRepsTipo(exercise, rowFallback);

    if (repsTipo === "tiempo") {
        return {
            planned_reps: null,
            planned_duration: exercise.plannedDuration ?? null,
            effort_character: exercise.effortCharacter,
            effort_value: exercise.effortValue,
        };
    }

    return {
        planned_reps: exercise.plannedReps ?? null,
        planned_duration: null,
        effort_character: exercise.effortCharacter,
        effort_value: exercise.effortValue,
    };
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
