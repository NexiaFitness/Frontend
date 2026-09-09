/**
 * planningHubUrl.test.ts — Helpers URL shell F5.
 */

import { describe, expect, it } from "vitest";
import {
    PLANNING_MODE_CREATE_BLOCK,
    PLANNING_VIEW_ANALYTICS,
    applyPlanningModeCreateBlock,
    applyPlanningViewAnalytics,
    clearPlanningMode,
    clearPlanningView,
    isPlanningAnalyticsView,
    isPlanningCreateWhenMode,
    resetPlanningSubJourneyParams,
} from "@/utils/planningHubUrl";

describe("planningHubUrl", () => {
    it("detecta createWhen y analytics", () => {
        expect(
            isPlanningCreateWhenMode(
                new URLSearchParams({ planningMode: PLANNING_MODE_CREATE_BLOCK }),
            ),
        ).toBe(true);
        expect(
            isPlanningAnalyticsView(
                new URLSearchParams({ planningView: PLANNING_VIEW_ANALYTICS }),
            ),
        ).toBe(true);
    });

    it("aplica modos mutuamente excluyentes", () => {
        const base = new URLSearchParams({
            tab: "planning",
            planningView: PLANNING_VIEW_ANALYTICS,
        });
        const createWhen = applyPlanningModeCreateBlock(base);
        expect(createWhen.get("planningMode")).toBe(PLANNING_MODE_CREATE_BLOCK);
        expect(createWhen.has("planningView")).toBe(false);

        const analytics = applyPlanningViewAnalytics(
            new URLSearchParams({ planningMode: PLANNING_MODE_CREATE_BLOCK }),
        );
        expect(analytics.get("planningView")).toBe(PLANNING_VIEW_ANALYTICS);
        expect(analytics.has("planningMode")).toBe(false);
    });

    it("resetPlanningSubJourneyParams limpia modos F5", () => {
        const prev = new URLSearchParams({
            tab: "planning",
            qp: "1",
            blockAuthor: "create",
            blockWeeks: "5",
            planningMode: PLANNING_MODE_CREATE_BLOCK,
            planningView: PLANNING_VIEW_ANALYTICS,
        });
        const next = resetPlanningSubJourneyParams(prev);
        expect(next.get("tab")).toBe("planning");
        expect(next.has("qp")).toBe(false);
        expect(next.has("blockAuthor")).toBe(false);
        expect(next.has("blockWeeks")).toBe(false);
        expect(next.has("planningMode")).toBe(false);
        expect(next.has("planningView")).toBe(false);
    });

    it("clearPlanningMode y clearPlanningView", () => {
        expect(
            clearPlanningMode(
                new URLSearchParams({ planningMode: PLANNING_MODE_CREATE_BLOCK }),
            ).has("planningMode"),
        ).toBe(false);
        expect(
            clearPlanningView(
                new URLSearchParams({ planningView: PLANNING_VIEW_ANALYTICS }),
            ).has("planningView"),
        ).toBe(false);
    });
});
