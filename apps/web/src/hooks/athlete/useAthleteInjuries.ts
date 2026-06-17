/**
 * useAthleteInjuries.ts — Lesiones activas del atleta (F2-FE-09).
 */

import { useGetClientInjuriesQuery } from "@nexia/shared/api/injuriesApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";

export function useAthleteInjuries() {
    const { clientId } = useAthleteContext();

    const { data, isLoading, isError } = useGetClientInjuriesQuery(
        { clientId: clientId ?? 0, activeOnly: true },
        { skip: !clientId }
    );

    const activeInjuries = data ?? [];

    return {
        activeInjuries,
        hasActiveInjuries: activeInjuries.length > 0,
        isLoading,
        isError,
    };
}
