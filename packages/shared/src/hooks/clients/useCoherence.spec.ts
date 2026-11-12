import { describe, expect, it } from "vitest";
import type { DailyCoherenceAnalyticsOut } from "../../types/coherence";
import { transformCoherenceAnalytics } from "./useCoherence";

const weekResponse = (
    points: DailyCoherenceAnalyticsOut["monotony_strain_data"]
): DailyCoherenceAnalyticsOut => ({
    client_id: 391,
    period_start: "2026-11-09",
    period_end: "2026-11-15",
    period_type: "week",
    kpis: { adherence_percentage: 50, average_srpe: 7, monotony: null, strain: null },
    adherence_data: [],
    srpe_scatter_data: [],
    monotony_strain_data: points,
    interpretive_summary: "",
    key_recommendations: [],
});

describe("transformCoherenceAnalytics (B-07)", () => {
    it("does not pad monotony with zeros when the week has no monotony value", () => {
        const data = transformCoherenceAnalytics(
            weekResponse([
                {
                    period_start: "2026-11-12",
                    period_label: "2026-11-12",
                    monotony: null,
                    strain: null,
                    period_load: 735,
                    cumulative_strain: null,
                },
            ])
        );
        expect(data.monotony).toBeNull();
        expect(data.monotony_by_week).toEqual([]);
        expect(data.strain_by_week).toHaveLength(7);
        expect(data.strain_by_week.find((d) => d.load === 735)?.strain).toBeNull();
    });
});
