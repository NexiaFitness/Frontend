import { describe, expect, it } from "vitest";

import { getTrainingBlockDisplayName } from "../trainingBlockDisplay";

describe("getTrainingBlockDisplayName", () => {
    it("usa name canónico para cualidad con slug", () => {
        expect(
            getTrainingBlockDisplayName({
                name: "Potencia",
                physical_quality_slug: "potencia",
                block_role: null,
            }),
        ).toBe("Potencia");
    });

    it("traduce rol warmup", () => {
        expect(
            getTrainingBlockDisplayName({
                name: "Calentamiento",
                physical_quality_slug: null,
                block_role: "warmup",
            }),
        ).toBe("Calentamiento");
    });
});
