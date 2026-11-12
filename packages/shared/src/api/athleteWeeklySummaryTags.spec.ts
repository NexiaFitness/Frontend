import { describe, expect, it } from "vitest";
import {
    ATHLETE_WEEKLY_SUMMARY_TAG,
    getUpdateTrainingSessionInvalidationTags,
} from "./athleteWeeklySummaryTags";

describe("getUpdateTrainingSessionInvalidationTags (B-08)", () => {
    it("invalidates the athlete weekly summary after closing a session", () => {
        const tags = getUpdateTrainingSessionInvalidationTags(5008, {
            training_plan_id: 653,
        });
        expect(tags).toContainEqual(ATHLETE_WEEKLY_SUMMARY_TAG);
        expect(tags).toContainEqual({ type: "TrainingSession", id: 5008 });
        expect(tags).toContainEqual({ type: "TrainingSession", id: "PLAN_653" });
        expect(tags).toContainEqual({ type: "TrainingPlan", id: 653 });
    });

    it("still invalidates weekly summary when the session has no plan", () => {
        const tags = getUpdateTrainingSessionInvalidationTags(12, {
            training_plan_id: null,
        });
        expect(tags).toEqual([
            { type: "TrainingSession", id: 12 },
            ATHLETE_WEEKLY_SUMMARY_TAG,
        ]);
    });
});
