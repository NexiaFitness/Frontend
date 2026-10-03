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

    it("plan 4/4 pero sesión extra pendiente hoy → train_today (no week_done)", () => {
        expect(
            resolveDashboardMode({
                hasActivePlan: true,
                todaySession: baseSession({
                    status: "planned",
                    session_name: "QA SUPERSET",
                    training_plan_id: null,
                }),
                sessionsPlanned: 4,
                sessionsCompleted: 4,
            })
        ).toBe("train_today");
    });

    it("plan 4/4 y sesión de hoy completada → train_today_done", () => {
        expect(
            resolveDashboardMode({
                hasActivePlan: true,
                todaySession: baseSession({ status: "completed" }),
                sessionsPlanned: 4,
                sessionsCompleted: 4,
            })
        ).toBe("train_today_done");
    });

    it("plan 4/4 sin sesión hoy → week_done", () => {
        expect(
            resolveDashboardMode({
                hasActivePlan: true,
                sessionsPlanned: 4,
                sessionsCompleted: 4,
            })
        ).toBe("week_done");
    });
});
