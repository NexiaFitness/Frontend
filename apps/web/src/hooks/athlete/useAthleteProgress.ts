/**
 * useAthleteProgress.ts — Datos V10 progreso atleta.
 * Contexto: orquesta listado de sesiones, tracking y catálogo; builders en shared.
 * Notas: coherence de entrenador no alimenta el KPI; criticidad de carga en el retorno.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useEffect, useMemo } from "react";
import { EXERCISES_LIST_MAX_LIMIT } from "@nexia/shared/config/constants";
import {
    useGetClientProgressTrackingQuery,
    useGetClientTrainingPlanMonthlySummaryQuery,
    useGetClientTrainingPlanSummaryQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises/useExercises";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    athleteDayKey,
    athleteProgressDeltaWindowLabel,
    athleteProgressPeriodLabel,
    athleteProgressPeriodRange,
    athleteProgressPreviousPeriodRange,
    type AthleteProgressPeriodId,
} from "@nexia/shared/utils/athlete/athleteProgressPeriod";
import { buildAthleteProgressInsight } from "@nexia/shared/utils/athlete/athleteProgressInsight";
import {
    buildRecentRecords,
    buildTopExercises,
    buildWeeklyActivityBars,
    computeAdherence,
    countPersonalRecords,
    countTrailingTrainingWeeks,
} from "@nexia/shared/utils/athlete/athleteProgressUtils";
import {
    findNextUpcomingSession,
    findLatestCompletedSession,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    buildAthletePlanActiveBlockCopy,
} from "@nexia/shared/utils/athlete/athletePlanViewUtils";

const SESSIONS_LIMIT = 1000;
const TRACKING_LIMIT = 1000;

function formatWeightTrendLabel(
    trend: ReturnType<typeof useClientProgress>["trend"]
): string {
    switch (trend) {
        case "gaining_weight":
            return "Tendencia al alza";
        case "losing_weight":
            return "Tendencia a la baja";
        case "maintaining_weight":
            return "Mantenimiento";
        case "stable":
            return "Estable";
        default:
            return "Lo registra tu entrenador";
    }
}

function logUnresolvedExercises(ids: number[], source: string): void {
    if (ids.length === 0) return;
    console.warn("[athlete-progress] unresolved exercise names", {
        source,
        ids: [...new Set(ids)],
    });
}

export function useAthleteProgress(period: AthleteProgressPeriodId) {
    const {
        clientId,
        profile,
        isLoading: profileLoading,
        isError: profileError,
        refetch: refetchProfile,
    } = useAthleteContext();
    const todayKey = athleteDayKey();
    const year = Number(todayKey.slice(0, 4));
    const month = Number(todayKey.slice(5, 7));

    const {
        weightChartData,
        latestWeight: progressLatestWeight,
        weightChange,
        trend,
        isLoading: progressLoading,
        error: progressError,
        refetch: refetchWeight,
    } = useClientProgress(clientId, profile);

    const latestWeight = progressLatestWeight ?? profile?.peso ?? null;

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetTrainingSessionsByClientQuery(
        clientId
            ? { clientId, limit: SESSIONS_LIMIT }
            : 0,
        { skip: !clientId }
    );

    const {
        data: tracking = [],
        isLoading: trackingLoading,
        isError: trackingError,
        refetch: refetchTracking,
    } = useGetClientProgressTrackingQuery(
        { clientId: clientId ?? 0, limit: TRACKING_LIMIT },
        { skip: !clientId }
    );

    const {
        data: exerciseList,
        isLoading: exercisesLoading,
        isError: exercisesError,
        refetch: refetchExercises,
    } = useGetExercisesQuery(
        { skip: 0, limit: EXERCISES_LIST_MAX_LIMIT },
        { skip: !clientId }
    );

    const {
        data: planSummary,
        isError: planError,
    } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year },
        { skip: !clientId }
    );

    const hasActivePlan = planSummary?.has_active_plan === true;

    const { data: monthly } = useGetClientTrainingPlanMonthlySummaryQuery(
        { clientId: clientId ?? 0, year, month },
        { skip: !clientId || !hasActivePlan }
    );

    const exerciseNames = useMemo(() => {
        const map = new Map<number, string>();
        for (const exercise of exerciseList?.exercises ?? []) {
            map.set(exercise.id, exercise.nombre);
        }
        return map;
    }, [exerciseList?.exercises]);

    const historyStart = useMemo(() => {
        const dates = [
            ...sessions.map((s) => s.session_date).filter(Boolean),
            ...tracking.map((row) => row.tracking_date).filter(Boolean),
        ] as string[];
        if (dates.length === 0) return todayKey;
        return dates.map((d) => d.slice(0, 10)).sort()[0];
    }, [sessions, tracking, todayKey]);

    const range = useMemo(
        () => athleteProgressPeriodRange(period, todayKey, historyStart),
        [period, todayKey, historyStart]
    );

    const previousRange = useMemo(
        () => athleteProgressPreviousPeriodRange(period, range),
        [period, range]
    );

    const historyExceeds30d = historyStart < athleteProgressPeriodRange("30d", todayKey, null).start;

    const adherence = useMemo(
        () => computeAdherence(sessions, range, todayKey),
        [sessions, range, todayKey]
    );

    const previousAdherence = useMemo(
        () =>
            previousRange
                ? computeAdherence(sessions, previousRange, todayKey)
                : null,
        [sessions, previousRange, todayKey]
    );

    const weeklyActivity = useMemo(
        () => buildWeeklyActivityBars(sessions, range),
        [sessions, range]
    );

    const consecutiveWeeks = useMemo(
        () => countTrailingTrainingWeeks(weeklyActivity),
        [weeklyActivity]
    );

    const topExercisesResult = useMemo(
        () => buildTopExercises(tracking, exerciseNames, range),
        [tracking, exerciseNames, range]
    );

    const recentRecordsResult = useMemo(
        () => buildRecentRecords(tracking, exerciseNames, range),
        [tracking, exerciseNames, range]
    );

    useEffect(() => {
        logUnresolvedExercises(topExercisesResult.unresolvedIds, "top");
        logUnresolvedExercises(recentRecordsResult.unresolvedIds, "records");
    }, [topExercisesResult.unresolvedIds, recentRecordsResult.unresolvedIds]);

    const personalRecordCount = useMemo(
        () => countPersonalRecords(tracking, range, exerciseNames),
        [tracking, range, exerciseNames]
    );

    const completedSessions = useMemo(
        () =>
            [...sessions]
                .filter((s) => s.status === "completed")
                .filter((s) => s.session_date && s.session_date.slice(0, 10) >= range.start && s.session_date.slice(0, 10) <= range.end)
                .sort((a, b) => (b.session_date ?? "").localeCompare(a.session_date ?? ""))
                .slice(0, 8),
        [sessions, range]
    );

    const completedInPeriod = useMemo(
        () =>
            sessions.filter(
                (s) =>
                    s.status === "completed" &&
                    s.session_date != null &&
                    s.session_date.slice(0, 10) >= range.start &&
                    s.session_date.slice(0, 10) <= range.end
            ).length,
        [sessions, range]
    );

    const lifetimeCompleted = useMemo(
        () => sessions.filter((s) => s.status === "completed").length,
        [sessions]
    );

    const nextSession = useMemo(
        () => findNextUpcomingSession(sessions),
        [sessions]
    );

    const latestCompleted = useMemo(
        () => findLatestCompletedSession(sessions),
        [sessions]
    );

    const blockChip = useMemo(() => {
        if (planError || !planSummary?.has_active_plan) return null;
        const active = buildAthletePlanActiveBlockCopy(planSummary, monthly);
        if (!active.weekLabel) return null;
        return {
            label: `${active.weekLabel} · ${active.planTitle}`,
        };
    }, [planError, planSummary, monthly]);

    const insight = useMemo(
        () =>
            buildAthleteProgressInsight({
                personalRecords: recentRecordsResult.rows,
                consecutiveWeeks,
                adherence,
                previousAdherence,
                lifetimeCompleted,
                nextSessionName: nextSession?.session_name ?? nextSession?.agenda_quality_label ?? null,
                hasActivePlan,
            }),
        [
            recentRecordsResult.rows,
            consecutiveWeeks,
            adherence,
            previousAdherence,
            lifetimeCompleted,
            nextSession,
            hasActivePlan,
        ]
    );

    const weightSubtitle = useMemo(() => {
        if (weightChange != null) {
            return `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg en el periodo`;
        }
        return formatWeightTrendLabel(trend);
    }, [weightChange, trend]);

    const isCriticalLoading =
        profileLoading || sessionsLoading || trackingLoading;
    const isCriticalError = profileError || sessionsError || trackingError;

    return {
        clientId,
        period,
        range,
        windowLabel: athleteProgressPeriodLabel(period),
        deltaWindowLabel: athleteProgressDeltaWindowLabel(period),
        historyExceeds30d,
        weightChartData,
        latestWeight,
        weightChange,
        trend,
        weightSubtitle,
        adherence,
        previousAdherence,
        weeklyActivity,
        consecutiveWeeks,
        topExercises: topExercisesResult.rows,
        recentRecords: recentRecordsResult.rows,
        personalRecordCount,
        completedSessions,
        completedInPeriod,
        lifetimeCompleted,
        sessionsTruncated: sessions.length >= SESSIONS_LIMIT,
        trackingTruncated: tracking.length >= TRACKING_LIMIT,
        nextSession,
        latestCompleted,
        insight,
        blockChip,
        catalogError: exercisesError,
        weightError: Boolean(progressError),
        refetchCatalog: refetchExercises,
        refetchWeight,
        refetchProfile,
        refetchSessions,
        refetchTracking,
        isLoading: isCriticalLoading,
        isError: isCriticalError,
        catalogLoading: exercisesLoading,
        weightLoading: progressLoading,
    };
}
