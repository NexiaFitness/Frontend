/**
 * useDefaultSessionName.ts — Nombre autogenerado para CreateSession / EditSession (B15)
 */

import { useMemo } from "react";
import { useGetSessionRecommendationsQuery } from "../../api/trainingSessionsApi";
import { useGetPhysicalQualitiesQuery } from "../../api/catalogsApi";
import type { SessionRecommendationsWithValues } from "../../types/sessionRecommendations";
import {
    buildDefaultSessionName,
    resolvePhysicalQualityLabel,
} from "../../utils/sessionProgramming/buildDefaultSessionName";

export interface UseDefaultSessionNameParams {
    clientId: number | null | undefined;
    trainerId: number;
    sessionDate: string;
    isStandalone?: boolean;
    templateName?: string | null;
    enabled?: boolean;
}

function isRecommendationsWithValues(
    data: unknown,
): data is SessionRecommendationsWithValues {
    return (
        typeof data === "object" &&
        data !== null &&
        "has_planned_values" in data &&
        (data as SessionRecommendationsWithValues).has_planned_values === true
    );
}

export function useDefaultSessionName({
    clientId,
    trainerId,
    sessionDate,
    isStandalone = false,
    templateName = null,
    enabled = true,
}: UseDefaultSessionNameParams): string {
    const shouldFetch =
        enabled &&
        !isStandalone &&
        !templateName &&
        !!clientId &&
        clientId > 0 &&
        !!sessionDate &&
        trainerId > 0;

    const { data: recommendationsResponse } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId ?? 0,
            session_date: sessionDate,
            trainer_id: trainerId,
        },
        { skip: !shouldFetch },
    );

    const { data: qualityCatalog = [] } = useGetPhysicalQualitiesQuery(undefined, {
        skip: !shouldFetch,
    });

    return useMemo(() => {
        if (templateName?.trim()) {
            return buildDefaultSessionName({ sessionDate, templateName });
        }
        if (isStandalone) {
            return buildDefaultSessionName({ sessionDate, isStandalone: true });
        }

        if (isRecommendationsWithValues(recommendationsResponse)) {
            const rec = recommendationsResponse.recommendations;
            const qualityLabel = resolvePhysicalQualityLabel(
                rec.physical_quality,
                qualityCatalog,
            );
            const primaryPatternLabel = rec.movement_patterns?.[0]?.name_es ?? null;
            return buildDefaultSessionName({
                sessionDate,
                qualityLabel,
                primaryPatternLabel,
            });
        }

        return buildDefaultSessionName({ sessionDate });
    }, [
        sessionDate,
        isStandalone,
        templateName,
        recommendationsResponse,
        qualityCatalog,
    ]);
}
