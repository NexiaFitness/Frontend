/**
 * useTrainingPlanCoherence.ts — Hook para coherencia del plan (Fase 5)
 *
 * Expone GET /training-plans/{plan_id}/coherence (period-based).
 * Usado por ChartsTab en TrainingPlanDetail.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 5
 */

import { useGetTrainingPlanCoherenceQuery } from "../../api/trainingPlansApi";

interface UseTrainingPlanCoherenceParams {
    planId: number | null | undefined;
    deviationThreshold?: number;
}

/**
 * Obtiene coherencia del plan (month/week/day coherence, overall_coherence).
 */
export function useTrainingPlanCoherence({
    planId,
    deviationThreshold = 20,
}: UseTrainingPlanCoherenceParams) {
    const result = useGetTrainingPlanCoherenceQuery(
        { planId: planId!, deviationThreshold },
        { skip: planId == null || planId === 0 }
    );
    return result;
}
