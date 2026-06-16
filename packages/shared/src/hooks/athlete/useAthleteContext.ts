/**
 * useAthleteContext.ts — Resuelve client_id del atleta autenticado.
 * Contexto: portal atleta F0, hook reutilizable sin DOM.
 * Contratos: agent.md §5, Swagger GET /clients/profile
 * @author Frontend Team
 * @since v6.1.0
 */

import { useSelector } from "react-redux";
import { useGetCurrentClientProfileQuery } from "../../api/clientsApi";
import type { RootState } from "../../store";
import type { Client } from "../../types/client";
import { USER_ROLES } from "../../utils/roles";

export interface AthleteContextValue {
    clientId: number | null;
    profile: Client | null;
    trainerId: number | null;
    isAthlete: boolean;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
}

export function useAthleteContext(): AthleteContextValue {
    const role = useSelector((state: RootState) => state.auth.user?.role);
    const isAthlete = role === USER_ROLES.ATHLETE;

    const {
        data: profile,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetCurrentClientProfileQuery(undefined, {
        skip: !isAthlete,
    });

    return {
        clientId: profile?.id ?? null,
        profile: profile ?? null,
        trainerId: profile?.trainer_id ?? null,
        isAthlete,
        isLoading: isAthlete && isLoading,
        isError: isAthlete && isError,
        error,
        refetch,
    };
}
