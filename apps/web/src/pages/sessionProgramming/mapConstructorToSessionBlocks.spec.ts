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
