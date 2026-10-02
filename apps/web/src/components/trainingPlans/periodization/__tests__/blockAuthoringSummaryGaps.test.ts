/**
 * blockAuthoringSummaryGaps.test.ts — Veredicto incompleto del Resumen.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import { buildBlockAuthoringSummaryGaps } from "../blockAuthoringSummaryGaps";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

function weekWithDays(
    days: { day_of_week: number; patternIds: number[] }[],
): WeeklyStructureWeekCreate[] {
    return [
        {
            week_ordinal: 1,
            days: days.map((d) => ({
                day_of_week: d.day_of_week,
                patterns: d.patternIds.map((id) => ({
                    movement_pattern_id: id,
                })),
            })),
        },
    ];
}

describe("buildBlockAuthoringSummaryGaps", () => {
    it("reporta días si no hay activos", () => {
        expect(
            buildBlockAuthoringSummaryGaps({
                activeDays: [],
                weeklyStructure: weekWithDays([]),
            }),
        ).toContain("días de entrenamiento");
    });

    it("reporta patrones si algún día activo no tiene", () => {
        const gaps = buildBlockAuthoringSummaryGaps({
            activeDays: [1, 3],
            weeklyStructure: weekWithDays([
                { day_of_week: 1, patternIds: [10] },
                { day_of_week: 3, patternIds: [] },
            ]),
        });
        expect(gaps).toContain("patrones en todos los días activos");
    });

    it("vacío si días+patrones OK y sin structure_coverage", () => {
        expect(
            buildBlockAuthoringSummaryGaps({
                activeDays: [1],
                weeklyStructure: weekWithDays([
                    { day_of_week: 1, patternIds: [10] },
                ]),
            }),
        ).toEqual([]);
    });

    it("incluye mensaje structure_coverage", () => {
        const gaps = buildBlockAuthoringSummaryGaps({
            activeDays: [1],
            weeklyStructure: weekWithDays([
                { day_of_week: 1, patternIds: [10] },
            ]),
            structureCoverageMessage: "Falta cobertura en semanas 2–3",
        });
        expect(gaps).toContain("Falta cobertura en semanas 2–3");
    });
});
