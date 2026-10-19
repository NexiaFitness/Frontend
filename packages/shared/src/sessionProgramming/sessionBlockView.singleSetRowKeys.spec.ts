import { describe, expect, it } from "vitest";
import { SET_TYPE } from "../types/sessionProgramming";
import type { SessionBlock, SessionBlockExercise } from "../types/sessionProgramming";
import { mapBlocksToSessionStructureView } from "./sessionBlockView";

function block(id: number): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 12,
        order_in_session: 1,
        set_type: SET_TYPE.SINGLE_SET,
        is_active: true,
        created_at: "",
        updated_at: "",
    } as SessionBlock;
}

function line(
    id: number,
    exerciseId: number,
    order: number,
    rowKey: string
): SessionBlockExercise {
    return {
        id,
        session_block_id: 1,
        exercise_id: exerciseId,
        order_in_block: order,
        planned_sets: 1,
        planned_reps: "10",
        set_type: SET_TYPE.SINGLE_SET,
        constructor_row_key: rowKey,
    } as SessionBlockExercise;
}

describe("mapBlocksToSessionStructureView · single_set constructor_row_key", () => {
    it("keeps same exercise_id in separate groups when row keys differ", () => {
        const exercises = [
            line(1, 17, 1, "row-a"),
            line(2, 17, 2, "row-a"),
            line(3, 17, 3, "row-a"),
            line(4, 79, 4, "row-b"),
            line(5, 79, 5, "row-b"),
            line(6, 79, 6, "row-b"),
            line(7, 79, 7, "row-c"),
            line(8, 79, 8, "row-c"),
            line(9, 79, 9, "row-c"),
            line(10, 60, 10, "row-d"),
            line(11, 60, 11, "row-d"),
            line(12, 60, 12, "row-d"),
        ];
        const view = mapBlocksToSessionStructureView({
            blocks: [block(1)],
            blockExercisesByBlock: { 1: exercises },
            blockTypes: [{ id: 12, name: "Hipertrofia" } as never],
            exerciseNamesById: { 17: "Press", 79: "Step", 60: "Curl" },
        });
        expect(view.blocks[0].groups).toHaveLength(4);
        expect(view.totalExercises).toBe(4);
    });
});
