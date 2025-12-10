/**
 * api/metricsApi.ts - RTK Query endpoints para cálculo de cargas y métricas
 * Endpoints para normalización, cálculos de carga, CID, agregaciones y alertas
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { baseApi } from "./baseApi";
import type {
    NormalizeIntensityRequest,
    NormalizedIntensityResponse,
    NormalizeVolumeRequest,
    NormalizedVolumeResponse,
    FuerzaCalcRequest,
    FuerzaCalcResponse,
    AerobicCalcRequest,
    AerobicCalcResponse,
    AnaerobicCalcRequest,
    AnaerobicCalcResponse,
    CalculateCIDRequest,
    CIDCalculation,
    DailyMetricsRequest,
    DailyMetricsResponse,
    WeeklyMetricsRequest,
    WeeklyMetricsResponse,
    MonthlyMetricsRequest,
    MonthlyMetricsResponse,
    TotalLoadRequest,
    TotalLoadResponse,
    CheckThresholdsRequest,
    CheckThresholdsResponse,
} from "../types/metrics";

export const metricsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /metrics/normalize-intensity
        normalizeIntensity: builder.mutation<NormalizedIntensityResponse, NormalizeIntensityRequest>({
            query: (data) => ({
                url: "/metrics/normalize-intensity",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics"],
        }),

        // POST /metrics/fuerza-calc
        calculateFuerza: builder.mutation<FuerzaCalcResponse, FuerzaCalcRequest>({
            query: (data) => ({
                url: "/metrics/fuerza-calc",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/aerobic-calc
        calculateAerobic: builder.mutation<AerobicCalcResponse, AerobicCalcRequest>({
            query: (data) => ({
                url: "/metrics/aerobic-calc",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/anaerobic-calc
        calculateAnaerobic: builder.mutation<AnaerobicCalcResponse, AnaerobicCalcRequest>({
            query: (data) => ({
                url: "/metrics/anaerobic-calc",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/cid
        calculateCID: builder.mutation<CIDCalculation, CalculateCIDRequest>({
            query: (data) => ({
                url: "/metrics/cid",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/daily
        getDailyMetrics: builder.mutation<DailyMetricsResponse, DailyMetricsRequest>({
            query: (data) => ({
                url: "/metrics/daily",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/weekly
        getWeeklyMetrics: builder.mutation<WeeklyMetricsResponse, WeeklyMetricsRequest>({
            query: (data) => ({
                url: "/metrics/weekly",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/monthly
        getMonthlyMetrics: builder.mutation<MonthlyMetricsResponse, MonthlyMetricsRequest>({
            query: (data) => ({
                url: "/metrics/monthly",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/total-load
        getTotalLoad: builder.mutation<TotalLoadResponse, TotalLoadRequest>({
            query: (data) => ({
                url: "/metrics/total-load",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/check-thresholds
        checkThresholds: builder.mutation<CheckThresholdsResponse, CheckThresholdsRequest>({
            query: (data) => ({
                url: "/metrics/check-thresholds",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics", "Client"],
        }),

        // POST /metrics/normalize-volume
        normalizeVolume: builder.mutation<NormalizedVolumeResponse, NormalizeVolumeRequest>({
            query: (data) => ({
                url: "/metrics/normalize-volume",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Metrics"],
        }),
    }),
});

export const {
    useNormalizeIntensityMutation,
    useCalculateFuerzaMutation,
    useCalculateAerobicMutation,
    useCalculateAnaerobicMutation,
    useCalculateCIDMutation,
    useGetDailyMetricsMutation,
    useGetWeeklyMetricsMutation,
    useGetMonthlyMetricsMutation,
    useGetTotalLoadMutation,
    useCheckThresholdsMutation,
    useNormalizeVolumeMutation,
} = metricsApi;

