/**
 * athleteRunStepKeysReference.v1.fixtures.ts — Helpers mínimos para contrato step_key v1.
 */

import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../../types/sessionProgramming";
import {
    groupBlockExercisesIntoGroups,
    type SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";

type BlockSetType =
    | typeof SET_TYPE.DROPSET
    | typeof SET_TYPE.SINGLE_SET
    | typeof SET_TYPE.AMRAP
    | typeof SET_TYPE.EMOM
    | typeof SET_TYPE.FOR_TIME
    | typeof SET_TYPE.SUPERSET;

export function block(
    id: number,
    setType: BlockSetType,
    rounds: number | null = 3,
    options?: { timeCap?: number | null }
): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
        rounds,
        time_cap: options?.timeCap ?? null,
        interval_seconds: null,
        objective_text: null,
        planned_intensity: null,
        planned_volume: null,
        actual_intensity: null,
        actual_volume: null,
        estimated_duration: null,
        actual_duration: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function singleLine(id: number, exerciseId: number, plannedSets: number): SessionBlockExercise {
    return {
        id,
        session_block_id: 10,
        exercise_id: exerciseId,
        order_in_block: 1,
        set_type: SET_TYPE.SINGLE_SET,
        superset_group_id: null,
        dropset_sequence: null,
        planned_sets: plannedSets,
        planned_reps: "8",
        planned_weight: null,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: 60,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function dropLine(
    id: number,
    seq: number,
    order: number,
    reps: string,
    planned_sets: number | null = seq === 0 ? 2 : 0
): SessionBlockExercise {
    return {
        id,
        session_block_id: 50,
        exercise_id: seq === 0 ? 100 : 200,
        order_in_block: order,
        set_type: SET_TYPE.DROPSET,
        superset_group_id: null,
        dropset_sequence: seq,
        planned_sets,
        planned_reps: reps,
        planned_weight: null,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: 60,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function parallelLine(
    id: number,
    exerciseId: number,
    order: number,
    sessionBlockId: number
): SessionBlockExercise {
    return {
        id,
        session_block_id: sessionBlockId,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: SET_TYPE.SUPERSET,
        superset_group_id: 1,
        dropset_sequence: null,
        planned_sets: 1,
        planned_reps: "10",
        planned_weight: null,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: 90,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function timedLine(
    id: number,
    exerciseId: number,
    order: number,
    setType: typeof SET_TYPE.AMRAP | typeof SET_TYPE.EMOM | typeof SET_TYPE.FOR_TIME,
    sessionBlockId: number,
    options?: { reps?: string }
): SessionBlockExercise {
    return {
        id,
        session_block_id: sessionBlockId,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: setType,
        superset_group_id: null,
        dropset_sequence: null,
        planned_sets: 1,
        planned_reps: options?.reps ?? "10",
        planned_weight: null,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: null,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function viewFromBlock(
    sessionBlock: SessionBlock,
    lines: SessionBlockExercise[],
    names: Record<number, string> = {}
): SessionStructureView {
    const nameMap = new Map(Object.entries(names).map(([k, v]) => [Number(k), v]));
    const groups = groupBlockExercisesIntoGroups(sessionBlock, lines, nameMap);
    return {
        blocks: [
            {
                blockId: sessionBlock.id,
                blockTypeName: "Fuerza",
                setType: sessionBlock.set_type ?? SET_TYPE.SINGLE_SET,
                objectiveText: null,
                groups,
            },
        ],
        totalExercises: groups.reduce((n, g) => n + g.slots.length, 0),
        totalSets: groups.reduce(
            (n, g) => n + g.slots.reduce((s, slot) => s + slot.sets.length, 0),
            0
        ),
    };
}
