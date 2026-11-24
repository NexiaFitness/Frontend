/**
 * useAthleteSessionLoads.ts — Cargas por sesión + comparativa sesión anterior.
 */

import { useMemo } from "react";
import { useGetClientProgressTrackingQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useExerciseNamesByIds } from "@nexia/shared/hooks/exercises";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    buildSessionLoadsWithComparison,
    findPreviousCompletedSession,
} from "@nexia/shared/utils/athlete/athleteProgressUtils";

export function useAthleteSessionLoads(sessionDate: string | null | undefined) {
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const { data: tracking = [], isLoading: trackingLoading } =
        useGetClientProgressTrackingQuery(
            { clientId: clientId ?? 0, limit: 300 },
            { skip: !clientId || !sessionDate }
        );

    const { data: sessions = [], isLoading: sessionsLoading } =
        useGetTrainingSessionsByClientQuery(clientId ?? 0, { skip: !clientId });

    const trackedExerciseIds = useMemo(() => tracking.map((row) => row.exercise_id), [tracking]);
    const { namesById: exerciseNames, isLoading: exerciseNamesLoading } =
        useExerciseNamesByIds(trackedExerciseIds);

    const loads = useMemo(() => {
        if (!sessionDate) return [];
        return buildSessionLoadsWithComparison(
            tracking,
            sessions,
            sessionDate,
            exerciseNames
        );
    }, [tracking, sessions, sessionDate, exerciseNames]);

    const previousSession = useMemo(() => {
        if (!sessionDate) return undefined;
        return findPreviousCompletedSession(sessions, sessionDate);
    }, [sessions, sessionDate]);

    return {
        loads,
        previousSession,
        isLoading: profileLoading || trackingLoading || sessionsLoading || exerciseNamesLoading,
    };
}
