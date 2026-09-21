import { describe, expect, it } from "vitest";

import {
    buildStandaloneFeedbackMetrics,
    formatStandaloneFeedbackDate,
} from "../standaloneSessionFeedbackPresentation";

describe("standaloneSessionFeedbackPresentation", () => {
    it("formatStandaloneFeedbackDate returns em dash for invalid input", () => {
        expect(formatStandaloneFeedbackDate(null)).toBe("—");
        expect(formatStandaloneFeedbackDate("not-a-date")).toBe("—");
    });

    it("buildStandaloneFeedbackMetrics collects scale fields only", () => {
        const metrics = buildStandaloneFeedbackMetrics({
            id: 1,
            standalone_session_id: 2,
            client_id: 3,
            perceived_effort: 8,
            fatigue_level: null,
            sleep_quality: 7,
            stress_level: 4,
            motivation_level: 9,
            energy_level: 6,
            muscle_soreness: null,
            pain_or_discomfort: null,
            notes: null,
            feedback_date: "2026-09-01T10:00:00Z",
            created_at: "2026-09-01T10:00:00Z",
            updated_at: "2026-09-01T10:00:00Z",
            is_active: true,
        });
        expect(metrics.map((m) => m.id)).toEqual([
            "perceived_effort",
            "sleep_quality",
            "stress_level",
            "motivation_level",
            "energy_level",
        ]);
    });
});
