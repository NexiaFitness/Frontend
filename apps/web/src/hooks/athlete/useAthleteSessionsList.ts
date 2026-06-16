/**
 * useAthleteSessionsList.ts — Lista de sesiones atleta (V02).
 * Contexto: portal atleta F0.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useMemo, useState } from "react";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    filterAthleteSessions,
    type AthleteSessionFilter,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface UseAthleteSessionsListResult {
    sessions: TrainingSession[];
    filter: AthleteSessionFilter;
    setFilter: (filter: AthleteSessionFilter) => void;
    isLoading: boolean;
    isError: boolean;
}

export function useAthleteSessionsList(): UseAthleteSessionsListResult {
    const { clientId } = useAthleteContext();
    const [filter, setFilter] = useState<AthleteSessionFilter>("all");

    const {
        data: allSessions = [],
        isLoading,
        isError,
    } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const sessions = useMemo(
        () => filterAthleteSessions(allSessions, filter),
        [allSessions, filter]
    );

    return {
        sessions,
        filter,
        setFilter,
        isLoading,
        isError,
    };
}
