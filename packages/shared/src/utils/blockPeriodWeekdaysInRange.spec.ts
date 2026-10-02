/**
 * blockPeriodWeekdaysInRange.spec.ts — Tests N4 días ISO dentro del rango del bloque.
 *
 * @author NEXIA Shared
 * @since v1.0.3
 */

import { describe, expect, it } from "vitest";

import {
    blockWeekdayUnavailableReason,
    findStructureDaysOutsideBlockRange,
    getWeekdaysPresentInBlockRange,
    isWeekdayInBlockRange,
} from "./blockPeriodWeekdaysInRange";

describe("blockPeriodWeekdaysInRange", () => {
    it("bloque sáb–dom: solo 6 y 7 (no lunes)", () => {
        const days = getWeekdaysPresentInBlockRange("2026-10-03", "2026-10-04");
        expect(days).toEqual([6, 7]);
        expect(isWeekdayInBlockRange(1, "2026-10-03", "2026-10-04")).toBe(false);
        expect(blockWeekdayUnavailableReason(1, "2026-10-03", "2026-10-04")).toBe(
            "Este día no cae dentro del bloque.",
        );
    });

    it("bloque que empieza en miércoles una semana: lun–dom", () => {
        const days = getWeekdaysPresentInBlockRange("2026-03-04", "2026-03-10");
        expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("bloque de un solo día", () => {
        expect(getWeekdaysPresentInBlockRange("2026-10-03", "2026-10-03")).toEqual([
            6,
        ]);
    });

    it("detecta días activos fuera de rango", () => {
        const outside = findStructureDaysOutsideBlockRange(
            "2026-10-03",
            "2026-10-05",
            [1, 6],
        );
        expect(outside).toEqual([]);
        const outsideShort = findStructureDaysOutsideBlockRange(
            "2026-10-03",
            "2026-10-04",
            [1, 6],
        );
        expect(outsideShort).toEqual([1]);
    });
});
