import { describe, expect, it } from "vitest";
import type { AthleteWeeklySummary } from "../../types/athleteWeeklySummary";
import {
    buildPostSessionCelebrationCopy,
    shouldFetchPostSessionAiInsight,
} from "./athletePostSessionAiInsight";

function baseWeekly(
    overrides: Partial<AthleteWeeklySummary> = {}
): AthleteWeeklySummary {
    return {
        client_id: 1,
        week_start: "2026-06-16",
        week_end: "2026-06-22",
        adherence: {
            sessions_planned: 3,
            sessions_completed: 2,
            adherence_rate: 0.67,
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
        training_streak: 2,
        highlights: [],
        ...overrides,
    };
}

describe("shouldFetchPostSessionAiInsight", () => {
    it("returns false for partial sessions", () => {
        expect(
            shouldFetchPostSessionAiInsight({
                report: { status: "completed", completion_percentage: 30 },
                weeklySummary: baseWeekly(),
            })
        ).toBe(false);
    });

    it("returns false for low completion even if status is not completed", () => {
        expect(
            shouldFetchPostSessionAiInsight({
                report: { status: "in_progress", completion_percentage: 0 },
                weeklySummary: baseWeekly({
                    adherence: {
                        sessions_planned: 1,
                        sessions_completed: 1,
                        adherence_rate: 1,
                        has_active_plan: true,
                        plan_name: "Hipertrofia",
                    },
                }),
            })
        ).toBe(false);
    });

    it("returns false mid-week without PR", () => {
        expect(
            shouldFetchPostSessionAiInsight({
                report: { status: "completed", completion_percentage: 95 },
                weeklySummary: baseWeekly(),
            })
        ).toBe(false);
    });

    it("returns true when week is closed", () => {
        expect(
            shouldFetchPostSessionAiInsight({
                report: { status: "completed", completion_percentage: 100 },
                weeklySummary: baseWeekly({
                    adherence: {
                        sessions_planned: 1,
                        sessions_completed: 1,
                        adherence_rate: 1,
                        has_active_plan: true,
                        plan_name: "Hipertrofia",
                    },
                }),
            })
        ).toBe(true);
    });

    it("returns true when weekly PR exists mid-week", () => {
        expect(
            shouldFetchPostSessionAiInsight({
                report: { status: "completed", completion_percentage: 90 },
                weeklySummary: baseWeekly({
                    personal_records: [
                        {
                            exercise_id: 10,
                            exercise_name: "Sentadilla",
                            max_weight: 100,
                            max_reps: 5,
                            tracking_date: "2026-06-17",
                            previous_max_weight: 95,
                        },
                    ],
                }),
            })
        ).toBe(true);
    });
});

describe("buildPostSessionCelebrationCopy", () => {
    it("builds week closed copy", () => {
        const copy = buildPostSessionCelebrationCopy(
            {
                status: "completed",
                completion_percentage: 100,
                session_name: "Pierna A",
            },
            baseWeekly({
                adherence: {
                    sessions_planned: 1,
                    sessions_completed: 1,
                    adherence_rate: 1,
                    has_active_plan: true,
                    plan_name: "Hipertrofia",
                },
            })
        );
        expect(copy.variant).toBe("week_closed");
        expect(copy.headline).toContain("Semana cerrada");
    });
});
