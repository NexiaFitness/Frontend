/**
 * athleteProgressLoadDelta.spec.ts — B-35 predicado de carga comparable.
 */

import { describe, expect, it } from "vitest";
import {
    isBodyweightLoadType,
    periodLoadDelta,
} from "./athleteProgressLoadDelta";

describe("isBodyweightLoadType", () => {
    it("matches catalog bodyweight and ignores blanks", () => {
        expect(isBodyweightLoadType("bodyweight")).toBe(true);
        expect(isBodyweightLoadType(" BODYWEIGHT ")).toBe(true);
        expect(isBodyweightLoadType("external")).toBe(false);
        expect(isBodyweightLoadType("mixed")).toBe(false);
        expect(isBodyweightLoadType(null)).toBe(false);
        expect(isBodyweightLoadType(undefined)).toBe(false);
    });
});

describe("periodLoadDelta", () => {
    it("keeps first vs last of the period for a comparable deload", () => {
        expect(periodLoadDelta(80, 70)).toBe(-10);
        expect(periodLoadDelta(40, 50)).toBe(10);
    });

    it("does not treat a crash below half the first load as a delta (B-35)", () => {
        expect(periodLoadDelta(77.5, 12.5)).toBeNull();
    });

    it("returns null without two positive loads", () => {
        expect(periodLoadDelta(null, 12.5)).toBeNull();
        expect(periodLoadDelta(20, 0)).toBeNull();
    });
});
