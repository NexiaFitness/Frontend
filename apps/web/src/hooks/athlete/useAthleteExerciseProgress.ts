/**
 * useAthleteExerciseProgress.ts — Detalle progreso por ejercicio (V11 F2).
 */

import { useMemo } from "react";
import {
    useGetClientExerciseProgressTrackingQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetExerciseByIdQuery } from "@nexia/shared/hooks/exercises/useExercises";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    buildExerciseHistoryTable,
    buildExerciseProgressChart,
    findSessionByTrackingDate,
} from "@nexia/shared/utils/athlete/athleteProgressUtils";

export function useAthleteExerciseProgress(exerciseId: number) {
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const {
        data: tracking = [],
        isLoading: trackingLoading,
        isError: trackingError,
    } = useGetClientExerciseProgressTrackingQuery(
        { clientId: clientId ?? 0, exerciseId, limit: 100 },
        { skip: !clientId || !exerciseId }
    );

    const {
        data: exercise,
        isLoading: exerciseLoading,
        isError: exerciseError,
    } = useGetExerciseByIdQuery(exerciseId, { skip: !exerciseId });

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const chartData = useMemo(
        () => buildExerciseProgressChart(tracking),
        [tracking]
    );

    const historyRows = useMemo(
        () => buildExerciseHistoryTable(tracking, 5),
        [tracking]
    );

    const latestWeight = useMemo(() => {
        const withWeight = tracking.filter((t) => t.max_weight != null);
        if (withWeight.length === 0) return null;
        const sorted = [...withWeight].sort((a, b) =>
            b.tracking_date.localeCompare(a.tracking_date)
        );
        return sorted[0].max_weight;
    }, [tracking]);

    const resolveSessionForDate = (trackingDate: string) =>
        findSessionByTrackingDate(sessions, trackingDate);

    return {
        clientId,
        exerciseId,
        exerciseName: exercise?.nombre ?? "Ejercicio",
        chartData,
        historyRows,
        latestWeight,
        resolveSessionForDate,
        isLoading:
            profileLoading || trackingLoading || exerciseLoading || sessionsLoading,
        isError: trackingError || exerciseError,
    };
}
