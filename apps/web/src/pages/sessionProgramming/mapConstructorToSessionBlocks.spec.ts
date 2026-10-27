/**
 * mapConstructorToSessionBlocks.spec.ts — Agrupación persist create/full update.
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import {
    mapConstructorRowsToCreateBlockGroups,
    mapConstructorRowsToFullUpdateBlocks,
} from "./mapConstructorToSessionBlocks";
import { aggregateConstructorRowsForSessionLoadDraft } from "./aggregateConstructorForSessionLoadDraft";

function singleSetRow(partial: Partial<ConstructorRow> & { id: string }): ConstructorRow {
    return {
        blockTypeId: 18,
        setType: SET_TYPE.SINGLE_SET,
        sets: 1,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        exercises: [
            {
                id: `ex-${partial.id}`,
                exerciseId: Number(partial.id.replace(/\D/g, "")) || 1,
                exerciseName: "Test",
                plannedReps: "10",
                plannedWeight: 50,
                plannedAssistanceKg: null,
                plannedDuration: null,
                effortCharacter: null,
                effortValue: null,
                notes: null,
            },
        ],
        rest: 60,
        repsTipo: "reps",
        ...partial,
    };
}

describe("mapConstructorRowsToFullUpdateBlocks", () => {
    it("merges four rows with same blockInstanceId into one API block with four exercises", () => {
        const instance = "binst-test";
        const rows = ["a", "b", "c", "d"].map((suffix, i) =>
            singleSetRow({
                id: `row-${suffix}`,
                blockInstanceId: instance,
                serverBlockId: i === 0 ? 193 : 194 + i - 1,
            }),
        );

        const blocks = mapConstructorRowsToFullUpdateBlocks(rows);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].id).toBe(193);
        expect(blocks[0].exercises).toHaveLength(4);
        expect(blocks[0].exercises.map((e) => e.order_in_block)).toEqual([1, 2, 3, 4]);
    });

    it("keeps separate blocks for different blockInstanceId values", () => {
        const rows = [
            singleSetRow({ id: "row-1", blockInstanceId: "g1" }),
            singleSetRow({ id: "row-2", blockInstanceId: "g2" }),
        ];
        const blocks = mapConstructorRowsToFullUpdateBlocks(rows);
        expect(blocks).toHaveLength(2);
    });
});

describe("mapConstructorRowsToCreateBlockGroups", () => {
    it("creates one block group with global order_in_block for merged rows", () => {
        const rows = ["a", "b"].map((suffix) =>
            singleSetRow({ id: `row-${suffix}`, blockInstanceId: "same" }),
        );
        const groups = mapConstructorRowsToCreateBlockGroups(rows);
        expect(groups).toHaveLength(1);
        expect(groups[0].exercisePayloads).toHaveLength(2);
        expect(groups[0].exercisePayloads.map((e) => e.order_in_block)).toEqual([1, 2]);
    });
});

/**
 * QA H4 (sesión 4454): un EMOM de 6 rondas guarda planned_sets = 6 por ejercicio, y el
 * borrador de validate-draft cuenta lo mismo. Contrato en volumeEquivalentSets.ts y en
 * backend/docs/modules/session_load.md.
 */
describe("EMOM: planned_sets guardado = volumen del borrador", () => {
    const emomExercise = (id: string, exerciseId: number) => ({
        id,
        exerciseId,
        exerciseName: "Test",
        plannedReps: "5",
        plannedWeight: 60,
        plannedAssistanceKg: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        notes: null,
    });

    it("6 rondas y dos ventanas: cada ejercicio guarda 6 y el borrador cuenta 6", () => {
        const row: ConstructorRow = {
            id: "row-emom",
            blockInstanceId: "emom-1",
            blockTypeId: 24,
            setType: SET_TYPE.EMOM,
            sets: null,
            rounds: 6,
            timeCap: null,
            intervalSeconds: 60,
            exercises: [],
            rest: null,
            emomWindows: [
                { id: "w1", exercises: [emomExercise("ex-a", 11)] },
                { id: "w2", exercises: [emomExercise("ex-b", 36)] },
            ],
        };

        const [block] = mapConstructorRowsToFullUpdateBlocks([row]);
        expect(block.rounds).toBe(6);
        expect(
            block.exercises.map((e) => [e.exercise_id, e.planned_sets, e.superset_group_id]),
        ).toEqual([
            [11, 6, 1],
            [36, 6, 2],
        ]);

        expect(aggregateConstructorRowsForSessionLoadDraft([row])).toEqual([
            { exercise_id: 11, planned_sets: 6, block_type_id: 24 },
            { exercise_id: 36, planned_sets: 6, block_type_id: 24 },
        ]);
    });
});
