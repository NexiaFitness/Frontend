/**
 * muscleFacetLabel — prioriza catálogo muscles[] sobre musculatura_principal legacy.
 */
import { describe, expect, it } from "vitest";
import { exercisePatternLabels, muscleFacetLabel } from "./filterOptions";
import type { MuscleFacetInput, PatternLabelsInput } from "./filterOptions";

describe("muscleFacetLabel", () => {
    it("uses catalog muscles when musculatura_principal is legacy placeholder", () => {
        const exercise = {
            musculatura_principal: "variable",
            muscles: [
                {
                    id: 13,
                    name: "biceps_brachii",
                    name_en: "biceps_brachii",
                    name_es: "bíceps braquial",
                    role: "prime_mover",
                },
            ],
        } as MuscleFacetInput;

        expect(muscleFacetLabel(exercise)).toBe("bíceps braquial");
    });

    it("falls back to musculatura_principal when muscles array is empty", () => {
        const exercise = {
            musculatura_principal: "pectoral mayor",
            muscles: [],
        } as MuscleFacetInput;

        expect(muscleFacetLabel(exercise)).toBe("pectoral mayor");
    });
});

describe("exercisePatternLabels", () => {
    it("ignores legacy general when catalog movement_patterns exist", () => {
        const exercise = {
            patron_movimiento: "general",
            movement_patterns: [
                {
                    id: 1,
                    name_en: "accessory_single_joint",
                    name_es: "Accesorio / monoarticular",
                    role: "primary",
                },
            ],
        } as PatternLabelsInput;

        expect(exercisePatternLabels(exercise)).toEqual(["Accesorio / monoarticular"]);
    });
});
