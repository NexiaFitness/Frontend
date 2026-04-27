/**
 * usePlanBlockAnalytics.ts — Carga plan + bloques + sesiones (paginado) y expone métricas D1–D4, D3, D7.
 *
 * @see docs/specs/SPEC_TAB_GRAFICOS_PLAN_ENTRENAMIENTO.md
 */

import { useEffect, useMemo, useState } from "react";
import { useGetTrainingPlanQuery } from "../../api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "../../api/periodBlocksApi";
import { useLazyGetTrainingSessionsQuery } from "../../api/trainingSessionsApi";
import type { PlanPeriodBlock } from "../../types/planningCargas";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    computePlanBlockAnalytics,
    PLAN_ANALYTICS_DEVIATION_RATIO,
    PLAN_ANALYTICS_SESSION_FETCH_MAX,
    PLAN_ANALYTICS_SESSION_PAGE_SIZE,
    type PlanBlockAnalyticsResult,
    type PlanBlockAnalyticsSession,
} from "../../analytics/planBlockAnalytics";

function toPlanBlockSession(s: TrainingSession): PlanBlockAnalyticsSession {
    return {
        id: s.id,
        session_name: s.session_name,
        period_block_id: s.period_block_id,
        session_date: s.session_date,
        is_generic_session: s.is_generic_session,
        status: s.status,
        is_active: s.is_active,
        planned_volume: s.planned_volume,
        planned_intensity: s.planned_intensity,
        actual_volume: s.actual_volume,
        actual_intensity: s.actual_intensity,
    };
}

export interface UsePlanBlockAnalyticsResult {
    analytics: PlanBlockAnalyticsResult | null;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    sessionsTruncated: boolean;
    sessionsLoaded: number;
    blocks: import("../../types/planningCargas").PlanPeriodBlock[];
    sessions: TrainingSession[];
}

export function usePlanBlockAnalytics(
    planId: number | null | undefined
): UsePlanBlockAnalyticsResult {
    const skip = planId == null || planId === 0;

    const {
        data: plan,
        isLoading: planLoading,
        isError: planIsError,
        error: planError,
    } = useGetTrainingPlanQuery(planId!, { skip });

    const {
        data: blocks = [],
        isLoading: blocksLoading,
        isError: blocksIsError,
        error: blocksError,
    } = useGetPeriodBlocksQuery(planId!, { skip });

    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [sessionsTruncated, setSessionsTruncated] = useState(false);
    const [sessionFetchDone, setSessionFetchDone] = useState(false);
    const [sessionFetchError, setSessionFetchError] = useState<unknown>(null);

    const [triggerSessions] = useLazyGetTrainingSessionsQuery();

    useEffect(() => {
        if (skip) {
            return;
        }
        let cancelled = false;
        setSessions([]);
        setSessionsTruncated(false);
        setSessionFetchDone(false);
        setSessionFetchError(null);

        (async () => {
            try {
                const all: TrainingSession[] = [];
                let skipIdx = 0;
                while (skipIdx < PLAN_ANALYTICS_SESSION_FETCH_MAX) {
                    const chunk = await triggerSessions({
                        trainingPlanId: planId!,
                        skip: skipIdx,
                        limit: PLAN_ANALYTICS_SESSION_PAGE_SIZE,
                    }).unwrap();
                    if (cancelled) {
                        return;
                    }
                    all.push(...chunk);
                    if (all.length >= PLAN_ANALYTICS_SESSION_FETCH_MAX) {
                        setSessionsTruncated(true);
                        break;
                    }
                    if (chunk.length < PLAN_ANALYTICS_SESSION_PAGE_SIZE) {
                        break;
                    }
                    skipIdx += chunk.length;
                }
                if (!cancelled) {
                    setSessions(all);
                }
            } catch (e) {
                if (!cancelled) {
                    setSessionFetchError(e);
                }
            } finally {
                if (!cancelled) {
                    setSessionFetchDone(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [skip, planId, triggerSessions]);

    const analytics = useMemo(() => {
        if (!plan || !sessionFetchDone || sessionFetchError) {
            return null;
        }
        return computePlanBlockAnalytics(
            blocks,
            sessions.map(toPlanBlockSession),
            plan.start_date,
            plan.end_date,
            { deviationRatio: PLAN_ANALYTICS_DEVIATION_RATIO }
        );
    }, [plan, blocks, sessions, sessionFetchDone, sessionFetchError]);

    const isLoading = skip ? false : planLoading || blocksLoading || !sessionFetchDone;
    const isError = skip
        ? false
        : planIsError || blocksIsError || sessionFetchError != null;
    const error = planIsError
        ? planError
        : blocksIsError
          ? blocksError
          : sessionFetchError;

    return {
        analytics,
        isLoading,
        isError,
        error,
        sessionsTruncated,
        sessionsLoaded: sessions.length,
        blocks: skip ? [] : blocks,
        sessions: skip ? [] : sessions,
    };
}
