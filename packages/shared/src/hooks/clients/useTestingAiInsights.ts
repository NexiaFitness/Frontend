/**
 * useTestingAiInsights — Spec 01 F2 insight IA en tab Tests (auto-load + stale).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    useCreateTestingAiInsightsMutation,
    useGetTestingAiInsightsQuery,
} from "../../api/clientsApi";
import type { TestingAiInsightsOut } from "../../types/testing";

export interface UseTestingAiInsightsOptions {
    /** When false, skips network (e.g. client without any test results). */
    enabled: boolean;
}

export interface UseTestingAiInsightsResult {
    insight: TestingAiInsightsOut | null;
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
    regenerateInsight: () => Promise<void>;
}

function extractErrorMessage(err: unknown): string {
    if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "detail" in err.data
    ) {
        return String((err.data as { detail: unknown }).detail);
    }
    return "No se pudo generar el insight.";
}

export function useTestingAiInsights(
    clientId: number,
    options: UseTestingAiInsightsOptions,
): UseTestingAiInsightsResult {
    const { enabled } = options;
    const autoGenerateAttempted = useRef(false);
    const [error, setError] = useState<string | null>(null);

    const {
        data: insight,
        isLoading: isFetching,
        isFetching: isRefetching,
    } = useGetTestingAiInsightsQuery(clientId, { skip: !enabled });

    const [createInsight, { isLoading: isGenerating }] =
        useCreateTestingAiInsightsMutation();

    const generateInsight = useCallback(
        async (forceRefresh: boolean) => {
            setError(null);
            try {
                await createInsight({
                    clientId,
                    body: { force_refresh: forceRefresh },
                }).unwrap();
            } catch (err) {
                setError(extractErrorMessage(err));
            }
        },
        [clientId, createInsight],
    );

    useEffect(() => {
        if (!enabled || isFetching || autoGenerateAttempted.current) {
            return;
        }
        if (insight && !insight.has_insight) {
            autoGenerateAttempted.current = true;
            void generateInsight(false);
        }
    }, [enabled, generateInsight, insight, isFetching]);

    useEffect(() => {
        autoGenerateAttempted.current = false;
        setError(null);
    }, [clientId]);

    const regenerateInsight = useCallback(async () => {
        await generateInsight(true);
    }, [generateInsight]);

    return {
        insight: insight ?? null,
        isLoading: enabled && (isFetching || isRefetching) && !insight?.has_insight,
        isGenerating,
        error,
        regenerateInsight,
    };
}
