/**
 * api/metricsApiV2.ts - RTK Query endpoints V2 para cálculo de cargas y métricas
 * 
 * Contexto:
 * - API V2 alineada 100% con contratos reales del backend
 * - V1 (metricsApi.ts) eliminado en Sprint 1 - TICK-D03
 * - Usa tipos V2 de metricsV2.ts
 * - Endpoints: /metrics/daily, /metrics/monthly, /metrics/check-thresholds, /metrics/total-load
 * 
 * Diferencia con legacy:
 * - Legacy: usa tipos que esperan client_id, trainer_id, date/month individuales
 * - V2: usa tipos que esperan items: CIDCalcIn[] y start_date (contrato real)
 * 
 * IMPORTANTE: Estos endpoints son queries (no mutations) porque son cálculos idempotentes.
 * Se usan con skipToken para evitar llamadas cuando no hay datos válidos.
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 1: Preparación V2
 * @updated v6.4.0 - Convertido de mutations a queries con skipToken para evitar 422
 */

import { baseApi } from "./baseApi";
import type { CIDCalcIn } from "../types/metrics";
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
    CidCalcOutV2,
} from "../types/metricsV2";

/**
 * API V2 para métricas
 * 
 * Endpoints implementados como queries (no mutations) porque son cálculos idempotentes:
 * - POST /metrics/weekly - Métricas semanales (items + start_date)
 * - POST /metrics/daily - Métricas diarias (items + start_date)
 * - POST /metrics/monthly - Métricas mensuales (items + start_date + w_fase)
 * - POST /metrics/check-thresholds - Verificación de umbrales (items + start_date + thresholds)
 * - POST /metrics/total-load - Carga total combinada (cargas parciales + pesos)
 * 
 * Nota: Aunque son POST, se definen como queries porque son operaciones de lectura/cálculo.
 * Se usan con skipToken para evitar llamadas cuando no hay datos válidos.
 */
export const metricsApiV2 = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /metrics/weekly - Convertido a query
        getWeeklyMetricsV2: builder.query<WeeklyMetricsResponseV2, WeeklyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/weekly",
                method: "POST",
                body: data,
            }),
            providesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/daily - Convertido a query
        getDailyMetricsV2: builder.query<DailyMetricsResponseV2, DailyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/daily",
                method: "POST",
                body: data,
            }),
            providesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/monthly - Convertido a query
        getMonthlyMetricsV2: builder.query<MonthlyMetricsResponseV2, MonthlyMetricsRequestV2>({
            query: (data) => ({
                url: "/metrics/monthly",
                method: "POST",
                body: data,
            }),
            providesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/check-thresholds - Convertido a query
        checkThresholdsV2: builder.query<CheckThresholdsResponseV2, CheckThresholdsRequestV2>({
            query: (data) => ({
                url: "/metrics/check-thresholds",
                method: "POST",
                body: data,
            }),
            providesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/total-load - Mantenido como mutation (puede mutar estado)
        getTotalLoadV2: builder.mutation<TotalLoadResponseV2, TotalLoadRequestV2>({
            query: (data) => ({
                url: "/metrics/total-load",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics"],
        }),

        // POST /metrics/cid - Cálculo CID único (idempotente, query para uso con lazy)
        calculateCidV2: builder.query<CidCalcOutV2, CIDCalcIn>({
            query: (data) => ({
                url: "/metrics/cid",
                method: "POST",
                body: data,
            }),
            providesTags: ["Metrics"],
        }),
    }),
});

/**
 * Hooks exportados para uso en componentes V2
 * 
 * Nota: Los hooks de queries se usan con skipToken cuando no hay datos válidos.
 * Ejemplo:
 * ```typescript
 * import { skipToken } from '@reduxjs/toolkit/query';
 * const { data } = useGetWeeklyMetricsV2Query(
 *   items.length > 0 && actualStartDate ? { items, start_date: actualStartDate } : skipToken
 * );
 * ```
 */
export const {
    useGetWeeklyMetricsV2Query,
    useGetDailyMetricsV2Query,
    useGetMonthlyMetricsV2Query,
    useCheckThresholdsV2Query,
    useLazyCheckThresholdsV2Query,
    useGetTotalLoadV2Mutation,
    useCalculateCidV2Query,
    useLazyCalculateCidV2Query,
} = metricsApiV2;

