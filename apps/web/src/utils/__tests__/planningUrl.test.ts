/**
 * planningUrl.test.ts — Tests para utilidades de estado de planificación en URL
 *
 * Verifica: formatMonth, parseMonthToDate, defaults, validación month/week.
 *
 * @author Frontend Team
 * @since Fase 1 U3
 */

import { describe, it, expect } from "vitest";
import {
    formatMonth,
    parseMonthToDate,
    getDefaultPlanningMonth,
    getDefaultPlanningWeek,
    validatePlanningMonth,
    validatePlanningWeek,
} from "../planningUrl";

describe("planningUrl", () => {
    describe("formatMonth", () => {
        it("formatea Date a YYYY-MM", () => {
            expect(formatMonth(new Date(2026, 0, 15))).toBe("2026-01");
            expect(formatMonth(new Date(2026, 8, 1))).toBe("2026-09");
        });
    });

    describe("parseMonthToDate", () => {
        it("parsea YYYY-MM válido a primer día del mes", () => {
            const d = parseMonthToDate("2026-05");
            expect(d.getFullYear()).toBe(2026);
            expect(d.getMonth()).toBe(4);
            expect(d.getDate()).toBe(1);
        });

        it("devuelve fecha actual para string inválido", () => {
            const before = new Date();
            const d = parseMonthToDate("invalid");
            const after = new Date();
            expect(d.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(d.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
        });
    });

    describe("getDefaultPlanningMonth", () => {
        it("devuelve mes actual en formato YYYY-MM", () => {
            const result = getDefaultPlanningMonth();
            expect(validatePlanningMonth(result)).toBe(true);
        });
    });

    describe("getDefaultPlanningWeek", () => {
        it("devuelve número entre 1 y 4", () => {
            const w = getDefaultPlanningWeek();
            expect(w).toBeGreaterThanOrEqual(1);
            expect(w).toBeLessThanOrEqual(4);
        });
    });

    describe("validatePlanningMonth", () => {
        it("acepta YYYY-MM válido", () => {
            expect(validatePlanningMonth("2026-01")).toBe(true);
            expect(validatePlanningMonth("2025-12")).toBe(true);
        });

        it("rechaza formato inválido", () => {
            expect(validatePlanningMonth("")).toBe(false);
            expect(validatePlanningMonth("2026-1")).toBe(false);
            expect(validatePlanningMonth("26-01")).toBe(false);
            expect(validatePlanningMonth("2026-00")).toBe(false);
            expect(validatePlanningMonth("2026-13")).toBe(false);
        });
    });

    describe("validatePlanningWeek", () => {
        it("acepta 1 a 4", () => {
            expect(validatePlanningWeek(1)).toBe(true);
            expect(validatePlanningWeek(4)).toBe(true);
        });

        it("rechaza fuera de rango o no entero", () => {
            expect(validatePlanningWeek(0)).toBe(false);
            expect(validatePlanningWeek(5)).toBe(false);
            expect(validatePlanningWeek(1.5)).toBe(false);
            expect(validatePlanningWeek(NaN)).toBe(false);
        });
    });
});
