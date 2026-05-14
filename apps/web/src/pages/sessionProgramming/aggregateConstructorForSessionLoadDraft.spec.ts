/**
 * aggregateConstructorForSessionLoadDraft.spec.ts — Contrato validate-draft desde el constructor.
 * Casos críticos: filas sin ejercicio no inflan el borrador; mismo ejercicio en varias filas suma series.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { aggregateConstructorRowsForSessionLoadDraft } from "./aggregateConstructorForSessionLoadDraft";

function ex(partial: Partial<ConstructorExercise> & Pick<ConstructorExercise, "exerciseId">): ConstructorExercise {
    return {
        id: partial.id ?? "ex-1",
        exerciseId: partial.exerciseId,
        exerciseName: partial.exerciseName ?? "X",
        plannedReps: partial.plannedReps ?? null,
        plannedWeight: partial.plannedWeight ?? null,
        plannedDuration: partial.plannedDuration ?? null,
        effortCharacter: partial.effortCharacter ?? null,
        effortValue: partial.effortValue ?? null,
        notes: partial.notes ?? null,
    };
}

function row(partial: Partial<ConstructorRow> & Pick<ConstructorRow, "id">): ConstructorRow {
    return {
        id: partial.id,
        blockTypeId: partial.blockTypeId ?? 1,
        setType: partial.setType ?? SET_TYPE.GIANT_SET,
        sets: partial.sets ?? null,
        rounds: partial.rounds ?? null,
        timeCap: partial.timeCap ?? null,
        intervalSeconds: partial.intervalSeconds ?? null,
        exercises: partial.exercises ?? [],
        rest: partial.rest ?? 60,
        repsTipo: partial.repsTipo ?? "reps",
    };
}

describe("aggregateConstructorRowsForSessionLoadDraft", () => {
    it("lista vacía → sin líneas de borrador", () => {
        expect(aggregateConstructorRowsForSessionLoadDraft([])).toEqual([]);
    });

    it("fila sin ejercicios no envía planned_sets aunque sets > 0", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({ id: "r1", sets: 3, exercises: [] }),
        ]);
        expect(out).toEqual([]);
    });

    it("una fila single_set, un ejercicio → planned_sets = sets de la fila", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({
                id: "r1",
                setType: SET_TYPE.SINGLE_SET,
                sets: 4,
                exercises: [ex({ exerciseId: 10 })],
            }),
        ]);
        expect(out).toEqual([{ exercise_id: 10, planned_sets: 4 }]);
    });

    it("dos filas con el mismo exercise_id acumulan series (comportamiento actual)", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({ id: "r1", sets: 3, exercises: [ex({ exerciseId: 7 })] }),
            row({ id: "r2", sets: 2, exercises: [ex({ exerciseId: 7 })] }),
        ]);
        expect(out).toEqual([{ exercise_id: 7, planned_sets: 5 }]);
    });

    it("sets null en fila se trata como 0", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({
                id: "r1",
                sets: null,
                exercises: [ex({ exerciseId: 5 })],
            }),
        ]);
        expect(out).toEqual([{ exercise_id: 5, planned_sets: 0 }]);
    });

    it("ignora exerciseId 0 o negativo", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({
                id: "r1",
                sets: 3,
                exercises: [
                    ex({ id: "a", exerciseId: 0 }),
                    ex({ id: "b", exerciseId: -1 }),
                    ex({ id: "c", exerciseId: 12 }),
                ],
            }),
        ]);
        expect(out).toEqual([{ exercise_id: 12, planned_sets: 3 }]);
    });

    it("varios ejercicios en la misma fila repiten sets de la fila para cada uno", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({
                id: "r1",
                sets: 3,
                exercises: [ex({ id: "a", exerciseId: 1 }), ex({ id: "b", exerciseId: 2 })],
            }),
        ]);
        expect(out).toEqual(
            expect.arrayContaining([
                { exercise_id: 1, planned_sets: 3 },
                { exercise_id: 2, planned_sets: 3 },
            ])
        );
        expect(out).toHaveLength(2);
    });

    it("single_set con setData cuenta una serie por sub-fila", () => {
        const out = aggregateConstructorRowsForSessionLoadDraft([
            row({
                id: "r1",
                setType: SET_TYPE.SINGLE_SET,
                sets: 3,
                setData: [
                    {
                        id: "s1",
                        plannedReps: "10",
                        plannedWeight: null,
                        plannedDuration: null,
                        effortCharacter: null,
                        effortValue: null,
                        rest: 60,
                        isManuallyEdited: false,
                    },
                    {
                        id: "s2",
                        plannedReps: "10",
                        plannedWeight: null,
                        plannedDuration: null,
                        effortCharacter: null,
                        effortValue: null,
                        rest: 60,
                        isManuallyEdited: false,
                    },
                    {
                        id: "s3",
                        plannedReps: "10",
                        plannedWeight: null,
                        plannedDuration: null,
                        effortCharacter: null,
                        effortValue: null,
                        rest: 60,
                        isManuallyEdited: false,
                    },
                ],
                exercises: [ex({ exerciseId: 99 })],
            }),
        ]);
        expect(out).toEqual([{ exercise_id: 99, planned_sets: 3 }]);
    });
});
