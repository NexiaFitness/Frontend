/**
 * buildExercisePayload.ts — Mapeo Constructor → API SessionBlockExercise
 *
 * Convierte el estado local del Constructor al payload que espera el backend.
 * single_set: N líneas con planned_sets: 1 y carga por setData[i].
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Sección 10
 * @spec docs/tipo-serie/04_single-set-dropset-expansion-fase1.md
 */

import type {
    SessionBlockExerciseCreate,
    SessionBlockExerciseUpdate,
} from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorRow,
    ConstructorExercise,
    ConstructorSetData,
} from "@/components/sessionProgramming/constructorTypes";
import type { PersistExerciseLine } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { getPersistLinePlannedSets } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";

function mapRepsTipoToPayload(
    row: ConstructorRow,
    ex: Pick<
        ConstructorExercise,
        "plannedReps" | "plannedDuration" | "effortCharacter" | "effortValue"
    >
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

function lineToExerciseFields(
    line: PersistExerciseLine
): Pick<
    ConstructorExercise,
    | "plannedReps"
    | "plannedWeight"
    | "plannedDuration"
    | "effortCharacter"
    | "effortValue"
    | "notes"
> {
    if (line.setDataEntry) {
        const entry: ConstructorSetData = line.setDataEntry;
        return {
            plannedReps: entry.plannedReps,
            plannedWeight: entry.plannedWeight,
            plannedDuration: entry.plannedDuration,
            effortCharacter: entry.effortCharacter,
            effortValue: entry.effortValue,
            notes: line.exercise.notes,
        };
    }
    return line.exercise;
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
        ...(setType === "superset" ? { superset_group_id: 1 } : {}),
    };
}

export function buildExercisePayloadFromLine(
    row: ConstructorRow,
    line: PersistExerciseLine
): SessionBlockExerciseCreate {
    const fields = lineToExerciseFields(line);
    const mapped = mapRepsTipoToPayload(row, fields);
    const plannedRest =
        row.setType === SET_TYPE.DROPSET
            ? row.rest
            : (line.setDataEntry?.rest ?? row.rest);

    return {
        exercise_id: line.exercise.exerciseId,
        order_in_block: line.orderInBlock,
        set_type: row.setType,
        planned_sets: getPersistLinePlannedSets(row, line),
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: fields.plannedWeight ?? null,
        planned_rest: plannedRest,
        effort_character: mapped.effort_character,
        effort_value: mapped.effort_value,
        notes: fields.notes ?? null,
        ...(row.setType === SET_TYPE.SUPERSET ? { superset_group_id: 1 } : {}),
        ...(row.setType === SET_TYPE.DROPSET && line.dropsetSequence != null
            ? { dropset_sequence: line.dropsetSequence }
            : {}),
    };
}

/** Payload para UpdateSessionBlockExercise (update) */
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

export function buildExerciseUpdatePayloadFromLine(
    row: ConstructorRow,
    line: PersistExerciseLine
): SessionBlockExerciseUpdate {
    const fields = lineToExerciseFields(line);
    const mapped = mapRepsTipoToPayload(row, fields);
    const plannedRest =
        row.setType === SET_TYPE.DROPSET
            ? row.rest
            : (line.setDataEntry?.rest ?? row.rest);

    return {
        planned_sets: getPersistLinePlannedSets(row, line),
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: fields.plannedWeight ?? null,
        planned_rest: plannedRest,
        effort_character: mapped.effort_character,
        effort_value: mapped.effort_value,
        notes: fields.notes ?? null,
        ...(row.setType === SET_TYPE.DROPSET && line.dropsetSequence != null
            ? { dropset_sequence: line.dropsetSequence }
            : {}),
    };
}
