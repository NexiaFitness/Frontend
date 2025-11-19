/**
 * useKPIs.ts — Hooks para KPIs del Trainer Dashboard
 *
 * Contexto:
 * - Hooks para métricas clave del dashboard (improvement, satisfaction, adherence)
 * - Usa RTK Query para consumir endpoints reales del backend
 * - Transforma datos del backend (snake_case) a formato frontend (camelCase)
 * - Mantiene misma interfaz que mocks para compatibilidad
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useSelector } from "react-redux";
import {
    useGetClientImprovementAvgQuery,
    useGetClientSatisfactionAvgQuery,
} from "../../api/clientsApi";
import { useGetPlanAdherenceStatsQuery } from "../../api/trainingPlansApi";
import type { RootState } from "../../store";
import type {
    ClientImprovementResponse,
    ClientSatisfactionResponse,
    PlanAdherenceResponse,
} from "../../types/dashboard";

// ========================================
// CLIENT IMPROVEMENT
// ========================================

interface UseClientImprovementReturn {
    value: number;
    trend: string;
    label: string;
    description: string;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Hook para obtener promedio de mejora de clientes
 * Endpoint: GET /api/v1/clients/improvement-avg
 */
export const useClientImprovement = (): UseClientImprovementReturn => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    const { data, isLoading, isError } = useGetClientImprovementAvgQuery(undefined, {
        skip: !isAuthenticated,
        // ✅ FASE 1.2: Solo refetch si está autenticado
        refetchOnMountOrArgChange: isAuthenticated,
        refetchOnFocus: false,
        refetchOnReconnect: isAuthenticated,
    });

    return {
        value: data?.average ?? 0,
        trend: data?.trend ?? "",
        label: "Avg Client Improvement",
        description: "across all programs",
        isLoading,
        isError,
    };
};

// ========================================
// CLIENT SATISFACTION
// ========================================

interface UseClientSatisfactionReturn {
    value: string;
    trend: string;
    label: string;
    description: string;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Hook para obtener promedio de satisfacción de clientes
 * Endpoint: GET /api/v1/clients/satisfaction-avg
 */
export const useClientSatisfaction = (): UseClientSatisfactionReturn => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    const { data, isLoading, isError } = useGetClientSatisfactionAvgQuery(undefined, {
        skip: !isAuthenticated,
        // ✅ FASE 1.2: Solo refetch si está autenticado
        refetchOnMountOrArgChange: isAuthenticated,
        refetchOnFocus: false,
        refetchOnReconnect: isAuthenticated,
    });

    // Transformar rating numérico a formato "X.X/5"
    const formattedValue = data?.rating ? `${data.rating.toFixed(1)}/5` : "0.0/5";

    return {
        value: formattedValue,
        trend: data?.trend ?? "",
        label: "Client Satisfaction",
        description: "post-session feedback",
        isLoading,
        isError,
    };
};

// ========================================
// PLAN ADHERENCE
// ========================================

interface UsePlanAdherenceReturn {
    value: number;
    trend: string;
    label: string;
    description: string;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Hook para obtener estadísticas de adherencia de planes
 * Endpoint: GET /api/v1/training-plans/adherence-stats
 */
export const usePlanAdherence = (): UsePlanAdherenceReturn => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    const { data, isLoading, isError } = useGetPlanAdherenceStatsQuery(undefined, {
        skip: !isAuthenticated,
        // ✅ FASE 1.2: Solo refetch si está autenticado
        refetchOnMountOrArgChange: isAuthenticated,
        refetchOnFocus: false,
        refetchOnReconnect: isAuthenticated,
    });

    return {
        value: data?.adherence_percentage ?? 0,
        trend: data?.trend ?? "",
        label: "Plan Adherence",
        description: "planned vs executed",
        isLoading,
        isError,
    };
};


