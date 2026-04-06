/**
 * Fixtures para tests de planificación (MSW y RTL).
 * Legacy monthly/weekly/daily fixtures eliminados en Fase 9.
 */

import type {
    PlanCoherenceResponse,
    TrainingPlanAlignmentResponse,
} from "@nexia/shared/types/trainingAnalytics";

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
