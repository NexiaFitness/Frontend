/**
 * hooks/metrics/useWeeklyMetrics.ts - Hook para métricas semanales
 * Obtiene y formatea datos de CID semanal para gráficos
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import React from "react";
import { useMemo } from "react";
import { useGetWeeklyMetricsMutation } from "../../api/metricsApi";
import type { WeeklyMetricsRequest, CIDCalcIn } from "../../types/metrics";

interface UseWeeklyMetricsParams {
    items: CIDCalcIn[]; // Array de items para calcular CID
    startDate: string; // ISO date - fecha de inicio
}

interface WeeklyMetricsChartData {
    week: string;
    cid: number;
    volume: number;
    intensity: number;
    monotony?: number;
    strain?: number;
}

type UseWeeklyMetricsReturn = {
    chartData: WeeklyMetricsChartData[];
    trend: "up" | "down" | "stable";
    isLoading: boolean;
    error: unknown;
    latestWeek?: WeeklyMetricsChartData;
    refetch: () => void;
};

const buildRequest = (params: UseWeeklyMetricsParams): WeeklyMetricsRequest => ({
    items: params.items,
    start_date: params.startDate,
});

export const useWeeklyMetrics = ({ items, startDate }: UseWeeklyMetricsParams): UseWeeklyMetricsReturn => {
    const [getWeeklyMetrics, { data, isLoading, error }] = useGetWeeklyMetricsMutation();

    // Efecto para cargar datos automáticamente
    React.useEffect(() => {
        if (items.length > 0 && startDate) {
            getWeeklyMetrics(buildRequest({ items, startDate }));
        }
    }, [items, startDate, getWeeklyMetrics]);

    // Formatear datos para Recharts desde la respuesta del backend
    const chartData = useMemo<WeeklyMetricsChartData[]>(() => {
        if (!data?.buckets) return [];

        return data.buckets.map((bucket) => ({
            week: bucket.week_start,
            cid: bucket.cid_sum, // Usamos cid_sum como el CID total de la semana
            volume: 0, // No disponible en la respuesta actual
            intensity: 0, // No disponible en la respuesta actual
            monotony: undefined,
            strain: undefined,
        }));
    }, [data]);

    // Calcular tendencia
    const trend: UseWeeklyMetricsReturn["trend"] = useMemo(() => {
        if (chartData.length < 2) return "stable";
        const lastWeek = chartData[chartData.length - 1];
        const prevWeek = chartData[chartData.length - 2];
        if (!prevWeek.cid || prevWeek.cid === 0) return "stable";
        const change = ((lastWeek.cid - prevWeek.cid) / prevWeek.cid) * 100;
        if (change > 10) return "up";
        if (change < -10) return "down";
        return "stable";
    }, [chartData]);

    const refetch = () => {
        if (items.length > 0 && startDate) {
            getWeeklyMetrics(buildRequest({ items, startDate }));
        }
    };

    return {
        chartData,
        trend,
        isLoading,
        error,
        latestWeek: chartData[chartData.length - 1],
        refetch,
    };
};

