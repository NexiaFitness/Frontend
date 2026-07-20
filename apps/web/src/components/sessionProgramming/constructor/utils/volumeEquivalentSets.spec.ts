/**
 * B6 QA — series equivalentes por tipo de serie (contrato volumen).
 * @see docs/tipo-serie/10_contrato-volumen-series-equivalentes.md
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../../constructorTypes";
import {
    getPersistLinePlannedSets,
    getRowVolumeSetsPerExercise,
} from "./volumeEquivalentSets";
import { aggregateConstructorRowsForSessionLoadDraft } from "@/pages/sessionProgramming/aggregateConstructorForSessionLoadDraft";

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

const row = {
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

describe("B6 — volumeEquivalentSets", () => {
    it("single_set: 4 sub-filas = 4 series equivalentes", () => {
        const r = baseRow({
            setType: SET_TYPE.SINGLE_SET,
            sets: 4,
            exercises: [press],
            setData: [
                { id: "s1", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
                { id: "s2", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
                { id: "s3", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
                { id: "s4", plannedReps: "8", plannedWeight: 60, plannedDuration: null, effortCharacter: null, effortValue: null, rest: 90, isManuallyEdited: false },
            ],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(4);
        const draft = aggregateConstructorRowsForSessionLoadDraft([r]);
        expect(draft).toEqual([{ exercise_id: 101, planned_sets: 4 }]);
    });

    it("superset: 3 rondas = 3 series por ejercicio", () => {
        const r = baseRow({
            setType: SET_TYPE.SUPERSET,
            sets: 3,
            exercises: [press, row],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(3);
        const draft = aggregateConstructorRowsForSessionLoadDraft([r]);
        expect(draft).toEqual([
            { exercise_id: 101, planned_sets: 3 },
            { exercise_id: 102, planned_sets: 3 },
        ]);
    });

    it("dropset: 3 rondas = 3 series (drops no suman)", () => {
        const r = baseRow({
            setType: SET_TYPE.DROPSET,
            sets: 3,
            exercises: [press],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(3);
        expect(getPersistLinePlannedSets(r, { dropsetSequence: 0 })).toBe(3);
        expect(getPersistLinePlannedSets(r, { dropsetSequence: 1 })).toBe(0);
    });

    it("amrap CON rondas objetivo: cuenta rondas por ejercicio", () => {
        const r = baseRow({
            setType: SET_TYPE.AMRAP,
            rounds: 5,
            timeCap: 15,
            exercises: [press, row, { ...press, id: "ex-3", exerciseId: 103, exerciseName: "Flexiones" }],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(5);
        const draft = aggregateConstructorRowsForSessionLoadDraft([r]);
        expect(draft).toHaveLength(3);
        draft.forEach((line) => expect(line.planned_sets).toBe(5));
    });

    it("amrap SIN rondas objetivo: volumen programado = 0 (gap producto)", () => {
        const r = baseRow({
            setType: SET_TYPE.AMRAP,
            rounds: null,
            sets: null,
            timeCap: 15,
            exercises: [press],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(0);
        expect(aggregateConstructorRowsForSessionLoadDraft([r])).toEqual([]);
    });

    it("emom: usa rounds como amrap", () => {
        const r = baseRow({
            setType: SET_TYPE.EMOM,
            rounds: 8,
            exercises: [press],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(8);
    });

    it("for_time: usa rounds ?? sets", () => {
        const r = baseRow({
            setType: SET_TYPE.FOR_TIME,
            rounds: 4,
            exercises: [press],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(4);
    });

    it("single_set tiempo: sigue contando series, no segundos", () => {
        const r = baseRow({
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            repsTipo: "tiempo",
            exercises: [{ ...press, repsTipo: "tiempo", plannedDuration: 45 }],
            setData: [
                { id: "s1", plannedReps: null, plannedWeight: null, plannedDuration: 45, effortCharacter: null, effortValue: null, rest: 60, isManuallyEdited: false },
                { id: "s2", plannedReps: null, plannedWeight: null, plannedDuration: 45, effortCharacter: null, effortValue: null, rest: 60, isManuallyEdited: false },
                { id: "s3", plannedReps: null, plannedWeight: null, plannedDuration: 45, effortCharacter: null, effortValue: null, rest: 60, isManuallyEdited: false },
            ],
        });
        expect(getRowVolumeSetsPerExercise(r)).toBe(3);
    });
});
