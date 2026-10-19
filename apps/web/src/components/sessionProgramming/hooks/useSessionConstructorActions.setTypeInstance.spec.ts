import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../constructorTypes";
import { normalizeConstructorRowForSetType } from "./useSessionConstructorActions";
import { findBlockInstanceSetTypeConflicts } from "@nexia/shared/sessionProgramming/constructorBlockInstanceCoherence";

function row(
    id: string,
    instanceId: string,
    setType: ConstructorRow["setType"] = SET_TYPE.SINGLE_SET,
): ConstructorRow {
    return {
        id,
        blockInstanceId: instanceId,
        blockTypeId: 1,
        setType,
        sets: 3,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        exercises: [],
        rest: 60,
        repsTipo: "reps",
    };
}

describe("block instance setType coherence", () => {
    it("synced rows in one instance have no conflict", () => {
        const instance = "binst-a";
        const rows = [
            row("r1", instance, SET_TYPE.SUPERSET),
            row("r2", instance, SET_TYPE.SUPERSET),
        ];
        expect(findBlockInstanceSetTypeConflicts(rows)).toHaveLength(0);
    });

    it("normalizeConstructorRowForSetType preserves shared setType on secondary rows", () => {
        const primary = normalizeConstructorRowForSetType(
            row("r1", "binst-b", SET_TYPE.SUPERSET),
        );
        expect(primary.setType).toBe(SET_TYPE.SUPERSET);
        expect(primary.exercises.length).toBeGreaterThanOrEqual(2);
    });
});
