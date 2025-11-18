/**
 * useBillingStats.ts — Hook para estadísticas de billing del dashboard
 *
 * Contexto:
 * - Usa RTK Query para consumir endpoint real de billing
 * - Transforma datos del backend a formato esperado por componentes
 * - Mantiene misma interfaz que mock para compatibilidad
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useGetBillingStatsQuery } from "../../api/billingApi";
import type { BillingPeriod } from "../../types/dashboard";

interface UseBillingStatsReturn {
    data: Array<{
        month: string;
        revenue: number;
        clients: number;
    }>;
    summary: {
        current: number;
        growth: string;
        revenue: string;
        year: number;
    };
    isLoading: boolean;
    isError: boolean;
}

/**
 * Hook para obtener estadísticas de billing
 * Endpoint: GET /api/v1/billing/stats?period=monthly|annual
 *
 * @param period - Periodo de facturación (monthly o annual)
 */
export const useBillingStats = (period: BillingPeriod = "monthly"): UseBillingStatsReturn => {
    const { data, isLoading, isError } = useGetBillingStatsQuery(period, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
        refetchOnReconnect: true,
    });

    return {
        data: data?.data ?? [],
        summary: data?.summary ?? {
            current: 0,
            growth: "",
            revenue: "$0",
            year: new Date().getFullYear(),
        },
        isLoading,
        isError,
    };
};
