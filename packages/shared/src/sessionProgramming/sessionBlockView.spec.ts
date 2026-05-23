/**
 * sessionBlockView.spec.ts — Reducer read-only por set_type.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../types/sessionProgramming";
import { groupBlockExercisesIntoGroups } from "./sessionBlockView";

function block(id: number, setType: typeof SET_TYPE.DROPSET): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
        rounds: 3,
        time_cap: null,
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

function dropLine(
    id: number,
    seq: number,
    order: number,
    reps: string,
    planned_sets: number | null = seq === 0 ? 3 : 0
): SessionBlockExercise {
    return {
        id,
        session_block_id: 62,
        exercise_id: 8,
        order_in_block: order,
        set_type: SET_TYPE.DROPSET,
        superset_group_id: null,
        dropset_sequence: seq,
        planned_sets,
        planned_reps: reps,
        planned_weight: null,
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

describe("groupBlockExercisesIntoGroups dropset", () => {
    it("expone 3 pasos con reps del API (MAIN + DROP 1 + DROP 2)", () => {
        const lines = [
            dropLine(275, 0, 1, "10", 3),
            dropLine(276, 1, 2, "7"),
            dropLine(296, 2, 3, "5"),
        ];
        const groups = groupBlockExercisesIntoGroups(block(62, SET_TYPE.DROPSET), lines, new Map([[8, "Extensión de cuádriceps"]]));
        const sets = groups[0]?.slots[0]?.sets ?? [];
        expect(sets).toHaveLength(3);
        expect(sets.map((s) => s.label)).toEqual(["MAIN", "DROP 1", "DROP 2"]);
        expect(sets.map((s) => s.plannedReps)).toEqual(["10", "7", "5"]);
        expect(groups[0]?.rounds).toBe(3);
    });

    it("colapsa filas expandidas por ronda sin duplicar pasos", () => {
        const expanded = [
            dropLine(1, 0, 1, "10", 3),
            dropLine(2, 0, 2, "10", 1),
            dropLine(3, 0, 3, "10", 1),
            dropLine(4, 1, 4, "7"),
            dropLine(5, 1, 5, "7"),
            dropLine(6, 2, 6, "5"),
        ];
        const groups = groupBlockExercisesIntoGroups(block(62, SET_TYPE.DROPSET), expanded, new Map());
        const sets = groups[0]?.slots[0]?.sets ?? [];
        expect(sets).toHaveLength(3);
        expect(sets.map((s) => s.plannedReps)).toEqual(["10", "7", "5"]);
    });
});
