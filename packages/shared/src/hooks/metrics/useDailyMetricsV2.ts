/**
 * hooks/metrics/useDailyMetricsV2.ts - Hook V2 para métricas diarias
 * 
 * Contexto:
 * - Hook V2 que obtiene sesiones, las transforma y calcula métricas diarias
 * - Usa useClientSessionsByDateRange y transformSessionsToCIDCalcIn
 * - Consume POST /metrics/daily con contrato real del backend
 * - NO reemplaza hooks legacy
 * 
 * Flujo:
 * 1. Obtener sesiones del cliente en rango de fechas
 * 2. Transformar sesiones → CIDCalcIn[]
 * 3. Llamar a POST /metrics/daily con items + start_date
 * 4. Retornar días con CID calculado
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 2: Integración V2
 */

import React from "react";
import { useMemo } from "react";
import { useGetDailyMetricsV2Mutation } from "../../api/metricsApiV2";
import { useClientSessionsByDateRange } from "./useClientSessionsByDateRange";
import { transformSessionsToCIDCalcInWithDates } from "../../utils/metrics/transformSessionsToCIDCalcIn";
import type { DailyMetricsResponseV2, DailyCIDItemV2 } from "../../types/metricsV2";

export interface UseDailyMetricsV2Params {
    clientId: number;
    startDate: string; // ISO date (YYYY-MM-DD)
    endDate: string; // ISO date (YYYY-MM-DD)
}

export interface UseDailyMetricsV2Result {
    items: ReturnType<typeof transformSessionsToCIDCalcInWithDates>["items"]; // Items transformados
    dateMapping: ReturnType<typeof transformSessionsToCIDCalcInWithDates>["dateMapping"]; // Mapeo de fechas reales
    data: DailyMetricsResponseV2 | undefined; // Resultado del endpoint
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook V2 para obtener métricas diarias de CID
 * 
 * @param params - clientId, startDate, endDate
 * @returns Items transformados, resultado del endpoint, estado de carga y error
 * 
 * @example
 * ```typescript
 * const { items, data, isLoading } = useDailyMetricsV2({
 *   clientId: 1,
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 * });
 * ```
 */
export function useDailyMetricsV2(
    params: UseDailyMetricsV2Params
): UseDailyMetricsV2Result {
    const { clientId, startDate, endDate } = params;

    // Paso 1: Obtener sesiones filtradas por rango de fechas
    const {
        sessionsFiltradas,
        isLoading: isLoadingSessions,
        error: sessionsError,
        refetch: refetchSessions,
    } = useClientSessionsByDateRange({
        clientId,
        startDate,
        endDate,
    });

    // Paso 2: Transformar sesiones → CIDCalcIn[] con mapeo de fechas
    const { items, dateMapping } = useMemo(() => {
        return transformSessionsToCIDCalcInWithDates(sessionsFiltradas);
    }, [sessionsFiltradas]);

    // Paso 3: Llamar a POST /metrics/daily
    const [getDailyMetricsV2, { data, isLoading: isLoadingMetrics, error: metricsError }] =
        useGetDailyMetricsV2Mutation();

    // Efecto para cargar métricas cuando hay items disponibles
    React.useEffect(() => {
        if (items.length > 0 && startDate) {
            getDailyMetricsV2({
                items,
                start_date: startDate,
            });
        }
    }, [items, startDate, getDailyMetricsV2]);

    const isLoading = isLoadingSessions || isLoadingMetrics;
    const error = sessionsError || metricsError;

    const refetch = () => {
        refetchSessions();
        if (items.length > 0 && startDate) {
            getDailyMetricsV2({
                items,
                start_date: startDate,
            });
        }
    };

    return {
        items,
        dateMapping,
        data,
        isLoading,
        error,
        refetch,
    };
}

