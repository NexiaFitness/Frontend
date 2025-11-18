/**
 * useClientProgressCategories.ts — Hook para categorías de progreso del dashboard
 *
 * Contexto:
 * - Usa RTK Query para consumir endpoint real de progress categories
 * - Transforma datos del backend (snake_case) a formato frontend (camelCase)
 * - Mantiene misma interfaz que mock para compatibilidad
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useGetClientProgressCategoriesQuery } from "../../api/clientsApi";

interface UseClientProgressCategoriesReturn {
    onTrack: number;
    behindSchedule: number;
    needAttention: number;
    overall: number;
    trend: string;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Hook para obtener categorías de progreso de clientes
 * Endpoint: GET /api/v1/clients/progress-categories
 */
export const useClientProgressCategories = (): UseClientProgressCategoriesReturn => {
    const { data, isLoading, isError } = useGetClientProgressCategoriesQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
        refetchOnReconnect: true,
    });

    return {
        onTrack: data?.on_track ?? 0,
        behindSchedule: data?.behind_schedule ?? 0,
        needAttention: data?.need_attention ?? 0,
        overall: data?.overall_percentage ?? 0,
        trend: data?.trend ?? "",
        isLoading,
        isError,
    };
};

