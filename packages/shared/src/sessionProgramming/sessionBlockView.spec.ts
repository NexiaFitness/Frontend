/**
 * sessionBlockView.spec.ts — Reducer read-only por set_type.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../types/sessionProgramming";
import { groupBlockExercisesIntoGroups } from "./sessionBlockView";

function block(
    id: number,
    setType: typeof SET_TYPE.DROPSET | typeof SET_TYPE.SUPERSET | typeof SET_TYPE.FOR_TIME | typeof SET_TYPE.AMRAP,
    rounds: number | null = 3,
    timeCapSeconds: number | null = null
): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
        rounds,
        time_cap: timeCapSeconds,
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

function parallelLine(
    id: number,
    exerciseId: number,
    order: number,
    setType: typeof SET_TYPE.SUPERSET | typeof SET_TYPE.FOR_TIME,
    planned_sets: number | null = 1,
    reps = "10"
): SessionBlockExercise {
    return {
        id,
        session_block_id: 62,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: setType,
        superset_group_id: 1,
        dropset_sequence: null,
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

describe("groupBlockExercisesIntoGroups superset", () => {
    it("colapsa líneas expandidas del constructor en 2 slots × N rondas", () => {
        const lines = [
            parallelLine(1, 8, 1, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(2, 8, 2, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(3, 8, 3, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(4, 12, 4, SET_TYPE.SUPERSET, 3, "8"),
            parallelLine(5, 12, 5, SET_TYPE.SUPERSET, 3, "8"),
            parallelLine(6, 12, 6, SET_TYPE.SUPERSET, 3, "8"),
        ];
        const groups = groupBlockExercisesIntoGroups(
            block(62, SET_TYPE.SUPERSET, 3),
            lines,
            new Map([
                [8, "Sentadilla búlgara"],
                [12, "Peso muerto"],
            ])
        );
        const group = groups[0];
        expect(group?.rounds).toBe(3);
        expect(group?.slots).toHaveLength(2);
        expect(group?.slots.map((s) => s.slotLabel)).toEqual(["A1", "A2"]);
        expect(group?.slots[0]?.sets).toHaveLength(3);
        expect(group?.slots[1]?.sets).toHaveLength(3);
    });

    it("colapsa sesión real 4133: mismo ejercicio en A1/A2 y block.rounds null", () => {
        const lines = [
            parallelLine(330, 75, 1, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(331, 75, 2, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(332, 75, 3, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(333, 75, 4, SET_TYPE.SUPERSET, 3, "12"),
            parallelLine(334, 75, 5, SET_TYPE.SUPERSET, 3, "12"),
            parallelLine(335, 75, 6, SET_TYPE.SUPERSET, 3, "12"),
        ];
        const groups = groupBlockExercisesIntoGroups(
            block(61, SET_TYPE.SUPERSET, null),
            lines,
            new Map([[75, "Sentadilla búlgara"]])
        );
        const group = groups[0];
        expect(group?.rounds).toBe(3);
        expect(group?.slots).toHaveLength(2);
        expect(group?.slots.map((s) => s.slotLabel)).toEqual(["A1", "A2"]);
        expect(group?.slots[0]?.sets.map((s) => s.plannedReps)).toEqual(["10", "10", "10"]);
        expect(group?.slots[1]?.sets.map((s) => s.plannedReps)).toEqual(["12", "12", "12"]);
    });

    it("mantiene layout colapsado canónico (1 fila por slot)", () => {
        const lines = [
            parallelLine(1, 8, 1, SET_TYPE.SUPERSET, 3, "10"),
            parallelLine(2, 12, 2, SET_TYPE.SUPERSET, 3, "8"),
        ];
        const groups = groupBlockExercisesIntoGroups(block(62, SET_TYPE.SUPERSET, 3), lines, new Map());
        const group = groups[0];
        expect(group?.slots).toHaveLength(2);
        expect(group?.slots[0]?.sets).toHaveLength(3);
        expect(group?.slots[1]?.sets).toHaveLength(3);
    });
});

describe("groupBlockExercisesIntoGroups amrap", () => {
    it("convierte time_cap de segundos a minutos en la vista", () => {
        const lines = [
            parallelLine(1, 8, 1, SET_TYPE.AMRAP, 1, "12"),
            parallelLine(2, 12, 2, SET_TYPE.AMRAP, 1, "12"),
        ];
        const groups = groupBlockExercisesIntoGroups(
            block(70, SET_TYPE.AMRAP, 3, 600),
            lines,
            new Map([
                [8, "Curl femoral"],
                [12, "Curl de bíceps"],
            ])
        );
        expect(groups[0]?.timeCapMinutes).toBe(10);
    });
});

describe("groupBlockExercisesIntoGroups for_time", () => {
    it("colapsa líneas expandidas en secuencia × rondas", () => {
        const lines = [
            parallelLine(1, 8, 1, SET_TYPE.FOR_TIME, 1, "10"),
            parallelLine(2, 8, 2, SET_TYPE.FOR_TIME, 1, "10"),
            parallelLine(3, 8, 3, SET_TYPE.FOR_TIME, 1, "10"),
            parallelLine(4, 12, 4, SET_TYPE.FOR_TIME, 1, "8"),
            parallelLine(5, 12, 5, SET_TYPE.FOR_TIME, 1, "8"),
            parallelLine(6, 12, 6, SET_TYPE.FOR_TIME, 1, "8"),
        ];
        const groups = groupBlockExercisesIntoGroups(block(62, SET_TYPE.FOR_TIME, 3), lines, new Map());
        const group = groups[0];
        expect(group?.rounds).toBe(3);
        expect(group?.slots).toHaveLength(2);
        expect(group?.slots[0]?.sets).toHaveLength(3);
        expect(group?.slots[1]?.sets).toHaveLength(3);
    });
});
