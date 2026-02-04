/**
 * useTrainingPlanAlignment.ts — Hook para alignment del plan (Fase 5)
 *
 * Expone GET /training-plans/{plan_id}/alignment (period-based).
 * Query opcionales: mesocycle_id (semántica: weekly_override_id), microcycle_id (daily_override_id).
 * Usado por ChartsTab en TrainingPlanDetail.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 5
 */

import { useGetTrainingPlanAlignmentQuery } from "../../api/trainingPlansApi";

interface UseTrainingPlanAlignmentParams {
    planId: number | null | undefined;
    /** Semántica backend: ID de WeeklyOverride para mostrar parent yearly values */
    mesocycleId?: number | null;
    /** Semántica backend: ID de DailyOverride para mostrar parent monthly values */
    microcycleId?: number | null;
}

/**
 * Obtiene alignment del plan (alignment_graph, yearly_values, monthly_values).
 */
export function useTrainingPlanAlignment({
    planId,
    mesocycleId,
    microcycleId,
}: UseTrainingPlanAlignmentParams) {
    const result = useGetTrainingPlanAlignmentQuery(
        {
            planId: planId!,
            mesocycleId: mesocycleId ?? undefined,
            microcycleId: microcycleId ?? undefined,
        },
        { skip: planId == null || planId === 0 }
    );
    return result;
}
