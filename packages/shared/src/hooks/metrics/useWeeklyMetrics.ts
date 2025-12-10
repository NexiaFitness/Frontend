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
import type { WeeklyMetricsRequest } from "../../types/metrics";

interface UseWeeklyMetricsParams {
    clientId: number;
    startDate: string; // ISO date
    endDate: string; // ISO date
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
    client_id: params.clientId,
    start_date: params.startDate,
    end_date: params.endDate,
});

export const useWeeklyMetrics = ({ clientId, startDate, endDate }: UseWeeklyMetricsParams): UseWeeklyMetricsReturn => {
    const [getWeeklyMetrics, { data, isLoading, error }] = useGetWeeklyMetricsMutation();

    // Efecto para cargar datos automáticamente
    React.useEffect(() => {
        if (clientId && startDate && endDate) {
            getWeeklyMetrics(buildRequest({ clientId, startDate, endDate }));
        }
    }, [clientId, startDate, endDate, getWeeklyMetrics]);

    // Formatear datos para Recharts
    const chartData = useMemo<WeeklyMetricsChartData[]>(() => {
        if (!data) return [];

        const weeks = (data as any).weeks ?? [];
        if (!Array.isArray(weeks)) return [];

        return weeks.map((week: any) => ({
            week: week.week_label ?? week.week_start ?? week.week_start_date ?? week.week ?? "",
            cid: week.total_cid ?? week.cid ?? 0,
            volume: week.total_volume ?? 0,
            intensity: week.average_intensity ?? week.avg_intensity ?? 0,
            monotony: week.monotony,
            strain: week.strain,
        }));
    }, [data]);

    // Calcular tendencia
    const trend: UseWeeklyMetricsReturn["trend"] = useMemo(() => {
        if (chartData.length < 2) return "stable";
        const lastWeek = chartData[chartData.length - 1];
        const prevWeek = chartData[chartData.length - 2];
        if (!prevWeek.cid) return "stable";
        const change = ((lastWeek.cid - prevWeek.cid) / prevWeek.cid) * 100;
        if (change > 10) return "up";
        if (change < -10) return "down";
        return "stable";
    }, [chartData]);

    const refetch = () => getWeeklyMetrics(buildRequest({ clientId, startDate, endDate }));

    return {
        chartData,
        trend,
        isLoading,
        error,
        latestWeek: chartData[chartData.length - 1],
        refetch,
    };
};

