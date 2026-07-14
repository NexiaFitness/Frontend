/**
 * useClientOverviewPulse.ts — Orquestador view-model cockpit tab Resumen (UX-OVERVIEW).
 * Contexto: centraliza queries RTK/hooks; componentes solo renderizan el view-model.
 */

import { useCallback, useMemo } from "react";
import type { Client } from "@nexia/shared/types/client";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useCoherence } from "@nexia/shared/hooks/clients/useCoherence";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import {
    useGetClientTrainingSessionsQuery,
    useGetClientTestResultsQuery,
    useGetClientRatingsQuery,
    useGetClientLoadInsightsQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetClientHabitInsightsQuery } from "@nexia/shared/api/habitsApi";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlanRecommendationsQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { buildOverviewViewModel } from "./clientOverviewPulseSelectors";
import type {
    ClientOverviewPulseViewModel,
    ClientOverviewPulseLoadingFlags,
} from "./clientOverviewPulse.types";

export interface UseClientOverviewPulseOptions {
    clientId: number;
    client: Client | undefined;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    coherencePeriod?: "week";
    enabled?: boolean;
}

export function useClientOverviewPulse(
    options: UseClientOverviewPulseOptions,
): ClientOverviewPulseViewModel {
    const {
        clientId,
        client,
        trainingPlans = [],
        isLoadingPlans = false,
        enabled = true,
    } = options;

    const isValidClientId = enabled && clientId > 0;
    const skip = !isValidClientId;

    const {
        data: coherenceData,
        isLoading: isLoadingCoherence,
        isError: isCoherenceError,
    } = useCoherence(isValidClientId ? clientId : 0, undefined, undefined, undefined, "week");

    const {
        progressHistory,
        latestWeight,
        weightChange,
        trend,
        isLoading: isLoadingProgress,
        error: progressError,
        refetch: refetchProgress,
    } = useClientProgress(isValidClientId ? clientId : 0, client);

    const {
        avgPreFatigue,
        avgPostFatigue,
        currentRiskLevel,
        isLoading: isLoadingFatigue,
        refetch: refetchFatigue,
    } = useClientFatigue(isValidClientId ? clientId : 0);

    const {
        data: sessions = [],
        isLoading: isLoadingSessions,
        isError: isSessionsError,
        refetch: refetchSessions,
    } = useGetClientTrainingSessionsQuery(
        { clientId: isValidClientId ? clientId : 0, skip: 0, limit: 1000 },
        { skip },
    );

    const {
        data: loadInsights,
        isLoading: isLoadingLoadInsights,
        isError: isLoadInsightsError,
        refetch: refetchLoadInsights,
    } = useGetClientLoadInsightsQuery(isValidClientId ? clientId : 0, { skip });

    const {
        activeInjuries = [],
        isLoadingActive: isLoadingInjuries,
    } = useClientInjuries({
        clientId: isValidClientId ? clientId : 0,
        includeHistory: false,
    });

    const {
        data: testResults = [],
        isLoading: isLoadingTests,
        refetch: refetchTests,
    } = useGetClientTestResultsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip },
    );

    const { data: habitInsights, refetch: refetchHabits } = useGetClientHabitInsightsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip },
    );

    const { data: ratings = [], refetch: refetchRatings } = useGetClientRatingsQuery(
        { clientId: isValidClientId ? clientId : 0, skip: 0, limit: 50 },
        { skip },
    );

    const { data: activePlan, refetch: refetchActivePlan } = useGetActivePlanByClientQuery(
        clientId,
        { skip },
    );

    const {
        data: recommendations,
        isLoading: isLoadingRecommendations,
        refetch: refetchRecommendations,
    } = useGetTrainingPlanRecommendationsQuery(
        { clientId: isValidClientId ? clientId : 0 },
        { skip },
    );

    const loadingFlags: ClientOverviewPulseLoadingFlags = useMemo(
        () => ({
            coherence: isLoadingCoherence,
            progress: isLoadingProgress,
            fatigue: isLoadingFatigue,
            sessions: isLoadingSessions,
            loadInsights: isLoadingLoadInsights,
            injuries: isLoadingInjuries,
            tests: isLoadingTests,
            plans: isLoadingPlans,
            recommendations: isLoadingRecommendations,
        }),
        [
            isLoadingCoherence,
            isLoadingProgress,
            isLoadingFatigue,
            isLoadingSessions,
            isLoadingLoadInsights,
            isLoadingInjuries,
            isLoadingTests,
            isLoadingPlans,
            isLoadingRecommendations,
        ],
    );

    const isLoading =
        isLoadingCoherence || isLoadingSessions || isLoadingLoadInsights;

    const isError = isCoherenceError || isSessionsError || isLoadInsightsError;

    const progressIsRealError =
        progressError &&
        typeof progressError === "object" &&
        "status" in progressError &&
        progressError.status !== 404;

    const viewModelCore = useMemo(
        () =>
            buildOverviewViewModel({
                clientId,
                client,
                coherence: coherenceData,
                latestWeight,
                weightChange,
                trend,
                avgPreFatigue,
                avgPostFatigue,
                currentRiskLevel,
                sessions,
                loadInsights: loadInsights ?? null,
                activeInjuries,
                testResults,
                progressHistory,
                activePlan: activePlan ?? null,
                trainingPlans,
                recommendations: recommendations ?? null,
                habitInsights,
                ratings,
                isError: isError || Boolean(progressIsRealError),
            }),
        [
            clientId,
            client,
            coherenceData,
            latestWeight,
            weightChange,
            trend,
            avgPreFatigue,
            avgPostFatigue,
            currentRiskLevel,
            sessions,
            loadInsights,
            activeInjuries,
            testResults,
            progressHistory,
            activePlan,
            trainingPlans,
            recommendations,
            habitInsights,
            ratings,
            isError,
            progressIsRealError,
        ],
    );

    const refetch = useCallback(() => {
        void refetchProgress();
        void refetchFatigue();
        void refetchSessions();
        void refetchLoadInsights();
        void refetchTests();
        void refetchHabits();
        void refetchRatings();
        void refetchActivePlan();
        void refetchRecommendations();
    }, [
        refetchProgress,
        refetchFatigue,
        refetchSessions,
        refetchLoadInsights,
        refetchTests,
        refetchHabits,
        refetchRatings,
        refetchActivePlan,
        refetchRecommendations,
    ]);

    return useMemo(
        () => ({
            ...viewModelCore,
            isLoading,
            loadingFlags,
            refetch,
        }),
        [viewModelCore, isLoading, loadingFlags, refetch],
    );
}
