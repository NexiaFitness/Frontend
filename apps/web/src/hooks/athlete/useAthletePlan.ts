/**
 * useAthletePlan.ts — Mi plan lectura (V08 premium).
 */

import { useMemo } from "react";
import {
    useGetClientTrainingPlanMonthlySummaryQuery,
    useGetClientTrainingPlanSummaryQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { ClientTrainingPlanSummary } from "@nexia/shared/types/trainingAnalytics";
import {
    buildAthletePlanActiveBlockCopy,
    buildAthletePlanMonthTimeline,
    type AthletePlanActiveBlockCopy,
    type AthletePlanMonthTimelineItem,
} from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import {
    buildWeekStrip,
    getTrainingGoalLabel,
    type WeekDayStripItem,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface AthletePlanViewModel {
    summary: ClientTrainingPlanSummary | undefined;
    planGoalLabel: string;
    activeBlock: AthletePlanActiveBlockCopy | null;
    weekStrip: WeekDayStripItem[];
    monthTimeline: AthletePlanMonthTimelineItem[];
}

export interface AthletePlanData extends AthletePlanViewModel {
    isLoading: boolean;
    isError: boolean;
}

export function useAthletePlan(): AthletePlanData {
    const { clientId, isLoading: profileLoading } = useAthleteContext();
    const reference = useMemo(() => new Date(), []);
    const year = reference.getFullYear();
    const month = reference.getMonth() + 1;

    const {
        data: summary,
        isLoading: summaryLoading,
        isError,
    } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year },
        { skip: !clientId }
    );

    const hasActivePlan = summary?.has_active_plan ?? false;

    const { data: monthly, isLoading: monthlyLoading } =
        useGetClientTrainingPlanMonthlySummaryQuery(
            { clientId: clientId ?? 0, year, month },
            { skip: !clientId || !hasActivePlan }
        );

    const { data: sessions = [], isLoading: sessionsLoading } =
        useGetTrainingSessionsByClientQuery(clientId ?? 0, {
            skip: !clientId || !hasActivePlan,
        });

    const weekStrip = useMemo(() => buildWeekStrip(sessions, reference), [sessions, reference]);

    const activeBlock = useMemo(
        () => (summary ? buildAthletePlanActiveBlockCopy(summary, monthly, reference) : null),
        [summary, monthly, reference]
    );

    const monthTimeline = useMemo(
        () =>
            summary?.yearly_progression?.length
                ? buildAthletePlanMonthTimeline(summary.yearly_progression, reference)
                : [],
        [summary, reference]
    );

    return {
        summary,
        planGoalLabel: getTrainingGoalLabel(summary?.plan_goal),
        activeBlock,
        weekStrip,
        monthTimeline,
        isLoading: profileLoading || summaryLoading || monthlyLoading || sessionsLoading,
        isError,
    };
}
