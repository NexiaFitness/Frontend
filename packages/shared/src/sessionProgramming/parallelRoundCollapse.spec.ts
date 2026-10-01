import { describe, expect, it } from "vitest";
import { inferRoundSlotLayout } from "./parallelRoundCollapse";
import { mapBlocksToSessionStructureView } from "./sessionBlockView";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../types/sessionProgramming";
import { buildAthleteRunSteps } from "../utils/athlete/buildAthleteRunSteps";

describe("inferRoundSlotLayout — for_time single exercise", () => {
    it("respects block.rounds when N expanded rows share one exercise (QA-0C-D1)", () => {
        const lines = [1, 2, 3, 4].map((order) => ({
            exercise_id: 10,
            order_in_block: order,
            planned_sets: 1,
        }));

        const layout = inferRoundSlotLayout(lines, 4, 1);

        expect(layout.rounds).toBe(4);
        expect(layout.slotLines).toHaveLength(1);
        expect(layout.slotLines[0]).toHaveLength(4);
    });

    it("prefers block.rounds over 2×2 split when all rows are the same exercise", () => {
        const lines = [1, 2, 3, 4].map((order) => ({
            exercise_id: 10,
            order_in_block: order,
            planned_sets: 1,
        }));

        const layout = inferRoundSlotLayout(lines, 4, 2);
        expect(layout.rounds).toBe(4);
        expect(layout.slotLines).toHaveLength(1);
    });
});

describe("mapBlocksToSessionStructureView — for_time athlete run", () => {
    it("builds 4 forTimeRounds from block.rounds=4 and four API rows", () => {
        const block: SessionBlock = {
            id: 178,
            training_session_id: 4422,
            block_type_id: 1,
            order_in_session: 1,
            set_type: SET_TYPE.FOR_TIME,
            rounds: 4,
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

        const rows: SessionBlockExercise[] = [1, 2, 3, 4].map((order) => ({
            id: 100 + order,
            session_block_id: 178,
            exercise_id: 55,
            order_in_block: order,
            set_type: SET_TYPE.FOR_TIME,
            superset_group_id: null,
            dropset_sequence: null,
            planned_sets: 1,
            planned_reps: "50",
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
        }));

        const view = mapBlocksToSessionStructureView({
            blocks: [block],
            blockExercisesByBlock: { 178: rows },
            blockTypes: [{ id: 1, name: "Conditioning", description: null, is_active: true }],
            exerciseNamesById: { 55: "Comba" },
        });

        const group = view.blocks[0].groups[0];
        expect(group.kind).toBe("for_time");
        expect(group.rounds).toBe(4);
        expect(group.restBetweenSeconds).toBe(60);

        const steps = buildAthleteRunSteps(view);
        const forTimeStep = steps.find((s) => s.groupKind === "for_time");
        expect(forTimeStep?.forTimeRounds).toHaveLength(4);
        expect(forTimeStep?.restAfterSeconds).toBe(60);
    });
});
