/**
 * muscleFacetLabel — prioriza catálogo muscles[] sobre musculatura_principal legacy.
 */
import { describe, expect, it } from "vitest";
import {
    exerciseMatchesMuscleFilter,
    exercisePrimeMoverLabels,
    muscleFacetLabel,
} from "./filterOptions";
import type { MuscleFacetInput } from "./filterOptions";

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
                    priority: 1,
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

describe("exerciseMatchesMuscleFilter", () => {
    it("matches any prime mover label", () => {
        const exercise = {
            muscles: [
                { name_es: "glúteo mayor", role: "prime_mover", priority: 1 },
                { name_es: "cuádriceps femoral", role: "prime_mover", priority: 2 },
            ],
        } as MuscleFacetInput;
        expect(exerciseMatchesMuscleFilter(exercise, "cuádriceps femoral")).toBe(true);
    });
});

describe("exercisePrimeMoverLabels", () => {
    it("returns multiple prime movers", () => {
        const exercise = {
            muscles: [
                { name_es: "glúteo mayor", role: "prime_mover", priority: 1 },
                { name_es: "cuádriceps femoral", role: "prime_mover", priority: 2 },
            ],
        } as MuscleFacetInput;
        expect(exercisePrimeMoverLabels(exercise)).toHaveLength(2);
    });
});
