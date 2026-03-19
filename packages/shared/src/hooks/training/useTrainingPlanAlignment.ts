/**
 * useTrainingPlanAlignment.ts — Hook para alignment del plan (period-based)
 *
 * Expone GET /training-plans/{plan_id}/alignment.
 * Query opcionales: weeklyOverrideId, dailyOverrideId.
 * Usado por ChartsTab en TrainingPlanDetail.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 5
 */

import { useGetTrainingPlanAlignmentQuery } from "../../api/trainingPlansApi";

interface UseTrainingPlanAlignmentParams {
    planId: number | null | undefined;
    /** ID de WeeklyOverride para mostrar parent month (yearly) values */
    weeklyOverrideId?: number | null;
    /** ID de DailyOverride para mostrar parent week (monthly) values */
    dailyOverrideId?: number | null;
}

/**
 * Obtiene alignment del plan (alignment_graph, yearly_values, monthly_values).
 */
export function useTrainingPlanAlignment({
    planId,
    weeklyOverrideId,
    dailyOverrideId,
}: UseTrainingPlanAlignmentParams) {
    const result = useGetTrainingPlanAlignmentQuery(
        {
            planId: planId!,
            weeklyOverrideId: weeklyOverrideId ?? undefined,
            dailyOverrideId: dailyOverrideId ?? undefined,
        },
        { skip: planId == null || planId === 0 }
    );
    return result;
}
