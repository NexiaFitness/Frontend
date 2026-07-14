import { describe, expect, it } from "vitest";

import {
    MAX_PERIOD_BLOCK_QUALITIES,
    validateCanAddQuality,
    validateQualitiesStepAdvance,
} from "../periodBlockQualitiesValidation";

describe("validateCanAddQuality", () => {
    it("permite añadir si hay menos del máximo", () => {
        expect(validateCanAddQuality(MAX_PERIOD_BLOCK_QUALITIES - 1).ok).toBe(
            true,
        );
    });

    it("bloquea al llegar al máximo", () => {
        const r = validateCanAddQuality(MAX_PERIOD_BLOCK_QUALITIES);
        expect(r.ok).toBe(false);
        expect(r.message).toMatch(/hasta 4 cualidades/i);
    });
});

describe("validateQualitiesStepAdvance", () => {
    it("rechaza más del máximo de cualidades", () => {
        const r = validateQualitiesStepAdvance({
            qualitiesCount: MAX_PERIOD_BLOCK_QUALITIES + 1,
            qualitiesSum: 100,
        });
        expect(r.ok).toBe(false);
        expect(r.message).toMatch(/no puede tener más de 4/i);
    });
    it("rechaza sin cualidades", () => {
        const r = validateQualitiesStepAdvance({
            qualitiesCount: 0,
            qualitiesSum: 0,
        });
        expect(r.ok).toBe(false);
        expect(r.message).toMatch(/al menos una cualidad/i);
    });

    it("rechaza suma mayor que 100", () => {
        const r = validateQualitiesStepAdvance({
            qualitiesCount: 2,
            qualitiesSum: 110,
        });
        expect(r.ok).toBe(false);
        expect(r.message).toMatch(/no puede superar el 100/i);
    });

    it("rechaza suma menor que 100", () => {
        const r = validateQualitiesStepAdvance({
            qualitiesCount: 1,
            qualitiesSum: 50,
        });
        expect(r.ok).toBe(false);
        expect(r.message).toMatch(/exactamente 100/i);
    });

    it("acepta suma 100 sin conflictos", () => {
        const r = validateQualitiesStepAdvance({
            qualitiesCount: 2,
            qualitiesSum: 100,
        });
        expect(r.ok).toBe(true);
    });
});
