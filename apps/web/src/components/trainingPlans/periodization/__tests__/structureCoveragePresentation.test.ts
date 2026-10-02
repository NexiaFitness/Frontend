/**
 * structureCoveragePresentation.test.ts — Copy y helpers cobertura estructura.
 */

import { describe, expect, it } from "vitest";

import {
    STRUCTURE_COVERAGE_COPY,
    firstStructureCoverageWeekOrdinal,
    formatStructureCoverageDetail,
    structureCoverageIncomplete,
} from "../structureCoveragePresentation";

describe("structureCoveragePresentation", () => {
    it("structureCoverageIncomplete cuando complete es false", () => {
        expect(
            structureCoverageIncomplete({
                complete: false,
                missing_week_ordinals: [2],
                days_without_patterns: [],
            }),
        ).toBe(true);
        expect(structureCoverageIncomplete(null)).toBe(false);
    });

    it("formatStructureCoverageDetail resume huecos", () => {
        const text = formatStructureCoverageDetail({
            complete: false,
            missing_week_ordinals: [2, 3],
            days_without_patterns: [{ week: 1, dow: 2 }],
        });
        expect(text).toContain("Semanas sin configurar: 2, 3");
        expect(text).toContain("Días sin patrones");
    });

    it("CTA copy y primer ordinal (missing o día sin patrones)", () => {
        expect(STRUCTURE_COVERAGE_COPY.completeStructureCta).toBe(
            "Completar estructura",
        );
        expect(
            firstStructureCoverageWeekOrdinal({
                complete: false,
                missing_week_ordinals: [2],
                days_without_patterns: [],
            }),
        ).toBe(2);
        expect(
            firstStructureCoverageWeekOrdinal({
                complete: false,
                missing_week_ordinals: [],
                days_without_patterns: [{ week: 1, dow: 4 }],
            }),
        ).toBe(1);
        expect(
            firstStructureCoverageWeekOrdinal({
                complete: true,
                missing_week_ordinals: [],
                days_without_patterns: [],
            }),
        ).toBeNull();
    });
});
