/**
 * useAthleteProgress.ts — Datos completos V10 progreso atleta (F2 / F3b premium).
 */

import { useMemo } from "react";
import {
    useGetClientProgressTrackingQuery,
    useGetClientCoherenceQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises/useExercises";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    buildRecentRecords,
    buildTopExercises,
    buildWeeklyActivityBars,
    computeAdherence30d,
} from "@nexia/shared/utils/athlete/athleteProgressUtils";

function monthPeriodBounds(): { periodStart: string; periodEnd: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { periodStart: fmt(start), periodEnd: fmt(end) };
}

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

export function useAthleteProgress() {
    const { clientId, profile, isLoading: profileLoading } = useAthleteContext();
    const period = useMemo(() => monthPeriodBounds(), []);

    const {
        weightChartData,
        latestWeight: progressLatestWeight,
        weightChange,
        trend,
        isLoading: progressLoading,
        error: progressError,
    } = useClientProgress(clientId, profile);

    const latestWeight = progressLatestWeight ?? profile?.peso ?? null;

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const {
        data: tracking = [],
        isLoading: trackingLoading,
        isError: trackingError,
    } = useGetClientProgressTrackingQuery(
        { clientId: clientId ?? 0, limit: 200 },
        { skip: !clientId }
    );

    const { data: coherence, isLoading: coherenceLoading } = useGetClientCoherenceQuery(
        {
            clientId: clientId ?? 0,
            periodType: "month",
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
        },
        { skip: !clientId }
    );

    const { data: exerciseList, isLoading: exercisesLoading } = useGetExercisesQuery(
        { skip: 0, limit: 500 },
        { skip: !clientId }
    );

    const exerciseNames = useMemo(() => {
        const map = new Map<number, string>();
        for (const ex of exerciseList?.exercises ?? []) {
            map.set(ex.id, ex.nombre);
        }
        return map;
    }, [exerciseList?.exercises]);

    const adherence30d = useMemo(() => computeAdherence30d(sessions), [sessions]);

    const adherencePercent30d =
        coherence?.kpis?.adherence_percentage ?? adherence30d.percent;

    const weeklyActivity = useMemo(
        () => buildWeeklyActivityBars(sessions),
        [sessions]
    );

    const topExercises = useMemo(
        () => buildTopExercises(tracking, exerciseNames),
        [tracking, exerciseNames]
    );

    const recentRecords = useMemo(
        () => buildRecentRecords(tracking, exerciseNames),
        [tracking, exerciseNames]
    );

    const completedSessions = useMemo(
        () =>
            [...sessions]
                .filter((s) => s.status === "completed")
                .sort((a, b) => (b.session_date ?? "").localeCompare(a.session_date ?? ""))
                .slice(0, 8),
        [sessions]
    );

    const completedCount = useMemo(
        () => sessions.filter((s) => s.status === "completed").length,
        [sessions]
    );

    const weightSubtitle = useMemo(() => {
        if (weightChange != null) {
            return `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg en el periodo`;
        }
        return formatWeightTrendLabel(trend);
    }, [weightChange, trend]);

    return {
        clientId,
        weightChartData,
        latestWeight,
        weightChange,
        trend,
        weightSubtitle,
        adherencePercent30d,
        adherence30d,
        weeklyActivity,
        topExercises,
        recentRecords,
        personalRecordCount: recentRecords.length,
        completedSessions,
        completedCount,
        totalSessions: sessions.length,
        averageSrpe: coherence?.kpis?.average_srpe ?? null,
        isLoading:
            profileLoading ||
            progressLoading ||
            sessionsLoading ||
            trackingLoading ||
            coherenceLoading ||
            exercisesLoading,
        isError: Boolean(progressError) || sessionsError || trackingError,
    };
}
