/**
 * sessionDayContextPresentation.test.ts — View-model B1 "Hoy toca"
 */

import { describe, expect, it } from "vitest";
import type { SessionDayRecommendations } from "@nexia/shared/types/sessionRecommendations";
import {
    buildBlockContextLine,
    buildStructureGapViewModel,
    buildWeeklyStructurePath,
    formatSessionDateLong,
    formatVolumeIntensityScale,
    isSessionRecommendationsWithValues,
} from "../sessionDayContextPresentation";

describe("sessionDayContextPresentation", () => {
    const baseRec: SessionDayRecommendations = {
        physical_quality: "hipertrofia",
        modality: "strength",
        client_experience: "intermediate",
        planned_volume_scale: 5,
        planned_intensity_scale: 5,
        training_frequency: 4,
        weekly_volume_units: 40,
        weekly_volume_unit_type: "series",
        recommended_daily_volume_units: 10,
        recommended_daily_volume_scale: 5,
        recommended_daily_intensity_scale: 5,
        day_inherited: false,
        period_block_id: 35,
        period_block_name: "Hipertrofia",
        period_block_start_date: "2026-07-01",
        period_block_end_date: "2026-07-31",
        block_week_ordinal: 3,
        block_week_count: 5,
        month_volume: null,
        month_intensity: null,
        week_volume: null,
        week_intensity: null,
        movement_patterns: [],
        training_plan_id: 513,
        volume_level: 5,
        intensity_level: 5,
        configured_week_count: 2,
        calendar_week_count: 5,
        has_complete_weekly_structure: false,
        current_week_has_structure: false,
    };

    it("formats session date in Spanish", () => {
        expect(formatSessionDateLong("2026-07-20")).toMatch(/2026/);
        expect(formatSessionDateLong("2026-07-20")).toMatch(/julio/i);
    });

    it("builds block context line with week ordinal", () => {
        expect(buildBlockContextLine(baseRec)).toContain("Hipertrofia");
        expect(buildBlockContextLine(baseRec)).toContain("Semana 3 de 5");
    });

    it("builds weekly structure navigation path", () => {
        expect(buildWeeklyStructurePath(513, 35)).toBe(
            "/dashboard/training-plans/513/period-blocks/35/weekly-structure",
        );
        expect(buildWeeklyStructurePath(513, 35, 5)).toBe(
            "/dashboard/training-plans/513/period-blocks/35/weekly-structure?week=5",
        );
    });

    it("detects structure gap when current week is missing", () => {
        const gap = buildStructureGapViewModel(baseRec);
        expect(gap.show).toBe(true);
        expect(gap.message).toContain("semana 3");
        expect(gap.configurePath).toContain("weekly-structure?week=3");
    });

    it("hides structure gap when patterns exist", () => {
        const gap = buildStructureGapViewModel({
            ...baseRec,
            movement_patterns: [
                {
                    id: 1,
                    name_es: "empuje vertical",
                    ui_bucket: "UPPER",
                    sub_pattern: null,
                },
            ],
        });
        expect(gap.show).toBe(false);
    });

    it("formats volume/intensity scale", () => {
        expect(formatVolumeIntensityScale(5, 7)).toBe("5 / 7");
    });

    it("narrows session recommendations with values", () => {
        expect(
            isSessionRecommendationsWithValues({
                client_id: 346,
                session_date: "2026-07-20",
                has_active_plan: true,
                has_planned_day: true,
                has_planned_values: true,
                recommendations: baseRec,
                coherence_warnings: [],
            }),
        ).toBe(true);
    });
});
