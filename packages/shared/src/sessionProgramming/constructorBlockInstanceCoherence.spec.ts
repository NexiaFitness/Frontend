/**
 * constructorBlockInstanceCoherence.spec.ts
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "../types/sessionProgramming";
import { findBlockInstanceSetTypeConflicts } from "./constructorBlockInstanceCoherence";

describe("findBlockInstanceSetTypeConflicts", () => {
    it("flags mixed set types in the same block instance", () => {
        const issues = findBlockInstanceSetTypeConflicts([
            {
                id: "r1",
                blockInstanceId: "g1",
                blockTypeId: 18,
                setType: SET_TYPE.SINGLE_SET,
            },
            {
                id: "r2",
                blockInstanceId: "g1",
                blockTypeId: 18,
                setType: SET_TYPE.SUPERSET,
            },
        ]);
        expect(issues).toHaveLength(1);
        expect(issues[0].setTypes).toContain(SET_TYPE.SINGLE_SET);
        expect(issues[0].setTypes).toContain(SET_TYPE.SUPERSET);
    });

    it("allows multiple rows with the same set type in one instance", () => {
        const issues = findBlockInstanceSetTypeConflicts([
            {
                id: "r1",
                blockInstanceId: "g1",
                blockTypeId: 18,
                setType: SET_TYPE.SINGLE_SET,
            },
            {
                id: "r2",
                blockInstanceId: "g1",
                blockTypeId: 18,
                setType: SET_TYPE.SINGLE_SET,
            },
        ]);
        expect(issues).toHaveLength(0);
    });
});
