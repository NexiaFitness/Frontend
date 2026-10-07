import { describe, expect, it } from "vitest";
import {
    athletePlannedLoadAriaLabel,
    formatAgendaMuscleGroupsLine,
    normalizePlannedLoad1to10,
} from "./athleteSessionPlannedLoad";

describe("athleteSessionPlannedLoad", () => {
    it("normalizes planned load 1–10", () => {
        expect(normalizePlannedLoad1to10(0)).toBeNull();
        expect(normalizePlannedLoad1to10(1)).toBe(1);
        expect(normalizePlannedLoad1to10(4.4)).toBe(4);
        expect(normalizePlannedLoad1to10(10)).toBe(10);
        expect(normalizePlannedLoad1to10(12)).toBe(10);
    });

    it("formats muscle groups with +N when compact", () => {
        expect(
            formatAgendaMuscleGroupsLine(["Pecho", "Tríceps", "Hombro", "Core"])
        ).toBe("Pecho · Tríceps · Hombro · +1");
    });

    it("lists all muscle groups when maxVisible is unlimited", () => {
        expect(
            formatAgendaMuscleGroupsLine(
                ["Pecho", "Tríceps", "Hombro", "Core"],
                Number.POSITIVE_INFINITY
            )
        ).toBe("Pecho · Tríceps · Hombro · Core");
    });

    it("builds aria label for volume and intensity", () => {
        expect(
            athletePlannedLoadAriaLabel({ plannedVolume: 3, plannedIntensity: 5 })
        ).toBe("Volumen 3 de 10, intensidad 5 de 10");
    });
});
