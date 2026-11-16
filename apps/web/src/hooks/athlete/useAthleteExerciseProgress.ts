/**
 * useAthleteExerciseProgress.ts — Detalle progreso por ejercicio (V11 F2).
 * El nombre sale del tracking (B-15), no del catálogo paginado.
 */

import { useMemo } from "react";
import { useGetClientExerciseProgressTrackingQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { AthleteExerciseProgressLocationState } from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import { isBodyweightLoadType } from "@nexia/shared/utils/athlete/athleteProgressLoadDelta";
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

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const exerciseName = useMemo(() => {
        const fromNav = locationState?.exerciseName?.trim();
        if (fromNav) return fromNav;
        const fromTracking = tracking.find((row) => row.exercise_name?.trim())
            ?.exercise_name?.trim();
        return fromTracking || "Ejercicio";
    }, [locationState?.exerciseName, tracking]);

    const isBodyweightExercise = useMemo(
        () => tracking.some((row) => isBodyweightLoadType(row.tipo_carga)),
        [tracking]
    );

    const chartData = useMemo(() => {
        if (isBodyweightExercise) return [];
        return buildExerciseProgressChart(tracking).filter(
            (point) => point.weight == null || point.weight > 0
        );
    }, [isBodyweightExercise, tracking]);

    const highlightDate =
        highlightDateOverride ??
        (locationState?.highlightDate
            ? normalizeTrackingDateKey(locationState.highlightDate)
            : null);

    const entry = locationState?.entry ?? "progress";

    const historyRows = useMemo(() => {
        const rows = buildExerciseHistoryTable(tracking, 10, highlightDate);
        if (!isBodyweightExercise) return rows;
        return rows.map((row) => ({ ...row, max_weight: null }));
    }, [highlightDate, isBodyweightExercise, tracking]);

    const personalBestWeight = useMemo(() => {
        if (isBodyweightExercise) return null;
        const weights = tracking
            .map((t) => t.max_weight)
            .filter((w): w is number => w != null && w > 0);
        return weights.length > 0 ? Math.max(...weights) : null;
    }, [isBodyweightExercise, tracking]);

    const latestWeight = useMemo(() => {
        if (isBodyweightExercise) return null;
        const withWeight = tracking.filter(
            (t) => t.max_weight != null && t.max_weight > 0
        );
        if (withWeight.length === 0) return null;
        const sorted = [...withWeight].sort((a, b) =>
            b.tracking_date.localeCompare(a.tracking_date)
        );
        return sorted[0].max_weight;
    }, [isBodyweightExercise, tracking]);

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
        isBodyweightExercise,
        resolveSessionForDate,
        isLoading: profileLoading || trackingLoading || sessionsLoading,
        isError: trackingError,
    };
}
