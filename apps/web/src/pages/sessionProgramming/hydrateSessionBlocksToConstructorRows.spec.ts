/**
 * hydrateSessionBlocksToConstructorRows.spec.ts — Legacy 4 bloques → 4 filas, 1 instancia.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE, type SessionBlock } from "@nexia/shared/types/sessionProgramming";
import { hydrateSessionBlocksToConstructorRows } from "./hydrateSessionBlocksToConstructorRows";

describe("hydrateSessionBlocksToConstructorRows", () => {
    it("partitions four legacy single-exercise blocks into one blockInstanceId", () => {
        const blocks: SessionBlock[] = [193, 194, 195, 196].map((id, i) => ({
            id,
            training_session_id: 1896,
            block_type_id: 18,
            order_in_session: i + 1,
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
        }));

        const exercisesByBlockId: Record<number, import("@nexia/shared/types/sessionProgramming").SessionBlockExerciseHydrationLine[]> =
            {};
        const exerciseIds = [11, 61, 81, 8];
        for (let i = 0; i < 4; i++) {
            const blockId = 193 + i;
            const exerciseId = exerciseIds[i];
            exercisesByBlockId[blockId] = [1, 2, 3].map((order) => ({
                id: 1000 + i * 10 + order,
                exercise_id: exerciseId,
                order_in_block: order,
                planned_sets: 1,
                planned_reps: "10",
                planned_weight: 50,
                planned_assistance_kg: null,
                planned_rest: 60,
                planned_duration: null,
                effort_character: null,
                effort_value: null,
                notes: null,
                superset_group_id: null,
                dropset_sequence: null,
            }));
        }

        const rows = hydrateSessionBlocksToConstructorRows(blocks, exercisesByBlockId);
        expect(rows).toHaveLength(4);
        const instanceIds = new Set(rows.map((r) => r.blockInstanceId));
        expect(instanceIds.size).toBe(1);
    });
});
