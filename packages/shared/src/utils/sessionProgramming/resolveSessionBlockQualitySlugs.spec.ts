import { describe, expect, it } from "vitest";
import type { PlanPeriodBlock } from "../../types/planningCargas";
import type { SessionRecommendationsWithValues } from "../../types/sessionRecommendations";
import {
    extractQualitySlugsFromPeriodBlock,
    resolveSessionBlockQualitySlugs,
} from "./resolveSessionBlockQualitySlugs";

const baseBlock = (overrides: Partial<PlanPeriodBlock> = {}): PlanPeriodBlock => ({
    id: 1,
    training_plan_id: 10,
    name: "Hipertrofia",
    goal: null,
    start_date: "2026-09-01",
    end_date: "2026-11-30",
    volume_level: 8,
    intensity_level: 8,
    sort_order: 0,
    qualities: [],
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    is_active: true,
    ...overrides,
});

describe("resolveSessionBlockQualitySlugs", () => {
    it("prefiere quality_mix de recommendations cuando hay valores planificados", () => {
        const response: SessionRecommendationsWithValues = {
            client_id: 1,
            session_date: "2026-09-29",
            has_active_plan: true,
            has_planned_day: true,
            has_planned_values: true,
            coherence_warnings: [],
            recommendations: {
                physical_quality: "max_strength",
                quality_mix: [
                    { slug: "max_strength", name: "Fuerza máxima", percentage: 50 },
                    { slug: "hypertrophy", name: "Hipertrofia", percentage: 50 },
                ],
                modality: "strength",
                client_experience: "intermediate",
                planned_volume_scale: 8,
                planned_intensity_scale: 8,
                training_frequency: 4,
                weekly_volume_units: 0,
                weekly_volume_unit_type: "sets",
                recommended_daily_volume_units: 0,
                recommended_daily_volume_scale: 8,
                recommended_daily_intensity_scale: 8,
                day_inherited: false,
                month_volume: null,
                month_intensity: null,
                week_volume: null,
                week_intensity: null,
            },
        };

        expect(
            resolveSessionBlockQualitySlugs({
                sessionRecommendations: response,
                sessionDate: "2026-09-29",
                periodBlocks: [],
            }),
        ).toEqual(["max_strength", "hypertrophy"]);
    });

    it("usa qualities del period block cuando no hay recommendations con mix", () => {
        const block = baseBlock({
            qualities: [
                {
                    id: 1,
                    physical_quality_id: 1,
                    percentage: 50,
                    physical_quality_name: "Fuerza máxima",
                    physical_quality_slug: "max_strength",
                    evaluation_binding: null,
                },
                {
                    id: 2,
                    physical_quality_id: 2,
                    percentage: 50,
                    physical_quality_name: "Hipertrofia",
                    physical_quality_slug: "hypertrophy",
                    evaluation_binding: null,
                },
            ],
        });

        expect(
            resolveSessionBlockQualitySlugs({
                sessionDate: "2026-09-29",
                periodBlocks: [block],
            }),
        ).toEqual(["max_strength", "hypertrophy"]);
    });

    it("extractQualitySlugsFromPeriodBlock deduplica y omite slugs vacíos", () => {
        expect(
            extractQualitySlugsFromPeriodBlock(
                baseBlock({
                    qualities: [
                        {
                            id: 1,
                            physical_quality_id: 1,
                            percentage: 100,
                            physical_quality_name: "Hipertrofia",
                            physical_quality_slug: "hypertrophy",
                            evaluation_binding: null,
                        },
                        {
                            id: 2,
                            physical_quality_id: 1,
                            percentage: 0,
                            physical_quality_name: "Hipertrofia",
                            physical_quality_slug: "hypertrophy",
                            evaluation_binding: null,
                        },
                        {
                            id: 3,
                            physical_quality_id: 2,
                            percentage: 0,
                            physical_quality_name: null,
                            physical_quality_slug: null,
                            evaluation_binding: null,
                        },
                    ],
                }),
            ),
        ).toEqual(["hypertrophy"]);
    });
});
