/**
 * weekPlanningData.test.ts — Tests para getWeekStartDate y getWeekDates
 *
 * Fase 5: Vista semana L-D. Funciones puras exportadas desde @nexia/shared.
 *
 * @author Frontend Team
 * @since Fase 5
 */

import { describe, it, expect } from "vitest";
import {
    getWeekStartDate,
    getWeekDates,
} from "@nexia/shared/hooks/training/useWeekPlanningData";

describe("weekPlanningData", () => {
    describe("getWeekStartDate", () => {
        it("devuelve lunes de la semana 1 para 2026-01 (1 enero es jueves)", () => {
            const d = getWeekStartDate("2026-01", 1);
            expect(d.getDay()).toBe(1);
            expect(d.getFullYear()).toBe(2025);
            expect(d.getMonth()).toBe(11);
            expect(d.getDate()).toBe(29);
        });

        it("devuelve lunes de la semana 2 para 2026-01", () => {
            const d = getWeekStartDate("2026-01", 2);
            expect(d.getDay()).toBe(1);
            expect(d.getFullYear()).toBe(2026);
            expect(d.getMonth()).toBe(0);
            expect(d.getDate()).toBe(5);
        });

        it("devuelve lunes de la semana 1 para 2026-02 (1 febrero es domingo)", () => {
            const d = getWeekStartDate("2026-02", 1);
            expect(d.getDay()).toBe(1);
            expect(d.getFullYear()).toBe(2026);
            expect(d.getMonth()).toBe(0);
            expect(d.getDate()).toBe(26);
        });
    });

    describe("getWeekDates", () => {
        it("devuelve 7 fechas consecutivas desde el lunes", () => {
            const monday = new Date(2026, 0, 5);
            const dates = getWeekDates(monday);
            expect(dates).toHaveLength(7);
            expect(dates[0]).toBe("2026-01-05");
            expect(dates[1]).toBe("2026-01-06");
            expect(dates[6]).toBe("2026-01-11");
        });

        it("formato YYYY-MM-DD para cada fecha", () => {
            const monday = new Date(2026, 0, 5);
            const dates = getWeekDates(monday);
            const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
            dates.forEach((d) => expect(d).toMatch(isoRegex));
        });
    });
});
