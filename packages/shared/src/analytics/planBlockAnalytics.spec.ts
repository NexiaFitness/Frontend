import { describe, expect, it } from "vitest";
import {
    computePlanBlockAnalytics,
    normalizeSessionLoadToTen,
    mondayOfWeekContaining,
    PLAN_ANALYTICS_DEVIATION_RATIO,
} from "./planBlockAnalytics";
import type { PlanPeriodBlock } from "../types/planningCargas";

describe("normalizeSessionLoadToTen", () => {
    it("returns null for null/undefined", () => {
        expect(normalizeSessionLoadToTen(null)).toBeNull();
        expect(normalizeSessionLoadToTen(undefined)).toBeNull();
    });

    it("maps 0–1 scale to 0–10", () => {
        expect(normalizeSessionLoadToTen(0.5)).toBe(5);
        expect(normalizeSessionLoadToTen(1)).toBe(10);
    });

    it("passes through >1 up to clamp 10", () => {
        expect(normalizeSessionLoadToTen(7)).toBe(7);
        expect(normalizeSessionLoadToTen(11)).toBe(10);
    });
});

describe("mondayOfWeekContaining", () => {
    it("returns Monday for a Wednesday in April 2026", () => {
        expect(mondayOfWeekContaining("2026-04-22")).toBe("2026-04-20");
    });
});

describe("computePlanBlockAnalytics", () => {
    const block: PlanPeriodBlock = {
        id: 1,
        training_plan_id: 1,
        name: "B1",
        goal: null,
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        volume_level: 5,
        intensity_level: 5,
        sort_order: 0,
        qualities: [],
        created_at: "",
        updated_at: "",
        is_active: true,
    };

    it("D1: completed session within 20% counts as aligned", () => {
        const sessions = [
            {
                id: 1,
                session_name: "S1",
                period_block_id: 1,
                session_date: "2026-04-10",
                is_generic_session: false,
                status: "completed",
                is_active: true,
                planned_volume: 5,
                planned_intensity: 5,
                actual_volume: 5,
                actual_intensity: 5,
            },
        ];
        const r = computePlanBlockAnalytics(
            [block],
            sessions,
            "2026-04-01",
            "2026-04-30",
            { deviationRatio: PLAN_ANALYTICS_DEVIATION_RATIO }
        );
        expect(r.d1CompletedEvaluableCount).toBe(1);
        expect(r.d1AlignedCompletedCount).toBe(1);
        expect(r.d1CoherenceGlobalPct).toBe(100);
    });

    it("D1: planned 0.5 on 0–1 scale maps to 5 and aligns with block 5", () => {
        const sessions = [
            {
                id: 2,
                period_block_id: 1,
                session_date: "2026-04-11",
                is_generic_session: false,
                status: "completed",
                is_active: true,
                planned_volume: 0.5,
                planned_intensity: 0.5,
                actual_volume: null,
                actual_intensity: null,
            },
        ];
        const r = computePlanBlockAnalytics([block], sessions, "2026-04-01", "2026-04-30");
        expect(r.d1CoherenceGlobalPct).toBe(100);
    });
});
