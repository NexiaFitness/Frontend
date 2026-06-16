/**
 * useAthleteFeedbackHistory.ts — Historial feedback atleta (F1-FE-02).
 */

import { useMemo } from "react";
import { useGetClientFeedbackQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";

export function useAthleteFeedbackHistory() {
    const { clientId } = useAthleteContext();

    const { data, isLoading, isError, refetch } = useGetClientFeedbackQuery(
        { clientId: clientId ?? 0, limit: 50 },
        { skip: !clientId }
    );

    const { data: sessions = [] } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const sessionNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const session of sessions) {
            if (session.session_name) {
                map.set(session.id, session.session_name);
            }
        }
        return map;
    }, [sessions]);

    return {
        clientId,
        feedbackItems: data ?? [],
        sessionNameById,
        isLoading,
        isError,
        refetch,
    };
}
