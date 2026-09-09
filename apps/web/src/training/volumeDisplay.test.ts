/**
 * volumeDisplay.test.ts — Tests de formato volumen fraccional (D-F44-04b).
 *
 * Contexto:
 * - Vitest para normalizeHalfSetVolume / formatHalfSetVolume (shared).
 *
 * Notas de mantenimiento:
 * - Mantener alineado con backend/tests de medias unidades y OpenAPI number.
 *
 * @author Frontend Team — NEXIA
 * @since D-F44-04b (2026-09-08)
 */

import { describe, expect, it } from "vitest";
import { formatHalfSetVolume, normalizeHalfSetVolume } from "@nexia/shared/training/volumeDisplay";

describe("formatHalfSetVolume", () => {
    it("shows integer without decimal", () => {
        expect(formatHalfSetVolume(7)).toBe("7");
        expect(formatHalfSetVolume(0)).toBe("0");
    });

    it("shows half unit with comma", () => {
        expect(formatHalfSetVolume(7.5)).toBe("7,5");
        expect(formatHalfSetVolume(0.5)).toBe("0,5");
    });

    it("normalizes float drift from JSON", () => {
        expect(formatHalfSetVolume(7.499999999)).toBe("7,5");
        expect(normalizeHalfSetVolume(1.5000000001)).toBe(1.5);
    });
});
