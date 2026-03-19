/**
 * sessionExerciseUtils.test.ts — Tests para métrica planned_sets vs actual_sets
 *
 * Fase 5: formatSetsMetric y computeSessionSetsTotals.
 *
 * @author Frontend Team
 * @since Fase 5
 */

import { describe, it, expect } from "vitest";
import {
    formatSetsMetric,
    computeSessionSetsTotals,
} from "../sessionExerciseUtils";

describe("sessionExerciseUtils", () => {
    describe("formatSetsMetric", () => {
        it("devuelve X/Y series con badge success cuando actual >= planned", () => {
            const r = formatSetsMetric(4, 4);
            expect(r.label).toBe("4/4 series");
            expect(r.badgeClass).toContain("success");
        });

        it("devuelve X/Y series con badge warning cuando actual < planned", () => {
            const r = formatSetsMetric(4, 2);
            expect(r.label).toBe("2/4 series");
            expect(r.badgeClass).toContain("warning");
        });

        it("devuelve X programadas cuando solo planned", () => {
            const r = formatSetsMetric(3, null);
            expect(r.label).toBe("3 programadas");
            expect(r.badgeClass).toContain("muted");
        });

        it("devuelve Y realizadas cuando solo actual", () => {
            const r = formatSetsMetric(null, 2);
            expect(r.label).toBe("2 realizadas");
            expect(r.badgeClass).toContain("muted");
        });

        it("devuelve guion cuando ninguno", () => {
            const r = formatSetsMetric(null, null);
            expect(r.label).toBe("—");
            expect(r.badgeClass).toContain("muted");
        });

        it("maneja undefined como null", () => {
            const r = formatSetsMetric(undefined, undefined);
            expect(r.label).toBe("—");
        });

        it("ignora valores negativos (trata como ausente)", () => {
            const r = formatSetsMetric(-1, 2);
            expect(r.label).toBe("2 realizadas");
        });
    });

    describe("computeSessionSetsTotals", () => {
        it("devuelve 0/0 para lista vacía", () => {
            const r = computeSessionSetsTotals([]);
            expect(r).toEqual({ totalPlanned: 0, totalActual: 0 });
        });

        it("suma planned_sets y actual_sets correctamente", () => {
            const r = computeSessionSetsTotals([
                { planned_sets: 3, actual_sets: 2 },
                { planned_sets: 4, actual_sets: 4 },
            ]);
            expect(r).toEqual({ totalPlanned: 7, totalActual: 6 });
        });

        it("ignora null y undefined", () => {
            const r = computeSessionSetsTotals([
                { planned_sets: 3, actual_sets: null },
                { planned_sets: null, actual_sets: 2 },
            ]);
            expect(r).toEqual({ totalPlanned: 3, totalActual: 2 });
        });

        it("ignora valores negativos", () => {
            const r = computeSessionSetsTotals([
                { planned_sets: -1, actual_sets: 1 },
            ]);
            expect(r).toEqual({ totalPlanned: 0, totalActual: 1 });
        });
    });
});
