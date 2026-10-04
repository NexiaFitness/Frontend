/**
 * useAthleteSessionsList.ts — Lista de sesiones atleta (V02).
 * Contexto: portal atleta F0.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useMemo, useState, useCallback } from "react";
import { useGetAthleteSessionsRegistrationMetaQuery } from "@nexia/shared/api/athleteApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { AthleteRunSessionRegistrationMetaRow } from "@nexia/shared/types/athleteRunProgress";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    filterAthleteSessions,
    type AthleteSessionFilter,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

function formatLocalIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** B5: ventana atleta −60 / +60 días respecto a hoy (calendario local). */
function athleteSessionsDateWindow(): { dateFrom: string; dateTo: string } {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
    return { dateFrom: formatLocalIsoDate(from), dateTo: formatLocalIsoDate(to) };
}

export interface UseAthleteSessionsListResult {
    sessions: TrainingSession[];
    registrationMetaBySessionId: Map<number, AthleteRunSessionRegistrationMetaRow>;
    filter: AthleteSessionFilter;
    setFilter: (filter: AthleteSessionFilter) => void;
    isLoading: boolean;
    isError: boolean;
    refreshSessions: () => Promise<void>;
}

export function useAthleteSessionsList(): UseAthleteSessionsListResult {
    const { clientId } = useAthleteContext();
    const [filter, setFilter] = useState<AthleteSessionFilter>("upcoming");

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

    const { data: registrationMetaPage, refetch: refetchMeta } =
        useGetAthleteSessionsRegistrationMetaQuery(
            {
                dateFrom: dateWindow.dateFrom,
                dateTo: dateWindow.dateTo,
            },
            { skip: !clientId }
        );

    const registrationMetaBySessionId = useMemo(() => {
        const map = new Map<number, AthleteRunSessionRegistrationMetaRow>();
        for (const row of registrationMetaPage?.items ?? []) {
            map.set(row.training_session_id, row);
        }
        return map;
    }, [registrationMetaPage?.items]);

    const refreshSessions = useCallback(async () => {
        await Promise.all([refetch(), refetchMeta()]);
    }, [refetch, refetchMeta]);

    const sessions = useMemo(
        () => filterAthleteSessions(allSessions, filter),
        [allSessions, filter]
    );

    return {
        sessions,
        registrationMetaBySessionId,
        filter,
        setFilter,
        isLoading,
        isError,
        refreshSessions,
    };
}
