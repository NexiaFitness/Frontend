import { describe, expect, it } from "vitest";
import { hasUsefulAthleteLastPerformanceContext } from "./athleteLastPerformanceContext";
import type { AthleteLastPerformance } from "../../types/athleteLastPerformance";

const base: AthleteLastPerformance = {
    exercise_id: 1,
    client_id: 2,
    applies_one_rm: true,
    one_rm_kg: null,
    one_rm_kind: null,
    performed_at: null,
    weight_kg: null,
    reps: null,
    rpe: null,
    source: null,
};

describe("hasUsefulAthleteLastPerformanceContext", () => {
    it("returns false when 1RM does not apply", () => {
        expect(
            hasUsefulAthleteLastPerformanceContext({ ...base, applies_one_rm: false })
        ).toBe(false);
    });

    it("returns false when no 1RM and no last mark", () => {
        expect(hasUsefulAthleteLastPerformanceContext(base)).toBe(false);
    });

    it("returns true when one_rm_kg is set", () => {
        expect(
            hasUsefulAthleteLastPerformanceContext({ ...base, one_rm_kg: 80, one_rm_kind: "recorded" })
        ).toBe(true);
    });

    it("returns true when last mark exists", () => {
        expect(
            hasUsefulAthleteLastPerformanceContext({ ...base, weight_kg: 60, reps: 8 })
        ).toBe(true);
    });
});
