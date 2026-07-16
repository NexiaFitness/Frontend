import { describe, expect, it } from "vitest";
import { buildCatalogFilterOptions } from "./catalogFilterOptions";

describe("buildCatalogFilterOptions", () => {
    it("sorts by Spanish label and drops corrupt numeric names", () => {
        const options = buildCatalogFilterOptions([
            { id: 3, name_en: "lats", name_es: "dorsales" },
            { id: 1, name_en: "chest", name_es: "pectorales" },
            { id: 99, name_en: "42", name_es: "42" },
        ]);
        expect(options).toEqual([
            { id: 3, label: "dorsales" },
            { id: 1, label: "pectorales" },
        ]);
    });

    it("falls back to name_en when name_es is missing", () => {
        const options = buildCatalogFilterOptions([
            { id: 2, name_en: "barbell", name_es: null },
        ]);
        expect(options).toEqual([{ id: 2, label: "barbell" }]);
    });
});
