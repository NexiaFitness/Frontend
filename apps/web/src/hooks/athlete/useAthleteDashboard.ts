/**
 * useAthleteDashboard.ts — Datos del inicio atleta (V01).
 * Contexto: portal atleta F0, orquestación RTK Query.
 * Contratos: agent.md §5, 09_UX_VISTAS V01
 * @author Frontend Team
 * @since v6.1.0
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    useGetClientCoherenceQuery,
    useGetClientTrainingPlanSummaryQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { RootState } from "@nexia/shared/store";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    buildWeekStrip,
    findNextUpcomingSession,
    findTodaySession,
    type WeekDayStripItem,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface AthleteDashboardData {
    userName: string;
    todaySession: TrainingSession | undefined;
    nextSession: TrainingSession | undefined;
    weekStrip: WeekDayStripItem[];
    adherencePercent: number | null;
    planProgressPercent: number | null;
    planName: string | null;
    hasActivePlan: boolean;
    isLoading: boolean;
    isError: boolean;
    isRestDay: boolean;
}

export function useAthleteDashboard(): AthleteDashboardData {
    const { user } = useSelector((state: RootState) => state.auth);
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const currentYear = new Date().getFullYear();

    const {
        data: planSummary,
        isLoading: planLoading,
    } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year: currentYear },
        { skip: !clientId }
    );

    const {
        data: coherence,
        isLoading: coherenceLoading,
    } = useGetClientCoherenceQuery(
        { clientId: clientId ?? 0, periodType: "week" },
        { skip: !clientId }
    );

    const todaySession = useMemo(() => findTodaySession(sessions), [sessions]);
    const nextSession = useMemo(
        () => findNextUpcomingSession(sessions),
        [sessions]
    );
    const weekStrip = useMemo(() => buildWeekStrip(sessions), [sessions]);

    const adherencePercent = coherence?.kpis?.adherence_percentage ?? null;
    const planProgressPercent = planSummary?.summary?.adherence_rate ?? null;
    const planName = planSummary?.plan_name ?? null;
    const hasActivePlan = planSummary?.has_active_plan ?? false;

    const isLoading =
        profileLoading || sessionsLoading || planLoading || coherenceLoading;
    const isRestDay = !todaySession && sessions.length > 0;

    return {
        userName: user?.nombre ?? "Atleta",
        todaySession,
        nextSession,
        weekStrip,
        adherencePercent,
        planProgressPercent,
        planName,
        hasActivePlan,
        isLoading,
        isError: sessionsError,
        isRestDay,
    };
}
