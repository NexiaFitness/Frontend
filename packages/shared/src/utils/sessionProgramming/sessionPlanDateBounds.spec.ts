import { describe, expect, it } from "vitest";
import {
    clampSessionDateToPlan,
    pickDefaultTrainingPlanId,
    resolveSessionDateBoundsForPlan,
    suggestDefaultSessionDateForPlan,
    validateSessionDateWithinPlan,
} from "./sessionPlanDateBounds";

const plan514 = {
    start_date: "2026-06-01",
    end_date: "2026-07-31",
};

describe("resolveSessionDateBoundsForPlan", () => {
    it("returns plan start and end as min/max", () => {
        expect(resolveSessionDateBoundsForPlan(plan514)).toEqual({
            min: "2026-06-01",
            max: "2026-07-31",
        });
    });

    it("returns undefined bounds when plan is missing", () => {
        expect(resolveSessionDateBoundsForPlan(null)).toEqual({
            min: undefined,
            max: undefined,
        });
    });
});

describe("clampSessionDateToPlan", () => {
    it("allows past dates within plan vigencia", () => {
        expect(clampSessionDateToPlan("2026-06-26", plan514)).toBe("2026-06-26");
    });

    it("clamps below start to plan start", () => {
        expect(clampSessionDateToPlan("2026-05-01", plan514)).toBe("2026-06-01");
    });

    it("clamps above end to plan end", () => {
        expect(clampSessionDateToPlan("2026-08-01", plan514)).toBe("2026-07-31");
    });
});

describe("validateSessionDateWithinPlan", () => {
    it("accepts date inside plan window", () => {
        expect(validateSessionDateWithinPlan("2026-06-26", plan514)).toBeNull();
    });

    it("rejects date outside plan window", () => {
        expect(validateSessionDateWithinPlan("2026-05-15", plan514)).toMatch(
            /entre 2026-06-01 y 2026-07-31/
        );
    });

    it("requires non-empty date", () => {
        expect(validateSessionDateWithinPlan("", plan514)).toBe("La fecha es obligatoria");
    });
});

describe("suggestDefaultSessionDateForPlan", () => {
    it("returns today when inside plan vigencia", () => {
        expect(
            suggestDefaultSessionDateForPlan(plan514, "2026-07-08")
        ).toBe("2026-07-08");
    });

    it("returns plan start when today is before vigencia", () => {
        expect(
            suggestDefaultSessionDateForPlan(plan514, "2026-05-01")
        ).toBe("2026-06-01");
    });

    it("returns plan end when today is after vigencia", () => {
        expect(
            suggestDefaultSessionDateForPlan(plan514, "2026-08-15")
        ).toBe("2026-07-31");
    });
});

describe("pickDefaultTrainingPlanId", () => {
    const plans = [
        {
            id: 514,
            status: "active",
            start_date: "2026-06-01",
            end_date: "2026-07-31",
        },
        {
            id: 303,
            status: "active",
            start_date: "2026-01-01",
            end_date: "2026-03-31",
        },
    ];

    it("picks active plan covering reference date", () => {
        expect(pickDefaultTrainingPlanId(plans, "2026-06-26")).toBe(514);
    });

    it("returns null when multiple active plans and none covers today", () => {
        expect(pickDefaultTrainingPlanId(plans, "2026-04-01")).toBeNull();
    });

    it("returns sole active plan even if reference date is outside", () => {
        expect(
            pickDefaultTrainingPlanId(
                [{ id: 99, status: "active", start_date: "2026-01-01", end_date: "2026-03-31" }],
                "2026-07-08"
            )
        ).toBe(99);
    });
});
