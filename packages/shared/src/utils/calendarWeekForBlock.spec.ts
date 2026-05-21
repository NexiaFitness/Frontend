/**
 * calendarWeekForBlock.spec.ts — Tests de semanas calendario para bloques.
 *
 * Contexto: regresión del constructor (rango 20–31 may 2026, mar/jue/sáb).
 * @author Frontend Team
 * @since v6.4.0
 */

import { describe, expect, it } from "vitest";
import {
    formatCalendarWeekRange,
    getBlockCalendarWeekCount,
    getBlockCalendarWeekOrdinal,
    getMondayOfWeekLocal,
} from "./calendarWeekForBlock";

describe("getMondayOfWeekLocal", () => {
    it("miércoles 20 may 2026 → lunes 18 may", () => {
        expect(getMondayOfWeekLocal("2026-05-20")).toBe("2026-05-18");
    });
});

describe("getBlockCalendarWeekOrdinal", () => {
    const blockStart = "2026-05-20";

    it("jueves 21 y sábado 23 → semana 1; martes 26 → semana 2", () => {
        expect(getBlockCalendarWeekOrdinal("2026-05-21", blockStart)).toBe(1);
        expect(getBlockCalendarWeekOrdinal("2026-05-23", blockStart)).toBe(1);
        expect(getBlockCalendarWeekOrdinal("2026-05-26", blockStart)).toBe(2);
        expect(getBlockCalendarWeekOrdinal("2026-05-28", blockStart)).toBe(2);
        expect(getBlockCalendarWeekOrdinal("2026-05-30", blockStart)).toBe(2);
    });
});

describe("getBlockCalendarWeekCount", () => {
    it("bloque 20–31 may → 2 semanas calendario", () => {
        expect(getBlockCalendarWeekCount("2026-05-20", "2026-05-31")).toBe(2);
    });
});

describe("formatCalendarWeekRange", () => {
    it("semana 1 y 2 del bloque 20 may muestran lun 18–24 y lun 25–31", () => {
        const w1 = formatCalendarWeekRange(1, "2026-05-20");
        const w2 = formatCalendarWeekRange(2, "2026-05-20");
        expect(w1).toContain("18");
        expect(w1).toContain("24");
        expect(w2).toContain("25");
        expect(w2).toContain("31");
    });
});
