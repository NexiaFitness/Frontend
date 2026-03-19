/**
 * useResolvedDay.ts — Hook para plan del día resuelto (Fase 2)
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 2
 */

import { useGetResolvedDayQuery } from "../../api/planningApi";
import type { ResolvedDayPlan } from "../../types/planningCargas";

interface UseResolvedDayParams {
    clientId: number | null | undefined;
    date: string | null | undefined; // YYYY-MM-DD
}

interface UseResolvedDayReturn {
    data: ResolvedDayPlan | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Obtiene el plan resuelto para un cliente y fecha (herencia mes → semana → día).
 */
export function useResolvedDay({
    clientId,
    date,
}: UseResolvedDayParams): UseResolvedDayReturn {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetResolvedDayQuery(
        { client_id: clientId!, date: date! },
        { skip: !clientId || !date }
    );

    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
    };
}
