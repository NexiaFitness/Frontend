/**
 * useAthleteDashboard.ts — Datos del inicio atleta (V01 / F3b-FE-04).
 * Contexto: portal atleta F0/F2, orquestación RTK Query.
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo, useState, useCallback, useEffect } from "react";

function formatLocalIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function athleteSessionsDateWindow(): { dateFrom: string; dateTo: string } {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
    return { dateFrom: formatLocalIsoDate(from), dateTo: formatLocalIsoDate(to) };
}
import { useSelector } from "react-redux";
import {
    useGetAthleteRunProgressQuery,
    useGetAthleteWeeklySummaryQuery,
} from "@nexia/shared/api/athleteApi";
import {
    useGetClientFeedbackQuery,
    useGetClientTrainingPlanSummaryQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetCalendarEventsQuery } from "@nexia/shared/api/calendarApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import {
    athleteCalendarDateWindow,
    athleteCalendarHasPartialFailure,
    filterHomeTodayAppointments,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { RootState } from "@nexia/shared/store";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { InsightDeepLinkContext } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";
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
    countAdditionalTodaySessions,
    findLatestTrainerSessionNote,
    findNextUpcomingSession,
    findTodayPrimarySession,
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
    extraTodaySessionCount: number;
    hasScheduledSessions: boolean;
    todayAppointments: CalendarEvent[];
    isLoading: boolean;
    isError: boolean;
    isRestDay: boolean;
    heroSubtitle: string;
    sessionHero: SessionHeroCopy;
    refreshFeedbackBadge: () => void;
    refreshDashboard: () => Promise<void>;
    insightDeepLinkContext: InsightDeepLinkContext;
}

export function useAthleteDashboard(): AthleteDashboardData {
    const { user } = useSelector((state: RootState) => state.auth);
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const dateWindow = useMemo(() => athleteSessionsDateWindow(), []);
    const calendarWindow = useMemo(() => athleteCalendarDateWindow(), []);

    const {
        data: calendarData,
        isLoading: calendarLoading,
        isError: calendarError,
        refetch: refetchCalendar,
    } = useGetCalendarEventsQuery(
        clientId != null && clientId > 0
            ? {
                  clientId,
                  from: calendarWindow.from,
                  to: calendarWindow.to,
                  limit: 200,
              }
            : skipToken
    );

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetTrainingSessionsByClientQuery(
        clientId
            ? {
                  clientId,
                  limit: 200,
                  dateFrom: dateWindow.dateFrom,
                  dateTo: dateWindow.dateTo,
              }
            : 0,
        {
            skip: !clientId,
        }
    );

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
        { skip: !clientId }
    );

    const todayAppointments = useMemo(
        () => filterHomeTodayAppointments(calendarData?.items ?? []),
        [calendarData?.items]
    );

    const todaySession = useMemo(() => findTodayPrimarySession(sessions), [sessions]);

    const { data: todaySessionLogProgress } = useGetAthleteRunProgressQuery(
        todaySession?.id ?? 0,
        {
            skip:
                !todaySession?.id ||
                todaySession.status === "completed" ||
                !clientId,
        }
    );
    const extraTodaySessionCount = useMemo(
        () => countAdditionalTodaySessions(sessions, todaySession),
        [sessions, todaySession]
    );
    const hasScheduledSessions = sessions.length > 0;
    const nextSession = useMemo(
        () => findNextUpcomingSession(sessions),
        [sessions]
    );
    const weekStrip = useMemo(() => buildWeekStrip(sessions), [sessions]);

    const planProgressPercent = planSummary?.summary?.adherence_rate ?? null;
    const planName = planSummary?.plan_name ?? null;
    const planGoal = planSummary?.plan_goal ?? null;
    const hasActivePlan =
        weeklySummary?.adherence.has_active_plan ??
        planSummary?.has_active_plan ??
        false;
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
        await Promise.all([
            refetchSessions(),
            refetchPlan(),
            refetchFeedback(),
            refetchCalendar(),
        ]);
    }, [refetchSessions, refetchPlan, refetchFeedback, refetchCalendar]);

    const isLoading =
        profileLoading ||
        sessionsLoading ||
        planLoading ||
        feedbackLoading ||
        weeklyLoading ||
        calendarLoading;
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
            todaySessionLogProgress: todaySessionLogProgress ?? null,
        }),
        [
            dashboardMode,
            todaySession,
            nextSession,
            hasActivePlan,
            clientId,
            todaySessionLogProgress,
        ]
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
        extraTodaySessionCount,
        hasScheduledSessions,
        todayAppointments,
        isLoading,
        isError: athleteCalendarHasPartialFailure(calendarError, sessionsError),
        isRestDay,
        heroSubtitle,
        sessionHero,
        refreshFeedbackBadge,
        refreshDashboard,
        insightDeepLinkContext: {
            sessions,
            feedbackItems,
        },
    };
}
