import { describe, expect, it } from "vitest";
import type { AthleteWeeklySummary } from "../../types/athleteWeeklySummary";
import { buildWeeklyInsightCopy } from "./athleteWeeklyCopy";

function summary(
    planned: number,
    completed: number,
    extra = 0
): AthleteWeeklySummary {
    return {
        client_id: 391,
        week_start: "2026-11-09",
        week_end: "2026-11-15",
        structure_coverage: null,
        adherence: {
            sessions_planned: planned,
            sessions_completed: completed,
            sessions_extra_completed: extra,
            adherence_rate: planned > 0 ? completed / planned : 0,
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
        training_streak: completed,
        highlights: [],
    };
}

describe("buildWeeklyInsightCopy (B-08)", () => {
    it("does not claim the week is closed when planned is 1 and completed is 0", () => {
        const copy = buildWeeklyInsightCopy({
            summary: summary(1, 0),
            mode: "train_today_done",
        });
        expect(copy.headline).toBe("Te queda 1 sesión esta semana.");
        expect(copy.headline).not.toContain("Semana del plan cerrada");
    });

    it("says the week is closed only when the only planned session is completed", () => {
        const copy = buildWeeklyInsightCopy({
            summary: summary(1, 1),
            mode: "train_today_done",
        });
        expect(copy.headline).toBe("Semana del plan cerrada. Buen trabajo.");
    });

    it("after one of three sessions, still shows remaining work", () => {
        const copy = buildWeeklyInsightCopy({
            summary: summary(3, 1),
            mode: "train_today_done",
        });
        expect(copy.headline).toBe("Te quedan 2 sesiones esta semana.");
    });
});
