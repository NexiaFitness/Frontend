/**
 * athleteProgressPeriod.spec.ts — Ventanas 30/90/todo y periodo anterior.
 * @author Frontend Team
 * @since v1.0.3
 */

import { describe, expect, it } from "vitest";
import {
    addLocalDateDays,
    athleteProgressPeriodRange,
    athleteProgressPreviousPeriodRange,
    iterateMondaysInclusive,
    parseAthleteProgressPeriod,
} from "./athleteProgressPeriod";

describe("parseAthleteProgressPeriod", () => {
    it("defaults to 30d", () => {
        expect(parseAthleteProgressPeriod(null)).toBe("30d");
        expect(parseAthleteProgressPeriod("nope")).toBe("30d");
    });

    it("accepts 90d and all", () => {
        expect(parseAthleteProgressPeriod("90d")).toBe("90d");
        expect(parseAthleteProgressPeriod("all")).toBe("all");
    });
});

describe("athleteProgressPeriodRange", () => {
    it("30d is inclusive of today", () => {
        const range = athleteProgressPeriodRange("30d", "2026-10-08", null);
        expect(range.end).toBe("2026-10-08");
        expect(range.start).toBe("2026-09-09");
        expect(addLocalDateDays(range.start, 29)).toBe(range.end);
    });

    it("all uses history start when present", () => {
        const range = athleteProgressPeriodRange("all", "2026-10-08", "2025-01-15");
        expect(range).toEqual({ start: "2025-01-15", end: "2026-10-08" });
    });

    it("90d is inclusive of today", () => {
        const range = athleteProgressPeriodRange("90d", "2026-10-08", null);
        expect(range).toEqual({ start: "2026-07-11", end: "2026-10-08" });
    });
});

describe("athleteProgressPreviousPeriodRange", () => {
    it("returns null for all", () => {
        expect(
            athleteProgressPreviousPeriodRange("all", {
                start: "2025-01-01",
                end: "2026-10-08",
            })
        ).toBeNull();
    });

    it("places the previous 30d immediately before", () => {
        const current = athleteProgressPeriodRange("30d", "2026-10-08", null);
        const previous = athleteProgressPreviousPeriodRange("30d", current);
        expect(previous).toEqual({ start: "2026-08-10", end: "2026-09-08" });
    });
});

describe("iterateMondaysInclusive", () => {
    it("crosses year boundary without colliding", () => {
        const mondays = iterateMondaysInclusive("2025-12-29", "2026-01-12");
        expect(mondays[0]).toBe("2025-12-29");
        expect(mondays).toContain("2026-01-05");
        expect(mondays[mondays.length - 1]).toBe("2026-01-12");
    });
});
