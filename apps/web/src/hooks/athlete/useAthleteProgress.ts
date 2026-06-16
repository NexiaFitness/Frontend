/**
 * useAthleteProgress.ts — Datos de progreso para portal atleta (F2).
 */

import { useMemo } from "react";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

export function useAthleteProgress() {
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const {
        weightChartData,
        latestWeight,
        weightChange,
        trend,
        isLoading: progressLoading,
        error: progressError,
    } = useClientProgress(clientId ?? 0);

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const completedSessions = useMemo(
        () =>
            [...sessions]
                .filter((s: TrainingSession) => s.status === "completed")
                .sort((a, b) => {
                    const da = a.session_date ?? "";
                    const db = b.session_date ?? "";
                    return db.localeCompare(da);
                })
                .slice(0, 8),
        [sessions]
    );

    const completedCount = useMemo(
        () => sessions.filter((s) => s.status === "completed").length,
        [sessions]
    );

    return {
        clientId,
        weightChartData,
        latestWeight,
        weightChange,
        trend,
        completedSessions,
        completedCount,
        totalSessions: sessions.length,
        isLoading: profileLoading || progressLoading || sessionsLoading,
        isError: Boolean(progressError) || sessionsError,
    };
}
