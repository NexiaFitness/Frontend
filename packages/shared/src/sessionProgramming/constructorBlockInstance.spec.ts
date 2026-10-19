/**
 * constructorBlockInstance.spec.ts — Tests agrupación instancia bloque constructor.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "../types/sessionProgramming";
import type { SessionBlock, SessionBlockExerciseHydrationLine } from "../types/sessionProgramming";
import {
    groupConstructorRowsByBlockInstance,
    groupLinesIntoConstructorRowSegments,
    isLegacySplitSingletonExerciseBlock,
    partitionApiBlocksForConstructorHydration,
    splitCollapsedSingleSetLinesIntoSegments,
} from "./constructorBlockInstance";

function block(id: number, typeId: number, order: number): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: typeId,
        order_in_session: order,
        set_type: SET_TYPE.SINGLE_SET,
        rounds: null,
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

function line(
    id: number,
    exerciseId: number,
    order: number,
    plannedSets = 1,
): SessionBlockExerciseHydrationLine {
    return {
        id,
        exercise_id: exerciseId,
        order_in_block: order,
        planned_sets: plannedSets,
        planned_reps: "10",
        planned_weight: null,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_rest: 60,
        effort_character: null,
        effort_value: null,
        notes: null,
    };
}

describe("groupConstructorRowsByBlockInstance", () => {
    it("groups rows with same blockInstanceId preserving order", () => {
        const rows = [
            { id: "a", blockInstanceId: "g1", blockTypeId: 18, setType: SET_TYPE.SINGLE_SET },
            { id: "b", blockInstanceId: "g2", blockTypeId: 18, setType: SET_TYPE.SINGLE_SET },
            { id: "c", blockInstanceId: "g1", blockTypeId: 18, setType: SET_TYPE.SINGLE_SET },
        ];
        const groups = groupConstructorRowsByBlockInstance(rows);
        expect(groups).toHaveLength(2);
        expect(groups[0].rows.map((r) => r.id)).toEqual(["a", "c"]);
        expect(groups[1].rows.map((r) => r.id)).toEqual(["b"]);
    });
});

describe("partitionApiBlocksForConstructorHydration", () => {
    it("merges consecutive legacy single-exercise single_set blocks", () => {
        const blocks = [block(193, 18, 1), block(194, 18, 2), block(195, 18, 3)];
        const exercises: Record<number, SessionBlockExerciseHydrationLine[]> = {
            193: [line(1, 11, 1), line(2, 11, 2), line(3, 11, 3)],
            194: [line(4, 61, 1), line(5, 61, 2), line(6, 61, 3)],
            195: [line(7, 81, 1), line(8, 81, 2), line(9, 81, 3)],
        };
        const parts = partitionApiBlocksForConstructorHydration(blocks, exercises);
        expect(parts).toHaveLength(1);
        expect(parts[0].apiBlocks.map((b) => b.id)).toEqual([193, 194, 195]);
    });

    it("does not merge superset blocks", () => {
        const superset = { ...block(10, 18, 1), set_type: SET_TYPE.SUPERSET };
        const exercises = {
            10: [line(1, 11, 1), line(2, 61, 2)],
        };
        expect(isLegacySplitSingletonExerciseBlock(superset, exercises[10])).toBe(false);
    });
});

describe("groupLinesIntoConstructorRowSegments", () => {
    it("keeps duplicate exercise_id in separate rows when constructor_row_key differs", () => {
        const lines = [
            { ...line(1, 42, 1), constructor_row_key: "row-a" },
            { ...line(2, 42, 2), constructor_row_key: "row-b" },
        ];
        const segments = groupLinesIntoConstructorRowSegments(lines);
        expect(segments).toHaveLength(2);
        expect(segments[0][0].constructor_row_key).toBe("row-a");
        expect(segments[1][0].constructor_row_key).toBe("row-b");
    });
});

describe("splitCollapsedSingleSetLinesIntoSegments", () => {
    it("splits four exercises x3 series into four segments", () => {
        const lines = [
            line(1, 11, 1),
            line(2, 11, 2),
            line(3, 11, 3),
            line(4, 61, 4),
            line(5, 61, 5),
            line(6, 61, 6),
        ];
        const segments = splitCollapsedSingleSetLinesIntoSegments(lines);
        expect(segments).toHaveLength(2);
        expect(segments[0]).toHaveLength(3);
        expect(segments[1]).toHaveLength(3);
    });
});
