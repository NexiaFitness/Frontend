/**
 * Hydrates TemplateProgramSession blocks → ConstructorRow[] (same path as EditSession).
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { TemplateProgramSessionBlock } from "@nexia/shared/types/templateProgram";
import type {
    ConstructorExercise,
    ConstructorRow,
    RepsTipo,
} from "@/components/sessionProgramming/constructorTypes";
import {
    canHydrateDropsetApiLines,
    hydrateDropsetConstructorRow,
    hydrateEmomConstructorRow,
    hydrateForTimeConstructorRow,
    hydrateGiantSetConstructorRow,
    hydrateSingleSetConstructorRow,
    hydrateSupersetConstructorRow,
    isCollapsedSingleSetApiLines,
    normalizeAmrapRow,
    normalizeDropsetRow,
    normalizeEmomRow,
    normalizeForTimeRow,
    normalizeGiantSetRow,
    normalizeSingleSetRow,
    normalizeSupersetRow,
} from "@/components/sessionProgramming/constructor";

type ApiExerciseLine = {
    id: number;
    exercise_id: number;
    planned_reps: string | null;
    planned_weight: number | null;
    planned_rest: number | null;
    planned_sets: number | null;
    effort_character: unknown;
    effort_value: number | null;
    notes: string | null;
    planned_duration: number | null;
    order_in_block: number;
    superset_group_id: number | null;
    dropset_sequence?: number | null;
};

function inferRepsTipo(ex: {
    planned_reps: string | null;
    planned_duration: number | null;
}): RepsTipo {
    if (ex.planned_duration != null && !ex.planned_reps?.trim()) return "tiempo";
    return "reps";
}

function mapExerciseLine(ex: ApiExerciseLine, index: number): ConstructorExercise {
    return {
        id: `ex-${ex.id}-${index}`,
        serverExerciseId: ex.id,
        exerciseId: ex.exercise_id,
        exerciseName: `Ejercicio #${ex.exercise_id}`,
        plannedReps: ex.planned_reps,
        plannedWeight: ex.planned_weight,
        plannedDuration: ex.planned_duration,
        effortCharacter: ex.effort_character as ConstructorExercise["effortCharacter"],
        effortValue: ex.effort_value,
        notes: ex.notes,
    };
}

function blockToConstructorRow(block: TemplateProgramSessionBlock, index: number): ConstructorRow {
    const exs: ApiExerciseLine[] = [...(block.exercises ?? [])]
        .sort((a, b) => a.order_in_block - b.order_in_block)
        .map((ex) => ({
            id: ex.id,
            exercise_id: ex.exercise_id,
            planned_reps: ex.planned_reps ?? null,
            planned_weight: ex.planned_weight ?? null,
            planned_rest: ex.planned_rest ?? null,
            planned_sets: ex.planned_sets ?? null,
            effort_character: ex.effort_character,
            effort_value: ex.effort_value ?? null,
            notes: ex.notes ?? null,
            planned_duration: ex.planned_duration ?? null,
            order_in_block: ex.order_in_block,
            superset_group_id: ex.superset_group_id ?? null,
            dropset_sequence: ex.dropset_sequence ?? null,
        }));

    const firstEx = exs[0];
    const setType = (block.set_type as ConstructorRow["setType"]) ?? SET_TYPE.SINGLE_SET;

    const base: ConstructorRow = {
        id: `row-${block.id}-${index}`,
        serverBlockId: block.id,
        blockTypeId: block.block_type_id,
        setType,
        sets: exs[0]?.planned_sets ?? null,
        rounds: block.rounds ?? null,
        timeCap: block.time_cap ?? null,
        intervalSeconds: block.interval_seconds ?? null,
        rest: exs[0]?.planned_rest ?? 60,
        repsTipo: firstEx ? inferRepsTipo(firstEx) : "reps",
        exercises: [],
    };

    if (setType === SET_TYPE.SINGLE_SET && isCollapsedSingleSetApiLines(exs)) {
        return hydrateSingleSetConstructorRow(base, exs);
    }
    if (setType === SET_TYPE.DROPSET && canHydrateDropsetApiLines(exs)) {
        return hydrateDropsetConstructorRow(base, exs);
    }
    if (setType === SET_TYPE.SUPERSET && exs.length > 0) {
        return hydrateSupersetConstructorRow(base, exs);
    }
    if (setType === SET_TYPE.GIANT_SET && exs.length > 0) {
        return hydrateGiantSetConstructorRow(base, exs);
    }
    if (setType === SET_TYPE.FOR_TIME && exs.length > 0) {
        return hydrateForTimeConstructorRow(base, exs);
    }
    if (setType === SET_TYPE.EMOM && exs.length > 0) {
        return hydrateEmomConstructorRow(base, exs);
    }

    return {
        ...base,
        exercises: exs.map(mapExerciseLine),
    };
}

function normalizeRow(row: ConstructorRow): ConstructorRow {
    if (row.setType === SET_TYPE.SUPERSET) return normalizeSupersetRow(row);
    if (row.setType === SET_TYPE.SINGLE_SET) return normalizeSingleSetRow(row);
    if (row.setType === SET_TYPE.DROPSET) return normalizeDropsetRow(row);
    if (row.setType === SET_TYPE.GIANT_SET) return normalizeGiantSetRow(row);
    if (row.setType === SET_TYPE.FOR_TIME) return normalizeForTimeRow(row);
    if (row.setType === SET_TYPE.EMOM) return normalizeEmomRow(row);
    if (row.setType === SET_TYPE.AMRAP) return normalizeAmrapRow(row);
    return row;
}

export function templateSessionBlocksToConstructorRows(
    blocks: TemplateProgramSessionBlock[],
): ConstructorRow[] {
    const sorted = [...blocks].sort((a, b) => a.order_in_session - b.order_in_session);
    return sorted.map(blockToConstructorRow).map(normalizeRow);
}
