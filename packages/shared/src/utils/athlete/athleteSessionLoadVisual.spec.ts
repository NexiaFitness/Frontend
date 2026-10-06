import { describe, expect, it } from "vitest";
import {
    aggregateDayLoadFromSessions,
    buildSessionLoadVisualModel,
    loadTierFrom1to10,
} from "./athleteSessionLoadVisual";

describe("loadTierFrom1to10", () => {
    it("mapea umbrales 1-3 / 4-7 / 8-10", () => {
        expect(loadTierFrom1to10(2)).toBe("low");
        expect(loadTierFrom1to10(5)).toBe("medium");
        expect(loadTierFrom1to10(9)).toBe("high");
    });
});

describe("buildSessionLoadVisualModel", () => {
    it("genera aria-label accesible", () => {
        const m = buildSessionLoadVisualModel({ plannedVolume: 8, plannedIntensity: 3 });
        expect(m.ariaLabel).toContain("alta");
        expect(m.ariaLabel).toContain("baja");
    });
});

describe("aggregateDayLoadFromSessions", () => {
    it("promedia varias sesiones del día", () => {
        const m = aggregateDayLoadFromSessions([
            { planned_volume: 4, planned_intensity: 4 },
            { planned_volume: 6, planned_intensity: 6 },
        ]);
        expect(m.sessionCount).toBe(2);
        expect(m.volumeTier).toBe("medium");
    });
});
