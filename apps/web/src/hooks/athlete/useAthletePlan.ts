/**
 * useAthletePlan.ts — Mi plan lectura (V08).
 * Contexto: portal atleta F0.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useGetClientTrainingPlanSummaryQuery } from "@nexia/shared/api/clientsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { ClientTrainingPlanSummary } from "@nexia/shared/types/trainingAnalytics";
import { getTrainingGoalLabel } from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface AthletePlanData {
    summary: ClientTrainingPlanSummary | undefined;
    planGoalLabel: string;
    isLoading: boolean;
    isError: boolean;
}

export function useAthletePlan(): AthletePlanData {
    const { clientId } = useAthleteContext();
    const year = new Date().getFullYear();

    const { data: summary, isLoading, isError } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year },
        { skip: !clientId }
    );

    return {
        summary,
        planGoalLabel: getTrainingGoalLabel(summary?.plan_goal),
        isLoading,
        isError,
    };
}
