import { describe, expect, it } from "vitest";

import type { PhysicalQuality, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";

import {
    detectAmbiguousMixWarnings,
    getCoPrimarySlugs,
    isCoPrimaryMix,
} from "../periodizationQualitiesPresentation";

const catalog: PhysicalQuality[] = [
    {
        id: 1,
        name: "Hipertrofia",
        slug: "hipertrofia",
        modality: "strength",
        has_volume: true,
        display_order: 2,
    },
    {
        id: 2,
        name: "Fuerza máxima",
        slug: "fuerza_maxima",
        modality: "strength",
        has_volume: true,
        display_order: 1,
    },
    {
        id: 3,
        name: "Resistencia aeróbica",
        slug: "resistencia_aerobica",
        modality: "aerobic",
        has_volume: false,
        display_order: 5,
    },
    {
        id: 4,
        name: "Cardio extensivo",
        slug: "cardio_extensivo",
        modality: "aerobic",
        has_volume: false,
        display_order: 7,
    },
];

function q(id: number, percentage: number): PeriodBlockQualityInput {
    return { physical_quality_id: id, percentage };
}

describe("periodizationQualitiesPresentation", () => {
    it("detects co-primary at 50/50", () => {
        const qualities = [q(1, 50), q(2, 50)];
        expect(isCoPrimaryMix(qualities, catalog)).toBe(true);
        expect(getCoPrimarySlugs(qualities, catalog).sort()).toEqual([
            "fuerza_maxima",
            "hipertrofia",
        ]);
    });

    it("unique max is not co-primary", () => {
        const qualities = [q(1, 70), q(2, 30)];
        expect(isCoPrimaryMix(qualities, catalog)).toBe(false);
    });

    it("flags aerobic outcome + method mix", () => {
        const qualities = [q(3, 60), q(4, 40)];
        const warnings = detectAmbiguousMixWarnings(qualities, catalog);
        expect(warnings.some((w) => w.id === "aerobic_outcome_method")).toBe(true);
    });
});
