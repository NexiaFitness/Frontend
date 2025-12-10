/**
 * api/metricsApiV2.ts - RTK Query endpoints V2 para cálculo de cargas y métricas
 * 
 * Contexto:
 * - API V2 alineada 100% con contratos reales del backend
 * - NO reemplaza metricsApi.ts legacy
 * - Usa tipos V2 de metricsV2.ts
 * - Endpoints: /metrics/daily, /metrics/monthly, /metrics/check-thresholds, /metrics/total-load
 * 
 * Diferencia con legacy:
 * - Legacy: usa tipos que esperan client_id, trainer_id, date/month individuales
 * - V2: usa tipos que esperan items: CIDCalcIn[] y start_date (contrato real)
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 1: Preparación V2
 */

import { baseApi } from "./baseApi";
import type {
    WeeklyMetricsRequestV2,
    WeeklyMetricsResponseV2,
    DailyMetricsRequestV2,
    DailyMetricsResponseV2,
    MonthlyMetricsRequestV2,
    MonthlyMetricsResponseV2,
    CheckThresholdsRequestV2,
    CheckThresholdsResponseV2,
    TotalLoadRequestV2,
    TotalLoadResponseV2,
} from "../types/metricsV2";

/**
 * API V2 para métricas
 * 
 * Endpoints implementados:
 * - POST /metrics/weekly - Métricas semanales (items + start_date)
 * - POST /metrics/daily - Métricas diarias (items + start_date)
 * - POST /metrics/monthly - Métricas mensuales (items + start_date + w_fase)
 * - POST /metrics/check-thresholds - Verificación de umbrales (items + start_date + thresholds)
 * - POST /metrics/total-load - Carga total combinada (cargas parciales + pesos)
 */
export const metricsApiV2 = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /metrics/weekly
        getWeeklyMetricsV2: builder.mutation<WeeklyMetricsResponseV2, WeeklyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/weekly",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/daily
        getDailyMetricsV2: builder.mutation<DailyMetricsResponseV2, DailyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/daily",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/monthly
        getMonthlyMetricsV2: builder.mutation<MonthlyMetricsResponseV2, MonthlyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/monthly",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/check-thresholds
        checkThresholdsV2: builder.mutation<CheckThresholdsResponseV2, CheckThresholdsRequestV2>({
            query: (data) => ({
                url: "/metrics/check-thresholds",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/total-load
        getTotalLoadV2: builder.mutation<TotalLoadResponseV2, TotalLoadRequestV2>({
            query: (data) => ({
                url: "/metrics/total-load",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics"],
        }),
    }),
});

/**
 * Hooks exportados para uso en componentes V2
 */
export const {
    useGetWeeklyMetricsV2Mutation,
    useGetDailyMetricsV2Mutation,
    useGetMonthlyMetricsV2Mutation,
    useCheckThresholdsV2Mutation,
    useGetTotalLoadV2Mutation,
} = metricsApiV2;

