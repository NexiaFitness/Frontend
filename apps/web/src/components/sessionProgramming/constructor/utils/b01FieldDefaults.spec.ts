/**
 * B-01: borrar el número no puede reponer el defecto. Si no, el siguiente dígito concatena (3 → 36).
 */

import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../../constructorTypes";
import { normalizeEmomRow, seedEmomDefaults } from "./emomRow";
import { normalizeForTimeRow, seedForTimeDefaults } from "./forTimeRow";
import { applyConstructorRowUpdate } from "./supersetRow";

function row(
    setType: ConstructorRow["setType"],
    patch: Partial<ConstructorRow> = {},
): ConstructorRow {
    return {
        id: "row-b01",
        blockTypeId: 1,
        setType,
        sets: 3,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        exercises: [],
        rest: 60,
        ...patch,
    };
}

describe("B-01: el defecto no vuelve al campo al borrar", () => {
    it.each([
        SET_TYPE.SINGLE_SET,
        SET_TYPE.SUPERSET,
        SET_TYPE.GIANT_SET,
        SET_TYPE.DROPSET,
    ])("%s conserva sets null y un 6", (setType) => {
        const cleared = applyConstructorRowUpdate(row(setType, { sets: null }), { sets: null });
        const confirmed = applyConstructorRowUpdate(row(setType, { sets: 6 }), { sets: 6 });
        expect(cleared.sets).toBeNull();
        expect(confirmed.sets).toBe(6);
    });

    it("for time conserva rounds null y un 6", () => {
        expect(normalizeForTimeRow(row(SET_TYPE.FOR_TIME)).rounds).toBeNull();
        expect(normalizeForTimeRow(row(SET_TYPE.FOR_TIME, { rounds: 6 })).rounds).toBe(6);
        const cleared = applyConstructorRowUpdate(row(SET_TYPE.FOR_TIME, { rounds: 3 }), {
            rounds: null,
        });
        expect(cleared.rounds).toBeNull();
    });

    it("emom conserva rounds e intervalSeconds null, y un 6", () => {
        const empty = normalizeEmomRow(row(SET_TYPE.EMOM));
        expect(empty.rounds).toBeNull();
        expect(empty.intervalSeconds).toBeNull();
        const six = normalizeEmomRow(row(SET_TYPE.EMOM, { rounds: 6, intervalSeconds: 360 }));
        expect(six.rounds).toBe(6);
        expect(six.intervalSeconds).toBe(360);
        const cleared = applyConstructorRowUpdate(
            row(SET_TYPE.EMOM, { rounds: 3, intervalSeconds: 60 }),
            { rounds: null, intervalSeconds: null },
        );
        expect(cleared.rounds).toBeNull();
        expect(cleared.intervalSeconds).toBeNull();
    });

    it("amrap en edición no repone rondas ni duración", () => {
        const cleared = applyConstructorRowUpdate(
            row(SET_TYPE.AMRAP, { rounds: 3, timeCap: 600 }),
            { rounds: null, timeCap: null },
        );
        expect(cleared.rounds).toBeNull();
        expect(cleared.timeCap).toBeNull();
        const six = applyConstructorRowUpdate(row(SET_TYPE.AMRAP, { rounds: 6 }), { rounds: 6 });
        expect(six.rounds).toBe(6);
    });

    it("el alta siembra el 3 y los 60 s una sola vez", () => {
        expect(seedForTimeDefaults(row(SET_TYPE.FOR_TIME)).rounds).toBe(3);
        const emom = seedEmomDefaults(row(SET_TYPE.EMOM));
        expect(emom.rounds).toBe(3);
        expect(emom.intervalSeconds).toBe(60);
        expect(seedForTimeDefaults(row(SET_TYPE.FOR_TIME, { rounds: 6 })).rounds).toBe(6);
    });
});
