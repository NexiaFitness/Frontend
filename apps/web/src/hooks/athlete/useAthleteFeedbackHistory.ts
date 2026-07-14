/**
 * useAthleteFeedbackHistory.ts — Feedback atleta + nombres sesión (V12 / peek sheet).
 * Contexto: portal atleta F3a/F3b, lógica compartida página + sheet.
 * Contratos: agent.md §5
 * @author Frontend Team
 * @since v6.2.0
 */

import { useMemo } from "react";
import { useGetClientFeedbackQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import type { ClientFeedback } from "@nexia/shared/types/training";
import { sortFeedbackNewestFirst } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";

export interface AthleteFeedbackHistoryData {
    clientId: number | undefined;
    sorted: ClientFeedback[];
    sessionNames: Map<number, string>;
    isLoading: boolean;
    getSessionName: (sessionId: number) => string;
}

export function useAthleteFeedbackHistory(limit = 50): AthleteFeedbackHistoryData {
    const { clientId, isLoading: profileLoading } = useAthleteContext();

    const { data: feedbackList = [], isLoading: feedbackLoading } =
        useGetClientFeedbackQuery({ clientId: clientId ?? 0, limit }, { skip: !clientId });

    const { data: sessions = [] } = useGetTrainingSessionsByClientQuery(clientId ?? 0, {
        skip: !clientId,
    });

    const sessionNames = useMemo(() => {
        const map = new Map<number, string>();
        for (const s of sessions) {
            map.set(s.id, s.session_name);
        }
        return map;
    }, [sessions]);

    const sorted = useMemo(() => sortFeedbackNewestFirst(feedbackList), [feedbackList]);

    const getSessionName = (sessionId: number) =>
        sessionNames.get(sessionId) ?? `Sesión #${sessionId}`;

    return {
        clientId: clientId ?? undefined,
        sorted,
        sessionNames,
        isLoading: profileLoading || feedbackLoading,
        getSessionName,
    };
}
