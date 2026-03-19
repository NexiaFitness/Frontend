/**
 * hooks/metrics/useWeeklyMetrics.ts - Hook para métricas semanales
 * Obtiene y formatea datos de CID semanal para gráficos.
 * Migrado a V2: usa useGetWeeklyMetricsV2Query (POST /metrics/weekly).
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWeeklyMetricsV2Query } from "../../api/metricsApiV2";
import type { CIDCalcIn } from "../../types/metrics";

interface UseWeeklyMetricsParams {
    items: CIDCalcIn[];
    startDate: string; // ISO date
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

export const useWeeklyMetrics = ({ items, startDate }: UseWeeklyMetricsParams): UseWeeklyMetricsReturn => {
    const queryArg = items.length > 0 && startDate ? { items, start_date: startDate } : skipToken;
    const { data, isLoading, error, refetch: refetchQuery } = useGetWeeklyMetricsV2Query(queryArg);

    const chartData = useMemo<WeeklyMetricsChartData[]>(() => {
        if (!data?.buckets) return [];
        return data.buckets.map((bucket) => ({
            week: bucket.week_start,
            cid: bucket.cid_sum,
            volume: 0,
            intensity: 0,
            monotony: undefined,
            strain: undefined,
        }));
    }, [data]);

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
        refetchQuery();
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

