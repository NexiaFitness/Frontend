import { describe, expect, it } from "vitest";
import { resolveProgramPlanActivationForDate } from "./resolveProgramPlanActivationForDate";

describe("resolveProgramPlanActivationForDate", () => {
    it("ok when requested matches active", () => {
        expect(
            resolveProgramPlanActivationForDate({
                isLoading: false,
                requestedPlanId: 590,
                activePlanId: 590,
            }),
        ).toBe("ok");
    });

    it("plan_not_active when ids differ", () => {
        expect(
            resolveProgramPlanActivationForDate({
                isLoading: false,
                requestedPlanId: 590,
                activePlanId: 591,
            }),
        ).toBe("plan_not_active");
    });

    it("no_active_plan when active missing", () => {
        expect(
            resolveProgramPlanActivationForDate({
                isLoading: false,
                requestedPlanId: 590,
                activePlanId: null,
            }),
        ).toBe("no_active_plan");
    });
});
