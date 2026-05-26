/**
 * amrapPlannedReps.spec.ts
 */

import { describe, expect, it } from "vitest";
import {
    displayAmrapPlannedReps,
    hydrateAmrapPlannedReps,
    isAmrapLegacyPlannedRepsSentinel,
    amrapFooterHint,
} from "./amrapPlannedReps";

describe("amrapPlannedReps", () => {
    it("detecta marcador legacy", () => {
        expect(isAmrapLegacyPlannedRepsSentinel("AMRAP")).toBe(true);
        expect(isAmrapLegacyPlannedRepsSentinel("amrap")).toBe(true);
        expect(isAmrapLegacyPlannedRepsSentinel("10")).toBe(false);
    });

    it("no muestra AMRAP en vista read-only", () => {
        expect(displayAmrapPlannedReps("AMRAP")).toBeNull();
        expect(displayAmrapPlannedReps("12")).toBe("12");
    });

    it("hidrata constructor con reps editables", () => {
        expect(hydrateAmrapPlannedReps("AMRAP")).toBe("8");
        expect(hydrateAmrapPlannedReps("15")).toBe("15");
    });

    it("genera pie con minutos del time cap", () => {
        expect(amrapFooterHint(10)).toBe(
            "Completa el máximo de rondas posibles en 10 minutos."
        );
        expect(amrapFooterHint(null)).toBe("Completa el máximo de rondas posibles.");
    });
});
