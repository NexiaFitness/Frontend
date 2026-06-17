/**
 * useAthletePostSessionCelebration.ts — Orquestación V06 post-sesión (F3d-FE-01).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useGetPostSessionReportQuery } from "@nexia/shared/api/trainingSessionsApi";
import {
    useGetAthleteWeeklySummaryQuery,
    usePostAiWeeklySummaryMutation,
} from "@nexia/shared/api/athleteApi";
import type { AiWeeklySummary } from "@nexia/shared/types/athleteAiWeeklySummary";
import type { AthleteWeeklySummary } from "@nexia/shared/types/athleteWeeklySummary";
import type { PostSessionReport } from "@nexia/shared/types/trainingSessions";
import {
    buildPostSessionCelebrationCopy,
    shouldFetchPostSessionAiInsight,
    type PostSessionCelebrationCopy,
} from "@nexia/shared/utils/athlete/athletePostSessionAiInsight";

function buildWeeklyTemplateFallback(
    weekly: AthleteWeeklySummary
): AiWeeklySummary | undefined {
    const highlights = weekly.highlights.filter(Boolean);
    if (highlights.length === 0) {
        return undefined;
    }
    return {
        client_id: weekly.client_id,
        week_start: weekly.week_start,
        week_end: weekly.week_end,
        summary_text: highlights.join(" "),
        source: "template",
        generated_at: new Date().toISOString(),
        model: null,
    };
}

export interface AthletePostSessionCelebrationState {
    report: PostSessionReport | undefined;
    celebration: PostSessionCelebrationCopy | null;
    completionPercent: number;
    aiInsight: AiWeeklySummary | undefined;
    showAiInsight: boolean;
    isAiLoading: boolean;
    isLoading: boolean;
    isError: boolean;
}

export function useAthletePostSessionCelebration(
    sessionId: number
): AthletePostSessionCelebrationState {
    const {
        data: report,
        isLoading: reportLoading,
        isError: reportError,
    } = useGetPostSessionReportQuery(sessionId, {
        skip: !sessionId,
    });

    const {
        data: weeklySummary,
        isLoading: weeklyLoading,
    } = useGetAthleteWeeklySummaryQuery(undefined, {
        skip: !report,
    });

    const eligibleForAi = useMemo(
        () =>
            Boolean(
                report &&
                    shouldFetchPostSessionAiInsight({ report, weeklySummary })
            ),
        [report, weeklySummary]
    );

    const [postAiSummary] = usePostAiWeeklySummaryMutation();
    const [aiInsight, setAiInsight] = useState<AiWeeklySummary | undefined>();
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSlotActive, setAiSlotActive] = useState(false);
    const requestKeyRef = useRef<string | null>(null);

    useEffect(() => {
        setAiInsight(undefined);
        setIsAiLoading(false);
        setAiSlotActive(false);
        requestKeyRef.current = null;
    }, [sessionId]);

    useEffect(() => {
        if (!eligibleForAi || !report || !weeklySummary) {
            return;
        }

        const requestKey = `${sessionId}:${weeklySummary.week_start}`;
        if (requestKeyRef.current === requestKey) {
            return;
        }
        requestKeyRef.current = requestKey;
        setAiSlotActive(true);
        setIsAiLoading(true);

        let cancelled = false;

        void postAiSummary({
            week_start: weeklySummary.week_start,
            force_refresh: false,
        })
            .unwrap()
            .then((data) => {
                if (!cancelled) {
                    setAiInsight(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAiInsight(buildWeeklyTemplateFallback(weeklySummary));
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsAiLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [eligibleForAi, postAiSummary, report, sessionId, weeklySummary]);

    const celebration = useMemo(() => {
        if (!report) {
            return null;
        }
        return buildPostSessionCelebrationCopy(report, weeklySummary);
    }, [report, weeklySummary]);

    const completionPercent = report
        ? Math.round(report.completion_percentage)
        : 0;

    return {
        report,
        celebration,
        completionPercent,
        aiInsight,
        showAiInsight: aiSlotActive,
        isAiLoading,
        isLoading: reportLoading || (Boolean(report) && weeklyLoading),
        isError: reportError,
    };
}
