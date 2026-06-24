/**
 * useClientExecutedLoadTrend — Tonnage ejecutado agregado por periodo (F5-FE-02).
 */

import { useMemo } from "react";
import { useGetClientExecutedLoadSummaryQuery } from "../../api/clientsApi";
import {
    aggregateExecutedLoadByPeriod,
    type ExecutedLoadTrendPeriod,
} from "../../utils/trainer/aggregateExecutedLoadTrend";

export interface UseClientExecutedLoadTrendOptions {
    clientId: number | null | undefined;
    startDate: string;
    endDate: string;
    period: ExecutedLoadTrendPeriod;
}

export function useClientExecutedLoadTrend({
    clientId,
    startDate,
    endDate,
    period,
}: UseClientExecutedLoadTrendOptions) {
    const resolvedId = clientId ?? 0;
    const skip = !clientId;

    const { data, isLoading, isFetching, error } =
        useGetClientExecutedLoadSummaryQuery(
            { clientId: resolvedId, fromDate: startDate, toDate: endDate },
            { skip },
        );

    const chartData = useMemo(
        () => aggregateExecutedLoadByPeriod(data?.by_session ?? [], period),
        [data?.by_session, period],
    );

    const summary = useMemo(() => {
        if (!data) return null;
        return {
            tonnageTotalKg: data.tonnage_total_kg,
            sessionsCount: data.sessions_count,
            rpeAdherencePct: data.rpe_adherence_pct,
        };
    }, [data]);

    return {
        chartData,
        summary,
        isLoading: isLoading || isFetching,
        error,
        isEmpty: !isLoading && chartData.length === 0,
    };
}
