/**
 * useClientProgress.ts — Hook para datos de progreso y analytics
 *
 * Contexto:
 * - Gestiona datos de progreso físico del cliente
 * - Transforma datos para gráficos (Recharts)
 * - Calcula métricas derivadas (cambios, tendencias)
 *
 * Uso:
 * ```tsx
 * const { chartData, latestMetrics, trend } = useClientProgress(clientId);
 * ```
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import { useMemo } from "react";
import {
    useGetClientProgressHistoryQuery,
    useGetProgressAnalyticsQuery,
} from "../../api/clientsApi";
import type { ProgressAnalytics } from "../../types/progress";

interface UseClientProgressResult {
    // Raw data
    progressHistory: ReturnType<typeof useGetClientProgressHistoryQuery>["data"];
    analytics: ProgressAnalytics | undefined;

    // Transformed data for charts
    weightChartData: Array<{ date: string; weight: number | null }>;
    bmiChartData: Array<{ date: string; bmi: number | null }>;

    // Latest metrics
    latestWeight: number | null;
    latestBmi: number | null;
    latestHeight: number | null;

    // Changes
    weightChange: number | null;
    bmiChange: number | null;
    trend: ProgressAnalytics["progress_trend"] | null;

    // States
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook para gestión de progreso del cliente
 */
export const useClientProgress = (clientId: number): UseClientProgressResult => {
    const {
        data: progressHistory,
        isLoading: isLoadingHistory,
        error: historyError,
        refetch: refetchHistory,
    } = useGetClientProgressHistoryQuery({ clientId, skip: 0, limit: 100 });

    const {
        data: analytics,
        isLoading: isLoadingAnalytics,
        error: analyticsError,
        refetch: refetchAnalytics,
    } = useGetProgressAnalyticsQuery(clientId);

    // Transform data for weight chart
    const weightChartData = useMemo(() => {
        if (!progressHistory) return [];
        return progressHistory
            .map((record) => ({
                date: record.fecha_registro,
                weight: record.peso,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [progressHistory]);

    // Transform data for BMI chart
    const bmiChartData = useMemo(() => {
        if (!progressHistory) return [];
        return progressHistory
            .map((record) => ({
                date: record.fecha_registro,
                bmi: record.imc,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [progressHistory]);

    // Latest metrics
    const latestRecord = useMemo(() => {
        if (!progressHistory || progressHistory.length === 0) return null;
        return progressHistory.reduce((latest, current) =>
            new Date(current.fecha_registro) > new Date(latest.fecha_registro)
                ? current
                : latest
        );
    }, [progressHistory]);

    const latestWeight = latestRecord?.peso ?? null;
    const latestBmi = latestRecord?.imc ?? null;
    const latestHeight = latestRecord?.altura ?? null;

    // Changes from analytics
    const weightChange = analytics?.weight_change_kg ?? null;
    const bmiChange = analytics?.bmi_change ?? null;
    const trend = analytics?.progress_trend ?? null;

    // Refetch all
    const refetch = () => {
        refetchHistory();
        refetchAnalytics();
    };

    return {
        progressHistory,
        analytics,
        weightChartData,
        bmiChartData,
        latestWeight,
        latestBmi,
        latestHeight,
        weightChange,
        bmiChange,
        trend,
        isLoading: isLoadingHistory || isLoadingAnalytics,
        error: historyError || analyticsError,
        refetch,
    };
};