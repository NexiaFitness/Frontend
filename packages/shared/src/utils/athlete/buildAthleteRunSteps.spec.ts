/**
 * buildAthleteRunSteps.spec.ts — Orden de ejecución V05 Fase A.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE, type SessionBlock, type SessionBlockExercise } from "../../types/sessionProgramming";
import {
    groupBlockExercisesIntoGroups,
    type SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";
import { buildAthleteRunGroupContextFromStep } from "./athleteRunGroupContext";
import { buildAthleteRunSteps, resolveRestAfterCompletingRunStep } from "./buildAthleteRunSteps";

function block(
    id: number,
    setType:
        | typeof SET_TYPE.DROPSET
        | typeof SET_TYPE.SUPERSET
        | typeof SET_TYPE.GIANT_SET
        | typeof SET_TYPE.SINGLE_SET
        | typeof SET_TYPE.AMRAP
        | typeof SET_TYPE.EMOM
        | typeof SET_TYPE.FOR_TIME,
    rounds: number | null = 3,
    options?: { timeCap?: number | null; intervalSeconds?: number | null }
): SessionBlock {
    return {
        id,
        training_session_id: 1,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
        rounds,
        time_cap: options?.timeCap ?? null,
        interval_seconds: options?.intervalSeconds ?? null,
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
    reps = "10",
    setType: typeof SET_TYPE.SUPERSET | typeof SET_TYPE.GIANT_SET = SET_TYPE.SUPERSET
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

function giantLine(
    id: number,
    exerciseId: number,
    order: number,
    planned_sets: number | null = 3,
    reps = "10"
): SessionBlockExercise {
    return parallelLine(id, exerciseId, order, planned_sets, reps, SET_TYPE.GIANT_SET);
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

function timedLine(
    id: number,
    exerciseId: number,
    order: number,
    setType: typeof SET_TYPE.AMRAP | typeof SET_TYPE.FOR_TIME | typeof SET_TYPE.EMOM,
    options?: { plannedSets?: number | null; supersetGroupId?: number | null; reps?: string }
): SessionBlockExercise {
    return {
        id,
        session_block_id: 88,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: setType,
        superset_group_id: options?.supersetGroupId ?? null,
        dropset_sequence: null,
        planned_sets: options?.plannedSets ?? 1,
        planned_reps: options?.reps ?? "10",
        planned_weight: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: null,
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

describe("buildAthleteRunSteps giant_set", () => {
    it("emite 1 paso group_round por ronda (A1…A4 juntos)", () => {
        const lines = [
            giantLine(1, 8, 1, 3, "10"),
            giantLine(2, 12, 2, 3, "12"),
            giantLine(3, 15, 3, 3, "10"),
            giantLine(4, 18, 4, 3, "15"),
        ];
        const view = viewFromBlock(block(70, SET_TYPE.GIANT_SET, 3), lines, {
            8: "Press banca",
            12: "Remo",
            15: "Curl martillo",
            18: "Ext. tríceps",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(3);
        expect(steps.every((s) => s.kind === "group_round")).toBe(true);
        expect(steps.every((s) => s.groupKind === "giant_set")).toBe(true);
        expect(steps.map((s) => s.roundIndex)).toEqual([1, 2, 3]);
        expect(steps[0]?.slots?.map((s) => s.slotLabel)).toEqual(["A1", "A2", "A3", "A4"]);
        expect(steps[0]?.slots?.map((s) => s.exerciseName)).toEqual([
            "Press banca",
            "Remo",
            "Curl martillo",
            "Ext. tríceps",
        ]);
        expect(steps[0]?.instruction).toContain("ejercicios");
    });

    it("descanso al cerrar ronda (restBetweenSeconds en el paso)", () => {
        const lines = [
            giantLine(1, 8, 1),
            giantLine(2, 12, 2),
            giantLine(3, 15, 3),
        ];
        const view = viewFromBlock(block(70, SET_TYPE.GIANT_SET, 2), lines);
        const steps = buildAthleteRunSteps(view);

        expect(steps[0]?.restAfterSeconds).toBe(90);
        expect(resolveRestAfterCompletingRunStep(steps[1]!, undefined)).toBeNull();
    });

    it("formato API expandido 4 slots × 3 rondas → 3 pasos group_round", () => {
        const lines = [
            giantLine(1, 8, 1, 1, "10"),
            giantLine(2, 8, 2, 1, "10"),
            giantLine(3, 8, 3, 1, "10"),
            giantLine(4, 12, 4, 1, "12"),
            giantLine(5, 12, 5, 1, "12"),
            giantLine(6, 12, 6, 1, "12"),
            giantLine(7, 15, 7, 1, "10"),
            giantLine(8, 15, 8, 1, "10"),
            giantLine(9, 15, 9, 1, "10"),
            giantLine(10, 18, 10, 1, "15"),
            giantLine(11, 18, 11, 1, "15"),
            giantLine(12, 18, 12, 1, "15"),
        ];
        const view = viewFromBlock(block(70, SET_TYPE.GIANT_SET, 3), lines);
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(3);
        expect(steps.every((s) => s.kind === "group_round")).toBe(true);
        expect(steps[0]?.slots?.map((s) => s.slotLabel)).toEqual(["A1", "A2", "A3", "A4"]);
    });

    it("contexto UI usa copy dinámico por número de slots", () => {
        const lines = [
            giantLine(1, 8, 1, 3, "10"),
            giantLine(2, 12, 2, 3, "12"),
            giantLine(3, 15, 3, 3, "10"),
            giantLine(4, 18, 4, 3, "15"),
        ];
        const view = viewFromBlock(block(70, SET_TYPE.GIANT_SET, 3), lines);
        const steps = buildAthleteRunSteps(view);
        const ctx = buildAthleteRunGroupContextFromStep(steps[0]!);

        expect(ctx?.explanation).toContain("cuatro ejercicios");
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

describe("buildAthleteRunSteps timed blocks", () => {
    it("amrap genera un unico timed_block con todos los ejercicios del circuito", () => {
        const lines = [
            timedLine(500, 8, 1, SET_TYPE.AMRAP, { reps: "10" }),
            timedLine(501, 12, 2, SET_TYPE.AMRAP, { reps: "12" }),
            timedLine(502, 15, 3, SET_TYPE.AMRAP, { reps: "14" }),
        ];
        const view = viewFromBlock(
            block(80, SET_TYPE.AMRAP, null, { timeCap: 900 }),
            lines,
            {
                8: "Burpee",
                12: "Row",
                15: "Air squat",
            }
        );
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(1);
        expect(steps[0]?.kind).toBe("timed_block");
        expect(steps[0]?.timedMode).toBe("countdown_block");
        expect(steps[0]?.timeCapMinutes).toBe(15);
        expect(steps[0]?.slots?.map((slot) => slot.exerciseName)).toEqual(["Burpee", "Row", "Air squat"]);
        expect(steps[0]?.instruction).toContain("15 min");
        const ctx = buildAthleteRunGroupContextFromStep(steps[0]!);
        expect(ctx?.explanation).toContain("15 min");
    });

    it("for_time genera un timed_block por ronda en modo countup", () => {
        const lines = [
            timedLine(510, 20, 1, SET_TYPE.FOR_TIME, { plannedSets: 2 }),
            timedLine(511, 30, 2, SET_TYPE.FOR_TIME, { plannedSets: 2 }),
        ];
        const view = viewFromBlock(block(81, SET_TYPE.FOR_TIME, 2), lines, {
            20: "Thruster",
            30: "Pull-up",
        });
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(2);
        expect(steps.map((step) => step.kind)).toEqual(["timed_block", "timed_block"]);
        expect(steps.map((step) => step.timedMode)).toEqual(["countup", "countup"]);
        expect(steps.map((step) => step.roundIndex)).toEqual([1, 2]);
        expect(steps[0]?.slots?.map((slot) => slot.slotLabel)).toEqual(["1", "2"]);
    });

    it("emom genera un unico timed_block con intervalos embebidos", () => {
        const lines = [
            timedLine(520, 101, 1, SET_TYPE.EMOM, { supersetGroupId: 1 }),
            timedLine(521, 102, 2, SET_TYPE.EMOM, { supersetGroupId: 1 }),
            timedLine(522, 201, 3, SET_TYPE.EMOM, { supersetGroupId: 2 }),
            timedLine(523, 202, 4, SET_TYPE.EMOM, { supersetGroupId: 2 }),
        ];
        const view = viewFromBlock(
            block(82, SET_TYPE.EMOM, 2, { intervalSeconds: 60 }),
            lines,
            {
                101: "Bike",
                102: "Sit-up",
                201: "Wall ball",
                202: "Box jump",
            }
        );
        const steps = buildAthleteRunSteps(view);

        expect(steps).toHaveLength(1);
        expect(steps[0]?.kind).toBe("timed_block");
        expect(steps[0]?.timedMode).toBe("countdown_interval");
        expect(steps[0]?.emomIntervals).toHaveLength(4);
        expect(steps[0]?.emomIntervals?.map((item) => item.minuteIndex)).toEqual([
            1, 2, 3, 4,
        ]);
        expect(steps[0]?.emomIntervals?.[0]?.slots.map((slot) => slot.slotLabel)).toEqual([
            "V1",
            "V1",
        ]);
        expect(steps[0]?.emomIntervals?.[1]?.slots.map((slot) => slot.slotLabel)).toEqual([
            "V2",
            "V2",
        ]);
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
