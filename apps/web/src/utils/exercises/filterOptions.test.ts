/**
 * muscleFacetLabel — prioriza catálogo muscles[] sobre musculatura_principal legacy.
 */
import { describe, expect, it } from "vitest";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { muscleFacetLabel } from "./filterOptions";

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
        } as Exercise;

        expect(muscleFacetLabel(exercise)).toBe("bíceps braquial");
    });

    it("falls back to musculatura_principal when muscles array is empty", () => {
        const exercise = {
            musculatura_principal: "pectoral mayor",
            muscles: [],
        } as Exercise;

        expect(muscleFacetLabel(exercise)).toBe("pectoral mayor");
    });
});
