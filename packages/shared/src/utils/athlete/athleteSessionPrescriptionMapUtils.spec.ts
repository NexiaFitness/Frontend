import { describe, expect, it } from "vitest";
import {
    normalizeAthleteSessionLabelForCompare,
    shouldShowPrescriptionBlockTitle,
} from "./athleteSessionPrescriptionMapUtils";

describe("shouldShowPrescriptionBlockTitle", () => {
    it("hides single block title when it matches header headline", () => {
        expect(
            shouldShowPrescriptionBlockTitle("Fuerza máxima", "Fuerza maxima", 1)
        ).toBe(false);
    });

    it("shows block title for multi-block sessions", () => {
        expect(shouldShowPrescriptionBlockTitle("Fuerza máxima", "Fuerza máxima", 2)).toBe(true);
    });

    it("shows block title when header has no quality", () => {
        expect(shouldShowPrescriptionBlockTitle("Calentamiento", null, 1)).toBe(true);
    });
});

describe("normalizeAthleteSessionLabelForCompare", () => {
    it("ignores case and accents", () => {
        expect(normalizeAthleteSessionLabelForCompare("Fuerza Máxima")).toBe(
            normalizeAthleteSessionLabelForCompare("fuerza maxima")
        );
    });
});
