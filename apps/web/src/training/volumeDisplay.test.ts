/**
 * volumeDisplay.test.ts — Tests de formato volumen fraccional (D-F44-04b; cuartos desde H4).
 *
 * Contexto:
 * - Vitest para normalizeSetVolume / formatSetVolume (shared).
 *
 * Notas de mantenimiento:
 * - Mantener alineado con backend/tests de medias unidades y OpenAPI number.
 *
 * @author Frontend Team — NEXIA
 * @since D-F44-04b (2026-09-08)
 */

import { describe, expect, it } from "vitest";
import { formatSetVolume, normalizeSetVolume } from "@nexia/shared/training/volumeDisplay";

describe("formatSetVolume", () => {
    it("shows integer without decimal", () => {
        expect(formatSetVolume(7)).toBe("7");
        expect(formatSetVolume(0)).toBe("0");
    });

    it("shows half unit with comma", () => {
        expect(formatSetVolume(7.5)).toBe("7,5");
        expect(formatSetVolume(0.5)).toBe("0,5");
    });

    it("shows quarter units (plyometric synergist) with comma", () => {
        expect(formatSetVolume(0.75)).toBe("0,75");
        expect(formatSetVolume(2.25)).toBe("2,25");
        expect(normalizeSetVolume(0.7500000001)).toBe(0.75);
    });

    it("normalizes float drift from JSON", () => {
        expect(formatSetVolume(7.499999999)).toBe("7,5");
        expect(normalizeSetVolume(1.5000000001)).toBe(1.5);
    });
});
