import { describe, expect, it } from "vitest";
import { sessionBlockLinesToLoadDraft } from "./sessionBlockLinesToLoadDraft";

describe("sessionBlockLinesToLoadDraft", () => {
    it("agrega series del mismo ejercicio y tipo de bloque", () => {
        expect(
            sessionBlockLinesToLoadDraft(
                [{ id: 10, block_type_id: 3 }],
                [
                    { session_block_id: 10, exercise_id: 16, planned_sets: 1 },
                    { session_block_id: 10, exercise_id: 16, planned_sets: 1 },
                    { session_block_id: 10, exercise_id: 11, planned_sets: 3 },
                ]
            )
        ).toEqual([
            { exercise_id: 16, planned_sets: 2, planned_duration: undefined, block_type_id: 3 },
            { exercise_id: 11, planned_sets: 3, planned_duration: undefined, block_type_id: 3 },
        ]);
    });

    it("omite entradas vacías en el listado", () => {
        const lines: Array<
            | { session_block_id: number; exercise_id: number; planned_sets: number }
            | undefined
        > = [undefined, { session_block_id: 1, exercise_id: 16, planned_sets: 2 }];
        expect(sessionBlockLinesToLoadDraft([{ id: 1, block_type_id: 2 }], lines)).toEqual([
            { exercise_id: 16, planned_sets: 2, planned_duration: undefined, block_type_id: 2 },
        ]);
    });

    it("omite líneas de un bloque desconocido", () => {
        expect(
            sessionBlockLinesToLoadDraft(
                [{ id: 1, block_type_id: 2 }],
                [{ session_block_id: 99, exercise_id: 16, planned_sets: 3 }]
            )
        ).toEqual([]);
    });
});
