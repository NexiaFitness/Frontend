/**
 * Fixtures para tests de planificación (MSW y RTL).
 * Legacy monthly/weekly/daily fixtures eliminados en Fase 9.
 */

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type {
    PlanCoherenceResponse,
    TrainingPlanAlignmentResponse,
} from "@nexia/shared/types/trainingAnalytics";

const now = new Date().toISOString();

/** Bloque de periodización alineado con PlanPeriodBlock (API / shared). */
export function createMockPlanPeriodBlock(
    overrides: Partial<PlanPeriodBlock> = {},
): PlanPeriodBlock {
    const id = overrides.id ?? 1;
    return {
        id,
        training_plan_id: 1,
        name: null,
        goal: null,
        start_date: "2026-09-08",
        end_date: "2026-09-30",
        volume_level: 5,
        intensity_level: 5,
        sort_order: id,
        qualities: [],
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
