import { describe, expect, it } from "vitest";
import { getDeleteTrainingSessionInvalidationTags } from "./trainingSessionsApi";

describe("getDeleteTrainingSessionInvalidationTags", () => {
    it("includes SESSIONS-{clientId} for unified client session lists", () => {
        const tags = getDeleteTrainingSessionInvalidationTags({
            id: 4403,
            trainingPlanId: 528,
            clientId: 345,
            trainerId: 12,
        });

        expect(tags).toEqual(
            expect.arrayContaining([
                { type: "TrainingSession", id: 4403 },
                { type: "Client", id: "SESSIONS-345" },
                { type: "TrainingSession", id: "CLIENT_345" },
            ]),
        );
    });
});
