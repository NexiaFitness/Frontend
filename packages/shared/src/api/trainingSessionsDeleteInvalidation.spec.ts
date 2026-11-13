import { describe, expect, it } from "vitest";
import { getSubmitWellbeingInvalidationTags } from "./wellbeingCheckInApi";

describe("getSubmitWellbeingInvalidationTags I22", () => {
    it("invalida el tag WELLBEING_ además del id numérico", () => {
        expect(getSubmitWellbeingInvalidationTags(42)).toEqual([
            { type: "TrainingSession", id: 42 },
            { type: "TrainingSession", id: "WELLBEING_42" },
        ]);
    });
});
