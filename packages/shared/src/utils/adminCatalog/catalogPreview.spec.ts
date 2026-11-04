import { describe, expect, it } from "vitest";

import { formatCatalogVolumePerSet } from "./catalogPreview";

describe("texto de la vista previa", () => {
    it("junta los grupos con el multiplicador de una serie", () => {
        expect(
            formatCatalogVolumePerSet([
                { name: "Cuádriceps", multiplier: "1" },
                { name: "Glúteo mayor", multiplier: "0.5" },
                { name: "Isquiotibiales", multiplier: "0" },
            ])
        ).toBe("Por serie: Cuádriceps 1 · Glúteo mayor 0,5 · Isquiotibiales 0");
    });

    it("no inventa una frase si no hay grupos", () => {
        expect(formatCatalogVolumePerSet([])).toBe("");
    });
});
