import { describe, expect, it } from "vitest";
import { resolveDashboardMode } from "./athleteDashboardMode";
import type { TrainingSession } from "../../types/trainingSessions";

const baseSession = (overrides: Partial<TrainingSession>): TrainingSession =>
    ({
        id: 1,
        session_name: "Test",
        session_type: "strength",
        session_date: "2026-10-02",
        status: "planned",
        training_plan_id: null,
        client_id: 1,
        trainer_id: 1,
        is_active: true,
        created_at: "",
        updated_at: "",
        ...overrides,
    }) as TrainingSession;

describe("resolveDashboardMode D10", () => {
    it("sin plan pero sesión hoy → train_today", () => {
        expect(
            resolveDashboardMode({
                hasActivePlan: false,
                todaySession: baseSession({ status: "planned" }),
            })
        ).toBe("train_today");
    });

    it("sin plan ni sesiones → no_plan", () => {
        expect(
            resolveDashboardMode({
                hasActivePlan: false,
            })
        ).toBe("no_plan");
    });
});
