import { describe, expect, it } from "vitest";

import { formatCalendarDate, formatCalendarDateLong } from "./formatCalendarDate";

describe("formatCalendarDate", () => {
    it("formatea YYYY-MM-DD como día mes año en español", () => {
        expect(formatCalendarDate("2026-11-11")).toBe("11 nov 2026");
        expect(formatCalendarDate("2026-01-01")).toBe("1 ene 2026");
    });

    it("usa el día del calendario, no el UTC", () => {
        expect(formatCalendarDate("2026-11-11T23:00:00.000Z")).toBe("11 nov 2026");
    });

    it("devuelve el vacío cuando no hay fecha", () => {
        expect(formatCalendarDate(null)).toBe("—");
        expect(formatCalendarDate(undefined)).toBe("—");
        expect(formatCalendarDate("")).toBe("—");
        expect(formatCalendarDate("   ", "Sin fecha")).toBe("Sin fecha");
    });
});

describe("formatCalendarDateLong", () => {
    it("incluye el día de la semana en español", () => {
        expect(formatCalendarDateLong("2026-11-11")).toBe("miércoles 11 nov 2026");
    });

    it("devuelve Sin fecha cuando no hay valor", () => {
        expect(formatCalendarDateLong(null)).toBe("Sin fecha");
    });
});
