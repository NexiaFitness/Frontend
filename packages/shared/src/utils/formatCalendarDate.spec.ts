import { describe, expect, it } from "vitest";

import {
    displaySessionTitle,
    formatCalendarDate,
    formatCalendarDateLong,
} from "./formatCalendarDate";

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

describe("displaySessionTitle", () => {
    it("reescribe ISO e inglés de seed, no el nombre del constructor", () => {
        expect(displaySessionTitle("Próxima sesión 2026-11-22", "2026-11-22")).toBe(
            "Próxima sesión 22 nov 2026",
        );
        expect(displaySessionTitle("Próxima sesión 05 Dec", "2026-12-05")).toBe(
            "Próxima sesión 5 dic 2026",
        );
        expect(displaySessionTitle("Hoy — 12 Nov", "2026-11-12")).toBe(
            "Hoy — 12 nov 2026",
        );
        expect(displaySessionTitle("QA Timed — 12 Nov", "2026-11-12")).toBe(
            "QA Timed — 12 nov 2026",
        );
        expect(
            displaySessionTitle("Fuerza máxima · sentadilla · mar 8 dic", "2026-12-08"),
        ).toBe("Fuerza máxima · sentadilla · mar 8 dic");
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
