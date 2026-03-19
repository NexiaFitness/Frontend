/**
 * billingApi.ts — API de facturación usando RTK Query
 *
 * Contexto:
 * - Define endpoints para estadísticas de billing del dashboard
 * - Integrado con sistema RBAC (trainers solo sus propios datos)
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { baseApi } from "./baseApi";
import type { BillingStatsResponse, BillingPeriod } from "../types/dashboard";

export const billingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Obtener estadísticas de billing
         * Endpoint: GET /api/v1/billing/stats?period=monthly|annual
         */
        getBillingStats: builder.query<BillingStatsResponse, BillingPeriod>({
            query: (period) => {
                const params = new URLSearchParams();
                params.append("period", period);

                return {
                    url: `/billing/stats?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Client", id: "DASHBOARD_BILLING" }],
        }),
    }),
    overrideExisting: false,
});

// ========================================
// Hooks auto-generados por RTK Query
// ========================================
export const { useGetBillingStatsQuery } = billingApi;


