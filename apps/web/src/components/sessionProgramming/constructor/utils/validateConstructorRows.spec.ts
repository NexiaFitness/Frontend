/**
 * validateConstructorRows.spec.ts — Tests validación submit constructor.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../../constructorTypes";
import { validateConstructorRows } from "./validateConstructorRows";

function baseRow(partial: Partial<ConstructorRow>): ConstructorRow {
    return {
        id: "row-1",
        blockTypeId: 1,
        setType: SET_TYPE.SINGLE_SET,
        sets: null,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        exercises: [],
        rest: null,
        ...partial,
    };
}

const press = {
    id: "ex-1",
    exerciseId: 101,
    exerciseName: "Press banca",
    plannedReps: "8",
    plannedWeight: 60,
    plannedDuration: null,
    effortCharacter: null,
    effortValue: null,
    notes: null,
};

const rowEx = {
    id: "ex-2",
    exerciseId: 102,
    exerciseName: "Remo",
    plannedReps: "10",
    plannedWeight: 50,
    plannedDuration: null,
    effortCharacter: null,
    effortValue: null,
    notes: null,
};

describe("validateConstructorRows", () => {
    it("constructor vacío → válido", () => {
        expect(validateConstructorRows([])).toEqual({ valid: true, issues: [] });
    });

    it("single_set completo → válido", () => {
        const r = baseRow({
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            exercises: [press],
            setData: [
                { id: "s1", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
                { id: "s2", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
                { id: "s3", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
            ],
        });
        expect(validateConstructorRows([r]).valid).toBe(true);
    });

    it("single_set sin ejercicio → inválido", () => {
        const r = baseRow({
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            exercises: [],
            setData: [
                { id: "s1", plannedReps: "8", plannedWeight: null, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
            ],
        });
        const result = validateConstructorRows([r]);
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.field === "exercise")).toBe(true);
    });

    it("superset sin A2 → inválido", () => {
        const r = baseRow({
            setType: SET_TYPE.SUPERSET,
            sets: 3,
            exercises: [press, { ...rowEx, exerciseId: 0, exerciseName: "" }],
        });
        const result = validateConstructorRows([r]);
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.exerciseSlotId === "ex-2")).toBe(true);
    });

    it("amrap sin rondas → inválido (campo rounds)", () => {
        const r = baseRow({
            setType: SET_TYPE.AMRAP,
            timeCap: 900,
            rounds: null,
            exercises: [press, { ...rowEx, id: "ex-3", exerciseId: 0, exerciseName: "" }],
        });
        const result = validateConstructorRows([r]);
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.field === "rounds")).toBe(true);
    });

    it("amrap completo → válido", () => {
        const r = baseRow({
            setType: SET_TYPE.AMRAP,
            timeCap: 900,
            rounds: 3,
            exercises: [press],
        });
        expect(validateConstructorRows([r]).valid).toBe(true);
    });

    it("for_time sin rondas → inválido", () => {
        const r = baseRow({
            setType: SET_TYPE.FOR_TIME,
            rounds: null,
            exercises: [press],
        });
        expect(validateConstructorRows([r]).issues.some((i) => i.field === "rounds")).toBe(true);
    });

    it("for_time completo → válido", () => {
        const r = baseRow({
            setType: SET_TYPE.FOR_TIME,
            rounds: 4,
            exercises: [press],
        });
        expect(validateConstructorRows([r]).valid).toBe(true);
    });

    it("emom sin rondas → inválido (campo rounds)", () => {
        const r = baseRow({
            setType: SET_TYPE.EMOM,
            intervalSeconds: 120,
            rounds: null,
            exercises: [press],
        });
        const result = validateConstructorRows([r]);
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.field === "rounds")).toBe(true);
    });

    it("emom sin intervalo → inválido (campo intervalSeconds)", () => {
        const r = baseRow({
            setType: SET_TYPE.EMOM,
            intervalSeconds: null,
            rounds: 3,
            exercises: [press],
        });
        const result = validateConstructorRows([r]);
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.field === "intervalSeconds")).toBe(true);
    });

    it("emom completo → válido", () => {
        const r = baseRow({
            setType: SET_TYPE.EMOM,
            intervalSeconds: 120,
            rounds: 3,
            exercises: [press],
        });
        expect(validateConstructorRows([r]).valid).toBe(true);
    });
});
