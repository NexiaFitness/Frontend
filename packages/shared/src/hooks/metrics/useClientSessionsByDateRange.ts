/**
 * hooks/metrics/useClientSessionsByDateRange.ts
 * 
 * Hook V2 para obtener sesiones de cliente filtradas por rango de fechas
 * 
 * Contexto:
 * - Hook independiente del sistema legacy
 * - Usa useGetClientTrainingSessionsQuery pero filtra en frontend
 * - Preparado para integración con módulo METRICS V2
 * 
 * Nota:
 * - El backend no soporta filtrado por rango de fechas directamente
 * - Por lo tanto, obtenemos todas las sesiones y filtramos en frontend
 * - Para optimización futura, considerar paginación o límite de sesiones
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 1: Preparación V2
 */

import { useMemo } from "react";
import { useGetClientTrainingSessionsQuery } from "../../api/clientsApi";
import type { TrainingSession } from "../../types/training";

export interface UseClientSessionsByDateRangeParams {
    clientId: number;
    startDate: string; // ISO date (YYYY-MM-DD)
    endDate: string; // ISO date (YYYY-MM-DD)
    skip?: number;
    limit?: number;
}

export interface UseClientSessionsByDateRangeResult {
    sessionsFiltradas: TrainingSession[];
    allSessions: TrainingSession[];
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Obtiene sesiones de entrenamiento de un cliente filtradas por rango de fechas
 * 
 * @param params - Parámetros: clientId, startDate, endDate, skip, limit
 * @returns Sesiones filtradas, estado de carga, error y función refetch
 * 
 * @example
 * ```typescript
 * const { sessionsFiltradas, isLoading } = useClientSessionsByDateRange({
 *   clientId: 1,
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 * });
 * ```
 */
export function useClientSessionsByDateRange(
    params: UseClientSessionsByDateRangeParams
): UseClientSessionsByDateRangeResult {
    const { clientId, startDate, endDate, skip = 0, limit = 1000 } = params;

    // Obtener todas las sesiones del cliente (sin filtro de fecha en backend)
    const {
        data: allSessions = [],
        isLoading,
        error,
        refetch: refetchQuery,
    } = useGetClientTrainingSessionsQuery({
        clientId,
        skip,
        limit,
    });

    // Filtrar sesiones por rango de fechas en frontend
    const sessionsFiltradas = useMemo(() => {
        if (!allSessions || allSessions.length === 0) {
            return [];
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Asegurar que endDate incluya todo el día
        end.setHours(23, 59, 59, 999);

        return allSessions.filter((session) => {
            if (!session.session_date) {
                return false;
            }

            const sessionDate = new Date(session.session_date);
            
            // Filtrar por rango inclusivo
            return sessionDate >= start && sessionDate <= end;
        });
    }, [allSessions, startDate, endDate]);

    const refetch = () => {
        refetchQuery();
    };

    return {
        sessionsFiltradas,
        allSessions,
        isLoading,
        error,
        refetch,
    };
}

