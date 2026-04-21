/**
 * useClientInjuries.ts — Hook principal para gestión de lesiones del cliente
 *
 * Consume getClientInjuries (active_only=false) que ya devuelve
 * joint_name_es y movement_name_es desde el backend.
 * Solo enriquece muscle_name_es desde la query de músculos.
 *
 * @author Nelson Valero
 * @since v5.7.0
 * @updated v7.1.0 — Query unificada, name_es nativo del backend
 */

import { useMemo } from "react";
import {
    useGetClientInjuriesQuery,
    useGetMusclesQuery,
} from "../../api/injuriesApi";
import type { InjuryWithDetails } from "../../types/injuries";

interface UseClientInjuriesParams {
    clientId: number;
    /** @deprecated No longer used — all injuries are fetched in a single query */
    includeHistory?: boolean;
}

interface UseClientInjuriesResult {
    injuries: InjuryWithDetails[];
    activeInjuries: InjuryWithDetails[];
    isLoading: boolean;
    /** @deprecated Alias for isLoading */
    isLoadingActive: boolean;
    /** @deprecated Alias for isLoading */
    isLoadingHistory: boolean;
    activeCount: number;
    hasActiveInjuries: boolean;
    totalCount: number;
    /** @deprecated Alias for totalCount */
    totalInjuries: number;
}

export const useClientInjuries = ({
    clientId,
}: UseClientInjuriesParams): UseClientInjuriesResult => {
    const {
        data: injuriesRaw,
        isLoading,
    } = useGetClientInjuriesQuery({ clientId, activeOnly: false });

    const { data: musclesData } = useGetMusclesQuery();

    const muscles = Array.isArray(musclesData) ? musclesData : [];
    const injuriesList = Array.isArray(injuriesRaw) ? injuriesRaw : [];

    const injuries: InjuryWithDetails[] = useMemo(() => {
        return injuriesList.map((injury) => {
            const muscle = injury.affected_muscle_id
                ? muscles.find((m) => m.id === injury.affected_muscle_id)
                : undefined;
            return {
                ...injury,
                muscle_name: muscle?.name ?? injury.muscle_name,
                muscle_name_es: muscle?.name_es ?? muscle?.name ?? injury.muscle_name_es,
            };
        });
    }, [injuriesList, muscles]);

    const activeInjuries = useMemo(
        () => injuries.filter((i) => i.is_active),
        [injuries],
    );

    return {
        injuries,
        activeInjuries,
        isLoading,
        isLoadingActive: isLoading,
        isLoadingHistory: isLoading,
        activeCount: activeInjuries.length,
        hasActiveInjuries: activeInjuries.length > 0,
        totalCount: injuries.length,
        totalInjuries: injuries.length,
    };
};
