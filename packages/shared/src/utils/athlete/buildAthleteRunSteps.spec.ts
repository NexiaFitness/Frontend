/**
 * buildAthleteRunSteps.spec.ts — Orden de ejecución V05 Fase A.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../../types/sessionProgramming";
import {
    groupBlockExercisesIntoGroups,
    type SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";
import { buildAthleteRunSteps, resolveRestAfterCompletingRunStep } from "./buildAthleteRunSteps";

function block(
    id: number,
    setType: typeof SET_TYPE.DROPSET | typeof SET_TYPE.SUPERSET | typeof SET_TYPE.SINGLE_SET,
    rounds: number | null = 3
): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
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
    };
}

function parallelLine(
    id: number,
    exerciseId: number,
    order: number,
    planned_sets: number | null = 3,
    reps = "10"
): SessionBlockExercise {
    return {
        id,
        session_block_id: 62,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: SET_TYPE.SUPERSET,
        superset_group_id: 1,
        dropset_sequence: null,
        planned_sets,
        planned_reps: reps,
        planned_weight: null,
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

function dropLine(
    id: number,
    seq: number,
    order: number,
    reps: string,
    planned_sets: number | null = seq === 0 ? 2 : 0
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

function singleLine(id: number, exerciseId: number, planned_sets = 4, reps = "8"): SessionBlockExercise {
    return {
        id,
        session_block_id: 10,
        exercise_id: exerciseId,
        order_in_block: 1,
        set_type: SET_TYPE.SINGLE_SET,
        superset_group_id: null,
        dropset_sequence: null,
        planned_sets,
        planned_reps: reps,
        planned_weight: 60,
        planned_duration: null,
        planned_distance: null,
        planned_rest: 120,
        effort_character: "rpe",
        effort_value: 8,
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

function viewFromBlock(
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

describe("buildAthleteRunSteps superset", () => {
    it("emite 1 paso group_round por ronda (A1+A2 juntos)", () => {
        const lines = [
            parallelLine(1, 8, 1, 3, "10"),
            parallelLine(2, 12, 2, 3, "8"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.SUPERSET, 3), lines, {
            8: "Press banca",
            12: "Remo",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(3);
        expect(steps.every((s) => s.kind === "group_round")).toBe(true);
        expect(steps.map((s) => s.roundIndex)).toEqual([1, 2, 3]);
        expect(steps[0]?.slots?.map((s) => s.slotLabel)).toEqual(["A1", "A2"]);
        expect(steps[0]?.slots?.map((s) => s.exerciseName)).toEqual(["Press banca", "Remo"]);
        expect(steps[0]?.slots?.map((s) => s.setLabel)).toEqual(["R1", "R1"]);
    });

    it("descanso al cerrar ronda (restBetweenSeconds en el paso)", () => {
        const lines = [parallelLine(1, 8, 1), parallelLine(2, 12, 2)];
        const view = viewFromBlock(block(62, SET_TYPE.SUPERSET, 2), lines);
        const steps = buildAthleteRunSteps(view);

        expect(steps[0]?.restAfterSeconds).toBe(90);
        expect(steps[1]?.restAfterSeconds).toBe(90);
    });

    it("stepKey estable y único por ronda", () => {
        const lines = [parallelLine(1, 8, 1), parallelLine(2, 12, 2)];
        const view = viewFromBlock(block(62, SET_TYPE.SUPERSET, 2), lines);
        const steps = buildAthleteRunSteps(view);
        const keys = steps.map((s) => s.stepKey);
        expect(new Set(keys).size).toBe(keys.length);
        expect(keys[0]).toContain("-round-1");
        expect(keys[1]).toContain("-round-2");
    });
});

describe("buildAthleteRunSteps dropset", () => {
    it("emite 1 paso group_round por ronda (MAIN → DROP 1 → DROP 2)", () => {
        const lines = [
            dropLine(275, 0, 1, "10", 2),
            dropLine(276, 1, 2, "7"),
            dropLine(296, 2, 3, "5"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.DROPSET, 2), lines, {
            8: "Extensión cuádriceps",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(2);
        expect(steps.every((s) => s.kind === "group_round")).toBe(true);
        expect(steps[0]?.slots?.map((s) => s.setLabel)).toEqual(["MAIN", "DROP 1", "DROP 2"]);
        expect(steps[1]?.slots?.map((s) => s.setLabel)).toEqual(["MAIN", "DROP 1", "DROP 2"]);
    });

    it("descanso al cerrar cada ronda dropset", () => {
        const lines = [
            dropLine(275, 0, 1, "10", 2),
            dropLine(276, 1, 2, "7"),
            dropLine(296, 2, 3, "5"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.DROPSET, 2), lines);
        const steps = buildAthleteRunSteps(view);

        expect(steps[0]?.restAfterSeconds).toBe(60);
        expect(steps[1]?.restAfterSeconds).toBe(60);
    });

    it("resolveRestAfterCompletingRunStep: último paso → sin descanso aunque prescrito", () => {
        const lines = [
            dropLine(275, 0, 1, "10", 2),
            dropLine(276, 1, 2, "7"),
            dropLine(296, 2, 3, "5"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.DROPSET, 2), lines);
        const steps = buildAthleteRunSteps(view);

        expect(resolveRestAfterCompletingRunStep(steps[0]!, steps[1]!)).toBe(60);
        expect(resolveRestAfterCompletingRunStep(steps[1]!, undefined)).toBeNull();
    });

    it("slotLabel único por drop (MAIN, DROP 1, DROP 2) — no duplicar MAIN", () => {
        const lines = [
            dropLine(275, 0, 1, "10", 2),
            dropLine(276, 1, 2, "7"),
            dropLine(296, 2, 3, "5"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.DROPSET, 2), lines, {
            8: "French press",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps[0]?.slots?.map((s) => s.slotLabel)).toEqual(["MAIN", "DROP 1", "DROP 2"]);
        expect(steps[0]?.slots?.map((s) => s.exerciseName)).toEqual([
            "French press",
            "French press",
            "French press",
        ]);
    });
});

describe("buildAthleteRunSteps single_set", () => {
    it("ordena S1 → S2 → S3 → S4", () => {
        const view = viewFromBlock(block(10, SET_TYPE.SINGLE_SET), [singleLine(1, 5, 4)], {
            5: "Sentadilla",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(4);
        expect(steps.map((s) => s.setLabel)).toEqual(["S1", "S2", "S3", "S4"]);
        expect(steps.every((s) => s.groupKind === "single_set")).toBe(true);
    });
});

describe("buildAthleteRunSteps vs flatten legacy", () => {
    it("superset 3 rondas produce 3 pasos group_round, no slot-major", () => {
        const lines = [
            parallelLine(1, 8, 1, 3, "10"),
            parallelLine(2, 8, 2, 3, "10"),
            parallelLine(3, 8, 3, 3, "10"),
            parallelLine(4, 12, 4, 3, "8"),
            parallelLine(5, 12, 5, 3, "8"),
            parallelLine(6, 12, 6, 3, "8"),
        ];
        const view = viewFromBlock(block(62, SET_TYPE.SUPERSET, 3), lines);
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(3);
        expect(steps.every((s) => s.kind === "group_round")).toBe(true);
        expect(steps[0]?.slots?.map((s) => s.slotLabel)).toEqual(["A1", "A2"]);
        expect(resolveRestAfterCompletingRunStep(steps[2]!, undefined)).toBeNull();
    });
});
