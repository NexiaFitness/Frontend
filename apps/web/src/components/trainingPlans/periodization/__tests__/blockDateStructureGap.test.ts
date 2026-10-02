/**
 * blockDateStructureGap.test.ts — Huecos tras cambio de fechas (Fase 4).
 */

import { describe, expect, it } from "vitest";

import {
    buildBlockDateStructureGapViewModel,
    missingStructureOrdinalsForDateRange,
} from "../blockDateStructureGap";

describe("blockDateStructureGap", () => {
    it("missingStructureOrdinalsForDateRange lista semanas sin fila", () => {
        const missing = missingStructureOrdinalsForDateRange(
            "2026-01-01",
            "2026-01-21",
            [{ week_ordinal: 1, label: null, days: [] }],
        );
        expect(missing).toEqual([2, 3, 4]);
    });

    it("buildBlockDateStructureGapViewModel incluye CTA Replicar semana tipo", () => {
        const vm = buildBlockDateStructureGapViewModel({
            planId: 586,
            blockId: 76,
            startDate: "2026-10-01",
            endDate: "2026-10-21",
            weeklyStructure: [{ week_ordinal: 1, label: null, days: [] }],
            persistedStartDate: "2026-10-01",
            persistedEndDate: "2026-10-07",
        });
        expect(vm.show).toBe(true);
        expect(vm.replicateWeekPath).toBe(
            "/dashboard/training-plans/586/period-blocks/76/weekly-structure?week=2",
        );
        expect(vm.message).toMatch(/Replicar|replica/i);
    });
});
