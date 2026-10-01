/**
 * parallelRoundCollapse.spec.ts — Tests de inferRoundSlotLayout y for_time vía sessionBlockView.
 *
 * Contexto:
 * - Superset/giant usan minSlots=2; for_time usa minSlots=1 en buildSequentialGroups (QA-0C-D1).
 * - No se aplica atajo «mismo ejercicio» en inferRoundSlotLayout para no romper superset/giant.
 *
 * Notas de mantenimiento: casos (a–d) del informe QA-0C deben pasar aquí antes de cerrar D1.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { describe, expect, it } from "vitest";
import { inferRoundSlotLayout } from "./parallelRoundCollapse";
import { mapBlocksToSessionStructureView } from "./sessionBlockView";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../types/sessionProgramming";
import { buildAthleteRunSteps } from "../utils/athlete/buildAthleteRunSteps";

function blockExercise(
    partial: Partial<SessionBlockExercise> & Pick<SessionBlockExercise, "id" | "order_in_block" | "exercise_id">
): SessionBlockExercise {
    return {
        session_block_id: 1,
        set_type: SET_TYPE.SUPERSET,
        superset_group_id: 1,
        dropset_sequence: null,
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
        planned_sets: 2,
        ...partial,
    };
}

describe("inferRoundSlotLayout — superset / giant (minSlots=2)", () => {
    it("(a) superset mismo ejercicio en dos slots, colapsado 2 filas → 2 slots × 2 rondas", () => {
        const lines = [
            { exercise_id: 10, order_in_block: 1, planned_sets: 2 },
            { exercise_id: 10, order_in_block: 2, planned_sets: 2 },
        ];

        const layout = inferRoundSlotLayout(lines, 2, 2);

        expect(layout.rounds).toBe(2);
        expect(layout.slotLines).toHaveLength(2);
    });

    it("(b) giant set equivalente colapsado", () => {
        const lines = [
            { exercise_id: 20, order_in_block: 1, planned_sets: 3 },
            { exercise_id: 21, order_in_block: 2, planned_sets: 3 },
        ];

        const layout = inferRoundSlotLayout(lines, 3, 2);

        expect(layout.rounds).toBe(3);
        expect(layout.slotLines).toHaveLength(2);
    });

    it("no colapsa 4 filas del mismo ejercicio en 1 slot cuando minSlots=2 (inferencia paralela)", () => {
        const lines = [1, 2, 3, 4].map((order) => ({
            exercise_id: 10,
            order_in_block: order,
            planned_sets: 1,
        }));

        const layout = inferRoundSlotLayout(lines, 4, 2);

        expect(layout.rounds).toBe(2);
        expect(layout.slotLines).toHaveLength(2);
    });
});

describe("mapBlocksToSessionStructureView — for_time (forTimeMinSlots en caller)", () => {
    const forTimeBlock = (rounds: number, blockId = 178): SessionBlock => ({
        id: blockId,
        training_session_id: 4422,
        block_type_id: 1,
        order_in_session: 1,
        set_type: SET_TYPE.FOR_TIME,
        rounds,
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
    });

    it("(d) 1 ejercicio × 4 rondas expandidas (caso 4422)", () => {
        const rows = [1, 2, 3, 4].map((order) =>
            blockExercise({
                id: 100 + order,
                order_in_block: order,
                exercise_id: 55,
                set_type: SET_TYPE.FOR_TIME,
                superset_group_id: null,
                planned_sets: 1,
            })
        );

        const view = mapBlocksToSessionStructureView({
            blocks: [forTimeBlock(4)],
            blockExercisesByBlock: { 178: rows },
            blockTypes: [{ id: 1, name: "Conditioning", description: null, is_active: true }],
            exerciseNamesById: { 55: "Comba" },
        });

        expect(view.blocks[0].groups[0].rounds).toBe(4);
        expect(buildAthleteRunSteps(view)[0]?.forTimeRounds).toHaveLength(4);
    });

    it("(c) 2 ejercicios distintos × 4 rondas colapsadas (2 filas planned_sets=4)", () => {
        const rows = [
            blockExercise({
                id: 201,
                order_in_block: 1,
                exercise_id: 20,
                set_type: SET_TYPE.FOR_TIME,
                superset_group_id: null,
                planned_sets: 4,
            }),
            blockExercise({
                id: 202,
                order_in_block: 2,
                exercise_id: 30,
                set_type: SET_TYPE.FOR_TIME,
                superset_group_id: null,
                planned_sets: 4,
            }),
        ];

        const view = mapBlocksToSessionStructureView({
            blocks: [forTimeBlock(4, 81)],
            blockExercisesByBlock: { 81: rows },
            blockTypes: [{ id: 1, name: "Conditioning", description: null, is_active: true }],
            exerciseNamesById: { 20: "Thruster", 30: "Pull-up" },
        });

        const group = view.blocks[0].groups[0];
        expect(group.rounds).toBe(4);
        expect(group.slots).toHaveLength(2);
        expect(buildAthleteRunSteps(view)[0]?.forTimeRounds).toHaveLength(4);
        expect(buildAthleteRunSteps(view)[0]?.forTimeRounds?.[0]?.slots).toHaveLength(2);
    });
});
