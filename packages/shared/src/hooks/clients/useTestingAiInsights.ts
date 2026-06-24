/**
 * useTestingAiInsights — Spec 01 F2 generación de insight IA en tab Tests.
 */

import { useCallback, useState } from "react";
import { useCreateTestingAiInsightsMutation } from "../../api/clientsApi";
import type { TestingAiInsightsOut } from "../../types/testing";

export interface UseTestingAiInsightsResult {
    insight: TestingAiInsightsOut | null;
    isLoading: boolean;
    error: string | null;
    generateInsight: (forceRefresh?: boolean) => Promise<void>;
    resetInsight: () => void;
}

export function useTestingAiInsights(clientId: number): UseTestingAiInsightsResult {
    const [createInsight, { isLoading }] = useCreateTestingAiInsightsMutation();
    const [insight, setInsight] = useState<TestingAiInsightsOut | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateInsight = useCallback(
        async (forceRefresh = false) => {
            setError(null);
            try {
                const result = await createInsight({
                    clientId,
                    body: { force_refresh: forceRefresh },
                }).unwrap();
                setInsight(result);
            } catch (err) {
                const message =
                    err &&
                    typeof err === "object" &&
                    "data" in err &&
                    err.data &&
                    typeof err.data === "object" &&
                    "detail" in err.data
                        ? String((err.data as { detail: unknown }).detail)
                        : "No se pudo generar el insight.";
                setError(message);
            }
        },
        [clientId, createInsight],
    );

    const resetInsight = useCallback(() => {
        setInsight(null);
        setError(null);
    }, []);

    return {
        insight,
        isLoading,
        error,
        generateInsight,
        resetInsight,
    };
}
