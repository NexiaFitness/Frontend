import { describe, expect, it } from "vitest";
import {
    clampVolumeIntensitySlider,
    getVolumeIntensityPrefillSourceLabel,
    onboardingLevelToSlider,
    resolveSessionVolumeIntensityPrefill,
} from "./sessionVolumeIntensityPrefill";

describe("sessionVolumeIntensityPrefill", () => {
    it("prioriza bloque sobre perfil", () => {
        const result = resolveSessionVolumeIntensityPrefill({
            blockVolume: 8,
            blockIntensity: 7,
            onboardingVolumeLevel: "medium",
            onboardingIntensityLevel: "medium",
        });
        expect(result).toEqual({
            volume: 8,
            intensity: 7,
            source: "block",
            blockReference: { volume: 8, intensity: 7 },
        });
    });

    it("usa perfil cuando no hay bloque", () => {
        const result = resolveSessionVolumeIntensityPrefill({
            blockVolume: null,
            blockIntensity: null,
            onboardingVolumeLevel: "low",
            onboardingIntensityLevel: "high",
        });
        expect(result).toEqual({
            volume: 3,
            intensity: 8,
            source: "profile",
            blockReference: null,
        });
    });

    it("usa default 5/5 sin bloque ni perfil", () => {
        const result = resolveSessionVolumeIntensityPrefill({
            blockVolume: null,
            blockIntensity: null,
            onboardingVolumeLevel: null,
            onboardingIntensityLevel: null,
        });
        expect(result.source).toBe("default");
        expect(result.volume).toBe(5);
        expect(result.intensity).toBe(5);
    });

    it("onboardingLevelToSlider mapea low/medium/high", () => {
        expect(onboardingLevelToSlider("medium")).toBe(6);
        expect(onboardingLevelToSlider("High")).toBe(8);
        expect(onboardingLevelToSlider("unknown")).toBeNull();
    });

    it("clampVolumeIntensitySlider acota 1–10", () => {
        expect(clampVolumeIntensitySlider(0)).toBe(1);
        expect(clampVolumeIntensitySlider(11.7)).toBe(10);
    });

    it("getVolumeIntensityPrefillSourceLabel", () => {
        expect(getVolumeIntensityPrefillSourceLabel("block")).toBe("Del bloque");
        expect(getVolumeIntensityPrefillSourceLabel("profile")).toBe("Del perfil");
        expect(getVolumeIntensityPrefillSourceLabel("default")).toBeUndefined();
    });
});
