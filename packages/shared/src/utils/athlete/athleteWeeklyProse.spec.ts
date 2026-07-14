import { describe, expect, it } from "vitest";
import type { AthleteWeeklySummary } from "../../types/athleteWeeklySummary";
import {
    buildDeterministicWeeklyProse,
    isLowVolumeWeek,
} from "./athleteWeeklyProse";

function baseWeekly(
    overrides: Partial<AthleteWeeklySummary> = {}
): AthleteWeeklySummary {
    return {
        client_id: 1,
        week_start: "2026-06-16",
        week_end: "2026-06-22",
        adherence: {
            sessions_planned: 1,
            sessions_completed: 1,
            adherence_rate: 100,
            has_active_plan: true,
            plan_name: "Hipertrofia",
        },
        personal_records: [],
        feedback: {
            feedback_count: 0,
            latest_session_id: null,
            latest_session_name: null,
            latest_feedback_date: null,
            perceived_effort: null,
            has_trainer_response: false,
            trainer_response_at: null,
        },
        training_streak: 1,
        highlights: [],
        ...overrides,
    };
}

describe("athleteWeeklyProse", () => {
    it("isLowVolumeWeek flags 1 and 2 planned sessions", () => {
        expect(isLowVolumeWeek(1)).toBe(true);
        expect(isLowVolumeWeek(2)).toBe(true);
        expect(isLowVolumeWeek(3)).toBe(false);
    });

    it("buildDeterministicWeeklyProse uses singular for one session", () => {
        const text = buildDeterministicWeeklyProse(baseWeekly());
        expect(text).toContain("una sesión");
        expect(text).toContain("la completaste");
        expect(text).not.toContain("las completaste");
    });
});
