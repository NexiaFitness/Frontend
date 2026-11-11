/**
 * B-01: sets null durante edición no debe normalizarse a 3 en el campo (concatenación 36).
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../../constructorTypes";
import { normalizeSingleSetRow } from "./singleSetRow";

function singleSetRow(sets: number | null): ConstructorRow {
    return {
        id: "row-b01",
        blockTypeId: 1,
        setType: SET_TYPE.SINGLE_SET,
        sets,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        exercises: [],
        rest: 60,
        setData: undefined,
    };
}

describe("normalizeSingleSetRow — sets en edición (B-01)", () => {
    it("conserva sets null para el input vacío pero mantiene 3 sub-filas por defecto", () => {
        const normalized = normalizeSingleSetRow(singleSetRow(null));
        expect(normalized.sets).toBeNull();
        expect(normalized.setData).toHaveLength(3);
    });

    it("aplica el número de series cuando el usuario confirma un valor", () => {
        const normalized = normalizeSingleSetRow(singleSetRow(6));
        expect(normalized.sets).toBe(6);
        expect(normalized.setData).toHaveLength(6);
    });
});
