/**
 * useAthleteExerciseProgress.ts — Detalle progreso por ejercicio (V11 F2).
 */

import { useMemo } from "react";
import { useGetClientExerciseProgressTrackingQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises/useExercises";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { AthleteExerciseProgressLocationState } from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import {
    buildExerciseHistoryTable,
    buildExerciseProgressChart,
    findSessionByTrackingDate,
    normalizeTrackingDateKey,
} from "@nexia/shared/utils/athlete/athleteProgressUtils";

export function useAthleteExerciseProgress(
    exerciseId: number,
    locationState?: AthleteExerciseProgressLocationState | null,
    highlightDateOverride?: string | null
) {
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const {
        data: tracking = [],
        isLoading: trackingLoading,
        isError: trackingError,
    } = useGetClientExerciseProgressTrackingQuery(
        { clientId: clientId ?? 0, exerciseId, limit: 100 },
        { skip: !clientId || !exerciseId }
    );

    const { data: exerciseList, isLoading: exercisesLoading } = useGetExercisesQuery(
        { skip: 0, limit: 500 },
        { skip: !clientId || !exerciseId }
    );

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const exerciseName = useMemo(() => {
        if (locationState?.exerciseName) return locationState.exerciseName;
        const fromList = exerciseList?.exercises?.find((ex) => ex.id === exerciseId);
        return fromList?.nombre ?? "Ejercicio";
    }, [locationState?.exerciseName, exerciseList?.exercises, exerciseId]);

    const chartData = useMemo(
        () =>
            buildExerciseProgressChart(tracking).filter(
                (point) => point.weight == null || point.weight > 0
            ),
        [tracking]
    );

    const highlightDate =
        highlightDateOverride ??
        (locationState?.highlightDate
            ? normalizeTrackingDateKey(locationState.highlightDate)
            : null);

    const entry = locationState?.entry ?? "progress";

    const historyRows = useMemo(
        () => buildExerciseHistoryTable(tracking, 10, highlightDate),
        [tracking, highlightDate]
    );

    const personalBestWeight = useMemo(() => {
        const weights = tracking
            .map((t) => t.max_weight)
            .filter((w): w is number => w != null && w > 0);
        return weights.length > 0 ? Math.max(...weights) : null;
    }, [tracking]);

    const latestWeight = useMemo(() => {
        const withWeight = tracking.filter(
            (t) => t.max_weight != null && t.max_weight > 0
        );
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
        exerciseName,
        entry,
        highlightDate,
        chartData,
        historyRows,
        latestWeight,
        personalBestWeight,
        resolveSessionForDate,
        isLoading:
            profileLoading || trackingLoading || exercisesLoading || sessionsLoading,
        isError: trackingError,
    };
}
