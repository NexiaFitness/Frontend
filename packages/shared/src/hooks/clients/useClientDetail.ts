/**
 * useClientDetail.ts — Hook principal para Client Detail Page
 *
 * Contexto:
 * - Orquesta todos los datos necesarios para la vista de detalle
 * - Combina: datos básicos, progreso, training plans, sesiones
 * - Maneja loading states unificados
 *
 * Uso:
 * ```tsx
 * const { client, isLoading, error } = useClientDetail(clientId);
 * ```
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import { useMemo } from "react";
import {
    useGetClientQuery,
    useGetClientProgressHistoryQuery,
    useGetProgressAnalyticsQuery,
    useGetClientTrainingPlansQuery,
    useGetClientTrainingSessionsQuery,
} from "../../api/clientsApi";

interface UseClientDetailParams {
    clientId: number;
    includeProgress?: boolean;
    includePlans?: boolean;
    includeSessions?: boolean;
}

interface UseClientDetailResult {
    // Client data
    client: ReturnType<typeof useGetClientQuery>["data"];
    isLoadingClient: boolean;
    clientError: unknown;

    // Progress data
    progressHistory: ReturnType<typeof useGetClientProgressHistoryQuery>["data"];
    progressAnalytics: ReturnType<typeof useGetProgressAnalyticsQuery>["data"];
    isLoadingProgress: boolean;
    progressError: unknown;

    // Training plans
    trainingPlans: ReturnType<typeof useGetClientTrainingPlansQuery>["data"];
    isLoadingPlans: boolean;
    plansError: unknown;

    // Training sessions
    trainingSessions: ReturnType<typeof useGetClientTrainingSessionsQuery>["data"];
    isLoadingSessions: boolean;
    sessionsError: unknown;

    // Global states
    isLoading: boolean;
    hasError: boolean;
    refetchAll: () => void;
}

/**
 * Hook principal para Client Detail
 * Carga todos los datos necesarios para la vista de detalle del cliente
 */
export const useClientDetail = ({
    clientId,
    includeProgress = true,
    includePlans = true,
    includeSessions = true,
}: UseClientDetailParams): UseClientDetailResult => {
    // Client base data
    const {
        data: client,
        isLoading: isLoadingClient,
        error: clientError,
        refetch: refetchClient,
    } = useGetClientQuery(clientId);

    // Progress data
    const {
        data: progressHistory,
        isLoading: isLoadingProgressHistory,
        error: progressHistoryError,
        refetch: refetchProgressHistory,
    } = useGetClientProgressHistoryQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: !includeProgress }
    );

    const {
        data: progressAnalytics,
        isLoading: isLoadingAnalytics,
        error: analyticsError,
        refetch: refetchAnalytics,
    } = useGetProgressAnalyticsQuery(clientId, { skip: !includeProgress });

    // Training plans
    const {
        data: trainingPlans,
        isLoading: isLoadingPlans,
        error: plansError,
        refetch: refetchPlans,
    } = useGetClientTrainingPlansQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: !includePlans }
    );

    // Training sessions
    const {
        data: trainingSessions,
        isLoading: isLoadingSessions,
        error: sessionsError,
        refetch: refetchSessions,
    } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: !includeSessions }
    );

    // Combined loading states
    const isLoadingProgress = isLoadingProgressHistory || isLoadingAnalytics;
    const progressError = progressHistoryError || analyticsError;

    const isLoading =
        isLoadingClient ||
        (includeProgress && isLoadingProgress) ||
        (includePlans && isLoadingPlans) ||
        (includeSessions && isLoadingSessions);

    const hasError = !!clientError;

    // Refetch all data
    const refetchAll = () => {
        refetchClient();
        if (includeProgress) {
            refetchProgressHistory();
            refetchAnalytics();
        }
        if (includePlans) refetchPlans();
        if (includeSessions) refetchSessions();
    };

    return {
        client,
        isLoadingClient,
        clientError,
        progressHistory,
        progressAnalytics,
        isLoadingProgress,
        progressError,
        trainingPlans,
        isLoadingPlans,
        plansError,
        trainingSessions,
        isLoadingSessions,
        sessionsError,
        isLoading,
        hasError,
        refetchAll,
    };
};