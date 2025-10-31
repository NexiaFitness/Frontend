/**
 * useClientFatigue.ts — Hook para análisis de fatiga del cliente
 *
 * Contexto:
 * - Gestiona datos de fatiga y recuperación del cliente
 * - Transforma datos para gráficos de fatiga/energía
 * - Calcula métricas de riesgo y recomendaciones
 *
 * Uso:
 * ```tsx
 * const { fatigueData, riskLevel, recommendations } = useClientFatigue(clientId);
 * ```
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import { useMemo } from "react";
import { useGetClientFatigueAnalysisQuery } from "../../api/clientsApi";
import type { FatigueAnalysis, RiskLevel } from "../../types/training";

interface UseClientFatigueResult {
    // Raw data
    fatigueAnalysis: FatigueAnalysis[] | undefined;

    // Transformed data for charts
    fatigueChartData: Array<{
        date: string;
        pre_fatigue: number | null;
        post_fatigue: number | null;
        fatigue_delta: number | null;
    }>;

    energyChartData: Array<{
        date: string;
        pre_energy: number | null;
        post_energy: number | null;
        energy_delta: number | null;
    }>;

    workloadChartData: Array<{
        date: string;
        workload_score: number | null;
        recovery_need_score: number | null;
    }>;

    // Latest metrics
    latestAnalysis: FatigueAnalysis | null;
    currentRiskLevel: RiskLevel | null;
    currentRecommendations: string | null;
    currentFatigueDelta: number | null;

    // Risk statistics
    riskDistribution: {
        low: number;
        medium: number;
        high: number;
    };

    // Average metrics
    avgPreFatigue: number | null;
    avgPostFatigue: number | null;
    avgFatigueDelta: number | null;
    avgWorkloadScore: number | null;
    avgRecoveryNeed: number | null;

    // States
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook para gestión de fatiga del cliente
 */
export const useClientFatigue = (clientId: number): UseClientFatigueResult => {
    const {
        data: fatigueAnalysis,
        isLoading,
        error,
        refetch,
    } = useGetClientFatigueAnalysisQuery({ clientId, skip: 0, limit: 100 });

    // Transform data for fatigue chart
    const fatigueChartData = useMemo(() => {
        if (!fatigueAnalysis) return [];
        return fatigueAnalysis
            .map((record) => ({
                date: record.analysis_date,
                pre_fatigue: record.pre_fatigue_level,
                post_fatigue: record.post_fatigue_level,
                fatigue_delta: record.fatigue_delta,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [fatigueAnalysis]);

    // Transform data for energy chart
    const energyChartData = useMemo(() => {
        if (!fatigueAnalysis) return [];
        return fatigueAnalysis
            .map((record) => ({
                date: record.analysis_date,
                pre_energy: record.pre_energy_level,
                post_energy: record.post_energy_level,
                energy_delta: record.energy_delta,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [fatigueAnalysis]);

    // Transform data for workload chart
    const workloadChartData = useMemo(() => {
        if (!fatigueAnalysis) return [];
        return fatigueAnalysis
            .map((record) => ({
                date: record.analysis_date,
                workload_score: record.workload_score,
                recovery_need_score: record.recovery_need_score,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [fatigueAnalysis]);

    // Latest analysis
    const latestAnalysis = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        return fatigueAnalysis.reduce((latest, current) =>
            new Date(current.analysis_date) > new Date(latest.analysis_date)
                ? current
                : latest
        );
    }, [fatigueAnalysis]);

    const currentRiskLevel = latestAnalysis?.risk_level ?? null;
    const currentRecommendations = latestAnalysis?.recommendations ?? null;
    const currentFatigueDelta = latestAnalysis?.fatigue_delta ?? null;

    // Risk distribution
    const riskDistribution = useMemo(() => {
        if (!fatigueAnalysis) return { low: 0, medium: 0, high: 0 };

        return fatigueAnalysis.reduce(
            (acc, record) => {
                if (record.risk_level === "low") acc.low++;
                else if (record.risk_level === "medium") acc.medium++;
                else if (record.risk_level === "high") acc.high++;
                return acc;
            },
            { low: 0, medium: 0, high: 0 }
        );
    }, [fatigueAnalysis]);

    // Average metrics
    const avgPreFatigue = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        const validRecords = fatigueAnalysis.filter(
            (r) => r.pre_fatigue_level !== null
        );
        if (validRecords.length === 0) return null;
        const sum = validRecords.reduce(
            (acc, r) => acc + (r.pre_fatigue_level ?? 0),
            0
        );
        return sum / validRecords.length;
    }, [fatigueAnalysis]);

    const avgPostFatigue = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        const validRecords = fatigueAnalysis.filter(
            (r) => r.post_fatigue_level !== null
        );
        if (validRecords.length === 0) return null;
        const sum = validRecords.reduce(
            (acc, r) => acc + (r.post_fatigue_level ?? 0),
            0
        );
        return sum / validRecords.length;
    }, [fatigueAnalysis]);

    const avgFatigueDelta = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        const validRecords = fatigueAnalysis.filter((r) => r.fatigue_delta !== null);
        if (validRecords.length === 0) return null;
        const sum = validRecords.reduce((acc, r) => acc + (r.fatigue_delta ?? 0), 0);
        return sum / validRecords.length;
    }, [fatigueAnalysis]);

    const avgWorkloadScore = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        const validRecords = fatigueAnalysis.filter(
            (r) => r.workload_score !== null
        );
        if (validRecords.length === 0) return null;
        const sum = validRecords.reduce(
            (acc, r) => acc + (r.workload_score ?? 0),
            0
        );
        return sum / validRecords.length;
    }, [fatigueAnalysis]);

    const avgRecoveryNeed = useMemo(() => {
        if (!fatigueAnalysis || fatigueAnalysis.length === 0) return null;
        const validRecords = fatigueAnalysis.filter(
            (r) => r.recovery_need_score !== null
        );
        if (validRecords.length === 0) return null;
        const sum = validRecords.reduce(
            (acc, r) => acc + (r.recovery_need_score ?? 0),
            0
        );
        return sum / validRecords.length;
    }, [fatigueAnalysis]);

    return {
        fatigueAnalysis,
        fatigueChartData,
        energyChartData,
        workloadChartData,
        latestAnalysis,
        currentRiskLevel,
        currentRecommendations,
        currentFatigueDelta,
        riskDistribution,
        avgPreFatigue,
        avgPostFatigue,
        avgFatigueDelta,
        avgWorkloadScore,
        avgRecoveryNeed,
        isLoading,
        error,
        refetch,
    };
};