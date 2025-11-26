/**
 * useGetScheduledSessions.ts — Hook para listar sesiones agendadas
 *
 * Contexto:
 * - Encapsula la lógica de obtención de sesiones agendadas con filtros
 * - Permite filtrar por trainer_id, client_id, rango de fechas
 * - Útil para calendarios y listas de sesiones
 *
 * Uso:
 * ```tsx
 * const { sessions, isLoading, error, refetch } = useGetScheduledSessions({
 *   trainer_id: 1,
 *   start_date: '2025-01-01',
 *   end_date: '2025-01-31'
 * });
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { useMemo } from "react";
import { useGetScheduledSessionsQuery } from "../../api/schedulingApi";
import type { ScheduledSessionsFilters, ScheduledSession } from "../../types/scheduling";

interface UseGetScheduledSessionsParams {
    trainer_id?: number | null;
    client_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    skip?: number;
    limit?: number;
}

interface UseGetScheduledSessionsResult {
    sessions: ScheduledSession[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
}

export const useGetScheduledSessions = (
    filters?: UseGetScheduledSessionsParams
): UseGetScheduledSessionsResult => {
    const queryFilters: ScheduledSessionsFilters = useMemo(
        () => ({
            trainer_id: filters?.trainer_id ?? null,
            client_id: filters?.client_id ?? null,
            start_date: filters?.start_date ?? null,
            end_date: filters?.end_date ?? null,
            skip: filters?.skip,
            limit: filters?.limit,
        }),
        [filters]
    );

    const {
        data: sessions = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useGetScheduledSessionsQuery(queryFilters, {
        skip: !queryFilters.trainer_id && !queryFilters.client_id,
    });

    return {
        sessions,
        isLoading,
        isError,
        error,
        refetch,
    };
};

