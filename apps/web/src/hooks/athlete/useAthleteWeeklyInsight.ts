/**
 * useAthleteWeeklyInsight.ts — Datos + copy insight semanal V01 (F3b-FE-04).
 */

import { useCallback, useMemo } from "react";
import { useGetAthleteWeeklySummaryQuery } from "@nexia/shared/api/athleteApi";
import type { AthleteWeeklyPersonalRecord } from "@nexia/shared/types/athleteWeeklySummary";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { AthleteDashboardMode } from "@nexia/shared/utils/athlete/athleteDashboardMode";
import {
    buildAthleteKpiStripData,
    type AthleteKpiStripData,
} from "@nexia/shared/utils/athlete/athleteKpiStrip";
import {
    buildInsightDeepLinks,
    type InsightDeepLink,
} from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { computeDaysUntilSession } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    buildPersonalRecordChipLabel,
    buildTrainerMessageChipLabel,
    buildWeeklyInsightCopy,
    shouldShowWeeklyInsight,
} from "@nexia/shared/utils/athlete/athleteWeeklyCopy";

export interface WeeklyInsightChip {
    id: string;
    label: string;
    variant: "pr" | "trainer-message";
    exerciseId?: number;
}

export interface WeeklyInsightStats {
    adherencePercent: number | null;
    trainingStreak: number;
    sessionsCompleted: number;
    sessionsPlanned: number;
}

export interface AthleteWeeklyInsightData {
    headline: string | null;
    subline: string | null;
    chips: WeeklyInsightChip[];
    stats: WeeklyInsightStats | null;
    kpiStrip: AthleteKpiStripData | null;
    deepLinks: InsightDeepLink[];
    topRecord: AthleteWeeklyPersonalRecord | null;
    isVisible: boolean;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

export function useAthleteWeeklyInsight(
    hasActivePlan: boolean,
    _weekStrip: WeekDayStripItem[],
    nextSession: TrainingSession | undefined,
    dashboardMode: AthleteDashboardMode,
    clientId?: number | null
): AthleteWeeklyInsightData {
    const { data, isLoading, isError, refetch } = useGetAthleteWeeklySummaryQuery(undefined, {
        skip: !hasActivePlan,
    });

    const refetchSummary = useCallback(() => {
        if (hasActivePlan) {
            void refetch();
        }
    }, [hasActivePlan, refetch]);

    return useMemo(() => {
        const empty: AthleteWeeklyInsightData = {
            headline: null,
            subline: null,
            chips: [],
            stats: null,
            kpiStrip: null,
            deepLinks: [],
            topRecord: null,
            isVisible: false,
            isLoading,
            isError,
            refetch: refetchSummary,
        };

        if (!hasActivePlan) {
            return { ...empty, isLoading: false, refetch: refetchSummary };
        }

        if (isLoading || !data) {
            return { ...empty, isLoading, isError, refetch: refetchSummary };
        }

        const copy = buildWeeklyInsightCopy({
            summary: data,
            mode: dashboardMode,
            nextSession,
            clientId: clientId ?? undefined,
        });

        const chips: WeeklyInsightChip[] = [];
        const topRecord = data.personal_records[0] ?? null;

        if (topRecord) {
            chips.push({
                id: `pr-${topRecord.exercise_id}-${topRecord.tracking_date}`,
                label: buildPersonalRecordChipLabel(topRecord),
                variant: "pr",
                exerciseId: topRecord.exercise_id,
            });
        }

        if (data.feedback.has_trainer_response) {
            chips.push({
                id: "trainer-message",
                label: buildTrainerMessageChipLabel(data.feedback.latest_session_name),
                variant: "trainer-message",
            });
        }

        const stats: WeeklyInsightStats = {
            adherencePercent:
                data.adherence.sessions_planned > 0
                    ? Math.round(data.adherence.adherence_rate)
                    : null,
            trainingStreak: data.training_streak,
            sessionsCompleted: data.adherence.sessions_completed,
            sessionsPlanned: data.adherence.sessions_planned,
        };

        const daysUntilNextSession = nextSession?.session_date
            ? computeDaysUntilSession(nextSession.session_date)
            : null;

        const kpiStrip = buildAthleteKpiStripData({
            sessionsPlanned: stats.sessionsPlanned,
            sessionsCompleted: stats.sessionsCompleted,
            adherencePercent: stats.adherencePercent,
            trainingStreak: stats.trainingStreak,
            daysUntilNextSession,
        });

        const deepLinks = buildInsightDeepLinks({
            mode: dashboardMode,
            hasTrainerResponse: data.feedback.has_trainer_response,
            hasPersonalRecord: topRecord != null,
            topRecordExerciseId: topRecord?.exercise_id,
            topRecordExerciseName: topRecord?.exercise_name,
        });

        return {
            headline: copy.headline,
            subline: copy.subline,
            chips,
            stats,
            kpiStrip,
            deepLinks,
            topRecord,
            isVisible: shouldShowWeeklyInsight(data, hasActivePlan),
            isLoading: false,
            isError,
            refetch: refetchSummary,
        };
    }, [
        clientId,
        dashboardMode,
        data,
        hasActivePlan,
        isError,
        isLoading,
        nextSession,
        refetchSummary,
    ]);
}
