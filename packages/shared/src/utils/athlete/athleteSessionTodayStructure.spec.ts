import { describe, expect, it } from "vitest";
import { formatSessionTodayStructureLine } from "./athleteSessionTodayStructure";

describe("formatSessionTodayStructureLine", () => {
    it("combines blocks and duration from summary", () => {
        expect(
            formatSessionTodayStructureLine(
                {
                    blocks: 3,
                    estimated_duration: 45,
                    total_sets: 12,
                    planned_intensity: null,
                    planned_volume: null,
                    actual_intensity: null,
                    actual_volume: null,
                },
                null
            )
        ).toBe("3 bloques · 45 min estimados");
    });

    it("falls back to planned duration on session", () => {
        expect(formatSessionTodayStructureLine(undefined, 30)).toBe("30 min estimados");
    });
});
