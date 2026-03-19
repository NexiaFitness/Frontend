/**
 * buildExercisePayload.ts — Mapeo Constructor → API SessionBlockExercise
 *
 * Convierte el estado local del Constructor (ConstructorRow + ConstructorExercise)
 * al payload que espera el backend (SessionBlockExerciseCreate/Update).
 * Respeta repsTipo: reps → planned_reps, tiempo → planned_duration,
 * amrap → planned_reps="AMRAP". RPE va en columna Carácter.
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Sección 10
 * @spec agent.md — Sin parches, alineado con backend
 */

import type {
    SessionBlockExerciseCreate,
    SessionBlockExerciseUpdate,
} from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow, ConstructorExercise } from "@/components/sessionProgramming/constructorTypes";

function mapRepsTipoToPayload(
    row: ConstructorRow,
    ex: ConstructorExercise
): {
    planned_reps: string | null;
    planned_duration: number | null;
    effort_character: ConstructorExercise["effortCharacter"];
    effort_value: number | null;
} {
    const repsTipo = row.repsTipo ?? "reps";

    if (row.setType === "amrap") {
        return {
            planned_reps: "AMRAP",
            planned_duration: null,
            effort_character: ex.effortCharacter,
            effort_value: ex.effortValue,
        };
    }

    if (repsTipo === "tiempo") {
        return {
            planned_reps: null,
            planned_duration: ex.plannedDuration ?? null,
            effort_character: ex.effortCharacter,
            effort_value: ex.effortValue,
        };
    }

    return {
        planned_reps: ex.plannedReps ?? null,
        planned_duration: null,
        effort_character: ex.effortCharacter,
        effort_value: ex.effortValue,
    };
}

/** Payload para CreateSessionBlockExercise (create) */
export function buildExercisePayload(
    row: ConstructorRow,
    ex: ConstructorExercise,
    orderInBlock: number,
    setType: ConstructorRow["setType"]
): SessionBlockExerciseCreate {
    const mapped = mapRepsTipoToPayload(row, ex);

    return {
        exercise_id: ex.exerciseId,
        order_in_block: orderInBlock,
        set_type: setType,
        planned_sets: row.sets,
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: ex.plannedWeight,
        planned_rest: row.rest,
        effort_character: mapped.effort_character,
        effort_value: mapped.effort_value,
        notes: ex.notes,
    };
}

/** Payload para UpdateSessionBlockExercise (update) — sin exercise_id, order_in_block, set_type */
export function buildExerciseUpdatePayload(
    row: ConstructorRow,
    ex: ConstructorExercise
): SessionBlockExerciseUpdate {
    const mapped = mapRepsTipoToPayload(row, ex);

    return {
        planned_sets: row.sets,
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: ex.plannedWeight,
        planned_rest: row.rest,
        effort_character: mapped.effort_character,
        effort_value: mapped.effort_value,
        notes: ex.notes,
    };
}
