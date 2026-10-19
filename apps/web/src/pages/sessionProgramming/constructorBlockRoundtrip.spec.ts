/**
 * constructorBlockRoundtrip.spec.ts — Guardar → hidratar → guardar sin pérdida.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { mapConstructorRowsToFullUpdateBlocks } from "./mapConstructorToSessionBlocks";
import { hydrateSessionBlocksToConstructorRows } from "./hydrateSessionBlocksToConstructorRows";

const SQUAT_ID = 42;

function squatRow(id: string, weight: number, instance: string): ConstructorRow {
    return {
        id,
        blockInstanceId: instance,
        blockTypeId: 18,
        setType: SET_TYPE.SINGLE_SET,
        sets: 1,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        rest: 60,
        repsTipo: "reps",
        exercises: [
            {
                id: `ex-${id}`,
                exerciseId: SQUAT_ID,
                exerciseName: "Sentadilla",
                plannedReps: "8",
                plannedWeight: weight,
                plannedAssistanceKg: null,
                plannedDuration: null,
                effortCharacter: null,
                effortValue: null,
                notes: null,
            },
        ],
    };
}

describe("constructor block roundtrip", () => {
    it("preserves two squat rows with different loads across hydrate", () => {
        const instance = "binst-roundtrip";
        const rows = [squatRow("row-a", 60, instance), squatRow("row-b", 100, instance)];

        const blocks = mapConstructorRowsToFullUpdateBlocks(rows);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].exercises).toHaveLength(2);
        expect(blocks[0].exercises[0].planned_weight).toBe(60);
        expect(blocks[0].exercises[1].planned_weight).toBe(100);
        expect(blocks[0].exercises[0].constructor_row_key).toBe("row-a");
        expect(blocks[0].exercises[1].constructor_row_key).toBe("row-b");

        const apiBlock = {
            id: 500,
            training_session_id: 1,
            block_type_id: 18,
            order_in_session: 1,
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
            constructor_block_instance_id: instance,
            created_at: "",
            updated_at: "",
            is_active: true,
        };

        const exercisesByBlockId = {
            500: blocks[0].exercises.map((ex, i) => ({
                id: 900 + i,
                exercise_id: ex.exercise_id,
                order_in_block: ex.order_in_block,
                planned_sets: ex.planned_sets ?? 1,
                planned_reps: ex.planned_reps,
                planned_weight: ex.planned_weight,
                planned_assistance_kg: ex.planned_assistance_kg,
                planned_rest: 60,
                planned_duration: ex.planned_duration,
                effort_character: ex.effort_character,
                effort_value: ex.effort_value,
                notes: ex.notes,
                superset_group_id: null,
                dropset_sequence: null,
                constructor_row_key: ex.constructor_row_key ?? null,
            })),
        };

        const hydrated = hydrateSessionBlocksToConstructorRows([apiBlock], exercisesByBlockId);
        expect(hydrated).toHaveLength(2);
        expect(hydrated.map((r) => r.id).sort()).toEqual(["row-a", "row-b"]);
        expect(hydrated.map((r) => r.exercises[0]?.plannedWeight).sort()).toEqual([60, 100]);

        const secondSave = mapConstructorRowsToFullUpdateBlocks(hydrated);
        expect(secondSave[0].exercises).toHaveLength(2);
        expect(secondSave[0].exercises.map((e) => e.planned_weight).sort()).toEqual([60, 100]);
    });
});
