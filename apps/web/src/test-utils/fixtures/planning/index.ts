/**
 * Fixtures para tests de planificación (MSW y RTL).
 * Tipos alineados con @nexia/shared/types/planningCargas y trainingAnalytics.
 */

import type {
    MonthlyPlan,
    ResolvedDayPlan,
    WeeklyOverride,
    DailyOverride,
} from "@nexia/shared/types/planningCargas";
import type {
    PlanCoherenceResponse,
    TrainingPlanAlignmentResponse,
} from "@nexia/shared/types/trainingAnalytics";

const now = new Date().toISOString().slice(0, 19).replace("T", " ");

export function createMockMonthlyPlan(overrides: Partial<MonthlyPlan> = {}): MonthlyPlan {
    return {
        id: 1,
        training_plan_id: 1,
        client_id: null,
        month: "2026-02",
        qualities: { Fuerza: 0.6, Resistencia: 0.4 },
        created_at: now,
        updated_at: now,
        is_active: true,
        ...overrides,
    };
}

export function createMockResolvedDayPlan(
    overrides: Partial<ResolvedDayPlan> = {}
): ResolvedDayPlan {
    return {
        date: "2026-02-03",
        is_trainable: true,
        qualities: { Fuerza: 0.6, Resistencia: 0.4 },
        resolved_volume: 0.8,
        resolved_intensity: 0.7,
        source: "month",
        ...overrides,
    };
}

export function createMockWeeklyOverride(
    overrides: Partial<WeeklyOverride> = {}
): WeeklyOverride {
    return {
        id: 1,
        monthly_plan_id: 1,
        week_id: "2026-02-W1",
        qualities: { Fuerza: 0.7, Resistencia: 0.3 },
        created_at: now,
        updated_at: now,
        is_active: true,
        ...overrides,
    };
}

export function createMockDailyOverride(
    overrides: Partial<DailyOverride> = {}
): DailyOverride {
    return {
        id: 1,
        client_id: 1,
        date: "2026-02-03",
        qualities: { Fuerza: 0.5, Resistencia: 0.5 },
        created_at: now,
        updated_at: now,
        is_active: true,
        ...overrides,
    };
}

export function createMockPlanCoherenceResponse(
    overrides: Partial<PlanCoherenceResponse> = {}
): PlanCoherenceResponse {
    return {
        plan_id: 1,
        month_coherence: [],
        week_coherence: [],
        day_coherence: [],
        overall_coherence: 100,
        deviation_threshold: 20,
        ...overrides,
    };
}

export function createMockTrainingPlanAlignmentResponse(
    overrides: Partial<TrainingPlanAlignmentResponse> = {}
): TrainingPlanAlignmentResponse {
    return {
        plan_id: 1,
        plan_name: "Test Plan",
        yearly_values: null,
        monthly_values: null,
        alignment_graph: [],
        ...overrides,
    };
}
