import { describe, expect, it } from "vitest";
import { exerciseTagItems, tagDisplayLabel } from "./exerciseDetailLabels";

describe("tagDisplayLabel", () => {
    it("prefers Spanish catalog label", () => {
        expect(
            tagDisplayLabel({ name_en: "free_weight", name_es: "peso libre" })
        ).toBe("peso libre");
    });

    it("falls back to English slug", () => {
        expect(tagDisplayLabel({ name_en: "gymnastic", name_es: null })).toBe("gymnastic");
    });
});

describe("exerciseTagItems", () => {
    it("returns sorted unique tags by id", () => {
        expect(
            exerciseTagItems([
                { id: 6, name_en: "free_weight", name_es: "peso libre", category: null },
                { id: 3, name_en: "gymnastic", name_es: "gimnástico", category: null },
            ])
        ).toEqual([
            { id: 3, label: "gimnástico" },
            { id: 6, label: "peso libre" },
        ]);
    });

    it("returns empty array when tags missing", () => {
        expect(exerciseTagItems(null)).toEqual([]);
        expect(exerciseTagItems(undefined)).toEqual([]);
    });
});
