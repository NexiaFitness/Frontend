/**
 * useAthleteDashboard.ts — Datos del inicio atleta (V01 / F3b-FE-04).
 * Contexto: portal atleta F0/F2, orquestación RTK Query.
 */

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAthleteWeeklySummaryQuery } from "@nexia/shared/api/athleteApi";
import {
    useGetClientFeedbackQuery,
    useGetClientTrainingPlanSummaryQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { RootState } from "@nexia/shared/store";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    buildDashboardHeaderCopy,
    buildSessionHeroCopy,
    type SessionHeroCopy,
} from "@nexia/shared/utils/athlete/athleteDashboardHeroCopy";
import {
    resolveDashboardMode,
    type AthleteDashboardMode,
} from "@nexia/shared/utils/athlete/athleteDashboardMode";
import {
    buildPeriodizationStripCopy,
    type PeriodizationStripCopy,
} from "@nexia/shared/utils/athlete/athletePeriodizationCopy";
import {
    buildWeekStrip,
    findLatestTrainerSessionNote,
    findNextUpcomingSession,
    findTodaySession,
    type WeekDayStripItem,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { hasUnreadTrainerResponse } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";

export interface AthleteDashboardData {
    userName: string;
    clientId: number | null;
    todaySession: TrainingSession | undefined;
    nextSession: TrainingSession | undefined;
    weekStrip: WeekDayStripItem[];
    planProgressPercent: number | null;
    planName: string | null;
    hasActivePlan: boolean;
    dashboardMode: AthleteDashboardMode;
    periodizationStrip: PeriodizationStripCopy | null;
    showFeedbackBadge: boolean;
    trainerNote: { session: TrainingSession; note: string } | null;
    isLoading: boolean;
    isError: boolean;
    isRestDay: boolean;
    heroSubtitle: string;
    sessionHero: SessionHeroCopy;
    refreshFeedbackBadge: () => void;
    refreshDashboard: () => Promise<void>;
}

export function useAthleteDashboard(): AthleteDashboardData {
    const { user } = useSelector((state: RootState) => state.auth);
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const currentYear = new Date().getFullYear();

    const {
        data: planSummary,
        isLoading: planLoading,
        refetch: refetchPlan,
    } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year: currentYear },
        { skip: !clientId }
    );

    const {
        data: feedbackItems = [],
        isLoading: feedbackLoading,
        refetch: refetchFeedback,
    } = useGetClientFeedbackQuery({ clientId: clientId ?? 0, limit: 20 }, { skip: !clientId });

    const { data: weeklySummary, isLoading: weeklyLoading } = useGetAthleteWeeklySummaryQuery(
        undefined,
        { skip: !clientId || !(planSummary?.has_active_plan ?? false) }
    );

    const todaySession = useMemo(() => findTodaySession(sessions), [sessions]);
    const nextSession = useMemo(
        () => findNextUpcomingSession(sessions),
        [sessions]
    );
    const weekStrip = useMemo(() => buildWeekStrip(sessions), [sessions]);

    const planProgressPercent = planSummary?.summary?.adherence_rate ?? null;
    const planName = planSummary?.plan_name ?? null;
    const planGoal = planSummary?.plan_goal ?? null;
    const hasActivePlan = planSummary?.has_active_plan ?? false;
    const trainerNote = useMemo(() => findLatestTrainerSessionNote(sessions), [sessions]);
    const [feedbackBadgeTick, setFeedbackBadgeTick] = useState(0);
    const [showFeedbackBadge, setShowFeedbackBadge] = useState(false);

    useEffect(() => {
        setShowFeedbackBadge(hasUnreadTrainerResponse(feedbackItems));
    }, [feedbackItems, feedbackBadgeTick]);

    const refreshFeedbackBadge = useCallback(() => {
        setFeedbackBadgeTick((t) => t + 1);
    }, []);

    const refreshDashboard = useCallback(async () => {
        await Promise.all([refetchSessions(), refetchPlan(), refetchFeedback()]);
    }, [refetchSessions, refetchPlan, refetchFeedback]);

    const isLoading =
        profileLoading || sessionsLoading || planLoading || feedbackLoading || weeklyLoading;
    const isRestDay = !todaySession && sessions.length > 0;

    const dashboardMode = useMemo(
        () =>
            resolveDashboardMode({
                hasActivePlan,
                todaySession,
                nextSession,
                sessionsPlanned: weeklySummary?.adherence.sessions_planned,
                sessionsCompleted: weeklySummary?.adherence.sessions_completed,
            }),
        [hasActivePlan, todaySession, nextSession, weeklySummary]
    );

    const copyContext = useMemo(
        () => ({
            mode: dashboardMode,
            todaySession,
            nextSession,
            hasActivePlan,
            clientId: clientId ?? undefined,
        }),
        [dashboardMode, todaySession, nextSession, hasActivePlan, clientId]
    );

    const heroSubtitle = useMemo(
        () => buildDashboardHeaderCopy(copyContext).subtitle,
        [copyContext]
    );

    const sessionHero = useMemo(
        () => buildSessionHeroCopy(copyContext),
        [copyContext]
    );

    const periodizationStrip = useMemo(
        () =>
            hasActivePlan
                ? buildPeriodizationStripCopy({
                      planName,
                      planGoal,
                      planProgressPercent,
                  })
                : null,
        [hasActivePlan, planName, planGoal, planProgressPercent]
    );

    return {
        userName: user?.nombre ?? "Atleta",
        clientId: clientId ?? null,
        todaySession,
        nextSession,
        weekStrip,
        planProgressPercent,
        planName,
        hasActivePlan,
        dashboardMode,
        periodizationStrip,
        showFeedbackBadge,
        trainerNote,
        isLoading,
        isError: sessionsError,
        isRestDay,
        heroSubtitle,
        sessionHero,
        refreshFeedbackBadge,
        refreshDashboard,
    };
}
