/**
 * hooks/metrics/useWeeklyMetricsV2.ts - Hook V2 para métricas semanales
 * 
 * Contexto:
 * - Hook V2 que obtiene sesiones, las transforma y calcula métricas semanales
 * - Usa useClientSessionsByDateRange y transformSessionsToCIDCalcIn
 * - Consume POST /metrics/weekly con contrato real del backend
 * - NO reemplaza useWeeklyMetrics legacy
 * 
 * Flujo:
 * 1. Obtener sesiones del cliente en rango de fechas
 * 2. Transformar sesiones → CIDCalcIn[]
 * 3. Llamar a POST /metrics/weekly con items + start_date
 * 4. Formatear buckets para gráficos
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 2: Integración V2
 */

import React from "react";
import { useMemo } from "react";
import { useGetWeeklyMetricsV2Mutation } from "../../api/metricsApiV2";
import { useClientSessionsByDateRange } from "./useClientSessionsByDateRange";
import { transformSessionsToCIDCalcInWithDates, calculateCIDFromItem } from "../../utils/metrics/transformSessionsToCIDCalcIn";

export interface UseWeeklyMetricsV2Params {
    clientId: number;
    startDate: string; // ISO date (YYYY-MM-DD)
    endDate: string; // ISO date (YYYY-MM-DD)
}

export interface WeeklyMetricsV2ChartData {
    weekStart: string; // ISO date (Monday)
    cid: number; // cid_sum
    avg: number; // cid_avg
}

export interface UseWeeklyMetricsV2Result {
    chartData: WeeklyMetricsV2ChartData[];
    items: ReturnType<typeof transformSessionsToCIDCalcInWithDates>["items"]; // Items transformados
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook V2 para obtener y formatear métricas semanales de CID
 * 
 * @param params - clientId, startDate, endDate
 * @returns Datos formateados para gráficos, items transformados, estado de carga y error
 * 
 * @example
 * ```typescript
 * const { chartData, isLoading } = useWeeklyMetricsV2({
 *   clientId: 1,
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 * });
 * ```
 */
export function useWeeklyMetricsV2(
    params: UseWeeklyMetricsV2Params
): UseWeeklyMetricsV2Result {
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

    // Paso 2.5: Calcular la fecha real de inicio (primera sesión)
    // El backend asigna cada item a un día consecutivo desde start_date,
    // así que necesitamos que start_date coincida con la primera sesión
    const actualStartDate = useMemo(() => {
        if (dateMapping.length === 0) {
            return startDate;
        }
        
        // La primera fecha del mapeo es la más temprana (ya está ordenada)
        const earliestDate = new Date(dateMapping[0]);
        const originalStart = new Date(startDate);
        
        return earliestDate < originalStart ? startDate : dateMapping[0];
    }, [dateMapping, startDate]);

    // Paso 3: Llamar a POST /metrics/weekly
    const [getWeeklyMetricsV2, { data, isLoading: isLoadingMetrics, error: metricsError }] =
        useGetWeeklyMetricsV2Mutation();

    // Efecto para cargar métricas cuando hay items disponibles
    React.useEffect(() => {
        if (items.length > 0 && actualStartDate) {
            getWeeklyMetricsV2({
                items,
                start_date: actualStartDate,
            });
        }
    }, [items, actualStartDate, getWeeklyMetricsV2]);

    // Paso 4: Formatear buckets para gráficos
    // IMPORTANTE: El backend agrupa por semana ISO basándose en las fechas que asigna (consecutivas desde start_date)
    // Pero nosotros tenemos las fechas reales en dateMapping. Necesitamos recalcular las semanas basándonos en las fechas reales.
    // Estrategia: Calcular CID diarios usando fechas reales y agrupar por semana ISO
    const chartData = useMemo<WeeklyMetricsV2ChartData[]>(() => {
        if (dateMapping.length === 0 || items.length === 0) {
            return [];
        }

        // Recalcular semanas ISO desde las fechas reales
        const weeklyBuckets = new Map<string, { cidValues: number[] }>();
        
        // Calcular CID para cada día usando las fechas reales
        dateMapping.forEach((realDate, itemIndex) => {
            // Calcular el CID para este item usando la función helper
            const item = items[itemIndex];
            const cidValue = calculateCIDFromItem(item);
            
            // Calcular lunes de la semana ISO para esta fecha real
            // Asegurar que la fecha se parsea correctamente (formato YYYY-MM-DD)
            const dateStr = realDate.split('T')[0]; // Asegurar formato YYYY-MM-DD
            const [year, month, day] = dateStr.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day); // month es 0-indexed en Date
            
            // Calcular lunes de la semana ISO
            const dayOfWeek = dateObj.getDay(); // 0 (domingo) a 6 (sábado)
            const isoWeekday = dayOfWeek === 0 ? 7 : dayOfWeek; // Convertir domingo de 0 a 7
            const daysToMonday = isoWeekday - 1;
            
            const monday = new Date(dateObj);
            monday.setDate(monday.getDate() - daysToMonday);
            const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
            
            if (!weeklyBuckets.has(weekKey)) {
                weeklyBuckets.set(weekKey, { cidValues: [] });
            }
            
            const bucket = weeklyBuckets.get(weekKey)!;
            bucket.cidValues.push(cidValue);
        });

        // Convertir a array y calcular sumas y promedios
        const result: WeeklyMetricsV2ChartData[] = [];
        const sortedWeekKeys = Array.from(weeklyBuckets.keys()).sort();
        
        for (const weekKey of sortedWeekKeys) {
            const bucket = weeklyBuckets.get(weekKey)!;
            const cidSum = bucket.cidValues.reduce((sum, v) => sum + v, 0);
            const cidAvg = cidSum / bucket.cidValues.length;
            
            result.push({
                weekStart: weekKey, // Lunes de la semana ISO
                cid: cidSum,
                avg: cidAvg,
            });
        }

        return result;
    }, [dateMapping, items]);

    const isLoading = isLoadingSessions || isLoadingMetrics;
    const error = sessionsError || metricsError;

    const refetch = () => {
        refetchSessions();
        // El refetch se disparará automáticamente cuando cambien items o actualStartDate
    };

    return {
        chartData,
        items,
        isLoading,
        error,
        refetch,
    };
}

