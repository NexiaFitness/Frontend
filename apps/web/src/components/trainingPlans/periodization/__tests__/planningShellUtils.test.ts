import { describe, expect, it } from "vitest";
import type { TrainingPlan } from "@nexia/shared/types/training";

import { createMockPlanPeriodBlock } from "@/test-utils/fixtures/planning";

import {
    canAddPeriodPhase,
    hasMultipleClientTrainingPlans,
    resolveNextPhaseStartDate,
    sortClientTrainingPlansForDisplay,
} from "../planningShellUtils";

function planStub(partial: Partial<TrainingPlan> & Pick<TrainingPlan, "id">): TrainingPlan {
    return {
        trainer_id: 1,
        client_id: 1,
        name: "Plan",
        description: null,
        start_date: "2026-01-01",
        end_date: "2026-06-30",
        goal: "hypertrophy",
        status: "completed",
        is_active: false,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        sessions_completed: 0,
        sessions_total: 0,
        ...partial,
    };
}

describe("resolveNextPhaseStartDate", () => {
    it("devuelve planStartDate si no hay bloques", () => {
        expect(resolveNextPhaseStartDate([], "2026-09-08")).toBe("2026-09-08");
    });

    it("salta al día libre tras el bloque más tardío", () => {
        const blocks = [
            createMockPlanPeriodBlock({
                id: 1,
                start_date: "2026-09-08",
                end_date: "2026-09-30",
            }),
        ];
        expect(resolveNextPhaseStartDate(blocks, "2026-09-08")).toBe(
            "2026-10-01",
        );
    });
});

describe("hasMultipleClientTrainingPlans", () => {
    it("es false con 0 o 1 plan", () => {
        expect(hasMultipleClientTrainingPlans([])).toBe(false);
        expect(
            hasMultipleClientTrainingPlans([{ id: 1 } as TrainingPlan]),
        ).toBe(false);
    });

    it("es true con más de un plan", () => {
        expect(
            hasMultipleClientTrainingPlans([
                { id: 1 } as TrainingPlan,
                { id: 2 } as TrainingPlan,
            ]),
        ).toBe(true);
    });
});

describe("sortClientTrainingPlansForDisplay", () => {
    it("coloca el plan activo primero y el resto por end_date descendente", () => {
        const sorted = sortClientTrainingPlansForDisplay([
            planStub({
                id: 1,
                name: "Antiguo",
                end_date: "2024-12-31",
                status: "completed",
            }),
            planStub({
                id: 2,
                name: "Activo",
                end_date: "2026-12-31",
                status: "active",
                is_active: true,
            }),
            planStub({
                id: 3,
                name: "Reciente pasado",
                end_date: "2025-08-31",
                status: "completed",
            }),
        ]);
        expect(sorted.map((p) => p.id)).toEqual([2, 3, 1]);
    });
});

describe("canAddPeriodPhase", () => {
    it("permite añadir fase si hay día libre dentro del plan", () => {
        const blocks = [
            createMockPlanPeriodBlock({
                id: 1,
                start_date: "2026-09-08",
                end_date: "2026-09-30",
            }),
        ];
        expect(
            canAddPeriodPhase(blocks, "2026-09-08", "2026-12-31"),
        ).toBe(true);
    });

    it("no permite añadir fase si el plan ya no tiene días libres", () => {
        const blocks = [
            createMockPlanPeriodBlock({
                id: 1,
                start_date: "2026-09-08",
                end_date: "2026-09-30",
            }),
        ];
        expect(
            canAddPeriodPhase(blocks, "2026-09-08", "2026-09-30"),
        ).toBe(false);
    });
});
