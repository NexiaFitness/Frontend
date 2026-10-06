import { describe, expect, it } from "vitest";
import {
    getDeleteTrainingSessionInvalidationTags,
} from "./trainingSessionsApi";
import { getSubmitWellbeingInvalidationTags } from "./wellbeingCheckInApi";

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

describe("getSubmitWellbeingInvalidationTags I22", () => {
    it("invalida el tag WELLBEING_ además del id numérico", () => {
        expect(getSubmitWellbeingInvalidationTags(42)).toEqual([
            { type: "TrainingSession", id: 42 },
            { type: "TrainingSession", id: "WELLBEING_42" },
        ]);
    });
});
