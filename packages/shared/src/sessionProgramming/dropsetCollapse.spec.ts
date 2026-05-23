import { describe, expect, it } from "vitest";
import {
    collapseDropsetBlockLines,
    collapseDropsetLines,
    inferDropsetRounds,
} from "./dropsetCollapse";
import type { SessionBlockExercise } from "../types/sessionProgramming";

function line(
    id: number,
    seq: number | null,
    order: number,
    planned_sets: number | null = 1
): SessionBlockExercise {
    return {
        id,
        session_block_id: 1,
        exercise_id: 8,
        order_in_block: order,
        planned_sets,
        planned_reps: "8",
        planned_weight: null,
        planned_rest: 60,
        planned_duration: null,
        effort_character: null,
        effort_value: null,
        notes: null,
        dropset_sequence: seq,
        superset_group_id: null,
        is_active: true,
        created_at: "",
        updated_at: "",
    } as SessionBlockExercise;
}

describe("collapseDropsetLines", () => {
    it("colapsa filas expandidas por ronda al mismo dropset_sequence", () => {
        const expanded = [
            line(1, 0, 1, 3),
            line(2, 0, 2, 1),
            line(3, 0, 3, 1),
            line(4, 1, 4, 1),
            line(5, 1, 5, 1),
            line(6, 2, 6, 1),
        ];
        const collapsed = collapseDropsetBlockLines(expanded);
        expect(collapsed).toHaveLength(3);
        expect(collapsed.map((l) => l.dropset_sequence)).toEqual([0, 1, 2]);
    });

    it("inferDropsetRounds usa conteo de MAIN si hay varias filas MAIN", () => {
        const expanded = [line(1, 0, 1), line(2, 0, 2), line(3, 1, 3)];
        expect(inferDropsetRounds(expanded, null)).toBe(2);
    });

    it("inferDropsetRounds usa planned_sets del MAIN único", () => {
        const collapsed = collapseDropsetLines([
            { order_in_block: 1, dropset_sequence: 0, planned_sets: 4 },
            { order_in_block: 2, dropset_sequence: 1, planned_sets: 1 },
        ]);
        expect(inferDropsetRounds(collapsed, null)).toBe(4);
    });
});
