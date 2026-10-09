import { describe, expect, it } from "vitest";
import {
    formatAthletePreviewGroupKindLabel,
    isStrengthPrescriptionMapKind,
    strengthPrescriptionToggleLabels,
} from "./athleteStrengthPrescriptionPresentation";

describe("athleteStrengthPrescriptionPresentation", () => {
    it("marks strength map kinds", () => {
        expect(isStrengthPrescriptionMapKind("single_set")).toBe(true);
        expect(isStrengthPrescriptionMapKind("emom")).toBe(false);
    });

    it("formats group kind labels", () => {
        expect(formatAthletePreviewGroupKindLabel("single_set", null)).toBe("Single set");
        expect(formatAthletePreviewGroupKindLabel("dropset", 2)).toBe("Drop set — 2 rondas");
    });

    it("uses dropset toggle copy", () => {
        expect(strengthPrescriptionToggleLabels("dropset").show).toBe("Ver escalones");
    });
});
