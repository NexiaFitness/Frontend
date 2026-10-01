/**
 * useAthleteSessionsList.ts — Lista de sesiones atleta (V02).
 * Contexto: portal atleta F0.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useMemo, useState, useCallback } from "react";

function formatIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

/** B5: ventana atleta −60 / +60 días respecto a hoy (UTC calendar). */
function athleteSessionsDateWindow(): { dateFrom: string; dateTo: string } {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 60);
    const to = new Date(today);
    to.setDate(to.getDate() + 60);
    return { dateFrom: formatIsoDate(from), dateTo: formatIsoDate(to) };
}
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
    refreshSessions: () => Promise<void>;
}

export function useAthleteSessionsList(): UseAthleteSessionsListResult {
    const { clientId } = useAthleteContext();
    const [filter, setFilter] = useState<AthleteSessionFilter>("all");

    const dateWindow = useMemo(() => athleteSessionsDateWindow(), []);

    const {
        data: allSessions = [],
        isLoading,
        isError,
        refetch,
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

    const refreshSessions = useCallback(async () => {
        await refetch();
    }, [refetch]);

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
        refreshSessions,
    };
}
