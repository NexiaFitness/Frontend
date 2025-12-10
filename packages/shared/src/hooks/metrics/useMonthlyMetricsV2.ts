/**
 * hooks/metrics/useMonthlyMetricsV2.ts - Hook V2 para métricas mensuales
 * 
 * Contexto:
 * - Hook V2 que obtiene sesiones, las transforma y calcula métricas mensuales
 * - Usa useClientSessionsByDateRange y transformSessionsToCIDCalcIn
 * - Consume POST /metrics/monthly con contrato real del backend
 * - NO reemplaza hooks legacy
 * 
 * Flujo:
 * 1. Obtener sesiones del cliente en rango de fechas
 * 2. Transformar sesiones → CIDCalcIn[]
 * 3. Llamar a POST /metrics/monthly con items + start_date + w_fase
 * 4. Retornar buckets mensuales con CID agregado
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 2: Integración V2
 */

import React from "react";
import { useMemo } from "react";
import { useGetMonthlyMetricsV2Mutation } from "../../api/metricsApiV2";
import { useClientSessionsByDateRange } from "./useClientSessionsByDateRange";
import { transformSessionsToCIDCalcInWithDates, calculateCIDFromItem } from "../../utils/metrics/transformSessionsToCIDCalcIn";
import type { MonthlyMetricsResponseV2, MonthlyBucketV2 } from "../../types/metricsV2";

export interface UseMonthlyMetricsV2Params {
    clientId: number;
    startDate: string; // ISO date (YYYY-MM-DD)
    endDate: string; // ISO date (YYYY-MM-DD)
    w_fase?: number; // Phase weight 0.6-1.3, default 1.0
}

export interface UseMonthlyMetricsV2Result {
    items: ReturnType<typeof transformSessionsToCIDCalcInWithDates>["items"]; // Items transformados
    monthlyMetrics: MonthlyBucketV2[]; // Buckets mensuales recalculados con fechas reales
    data: MonthlyMetricsResponseV2 | undefined; // Resultado original del endpoint (para referencia)
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook V2 para obtener métricas mensuales de CID
 * 
 * @param params - clientId, startDate, endDate, w_fase (opcional)
 * @returns Items transformados, resultado del endpoint, estado de carga y error
 * 
 * @example
 * ```typescript
 * const { items, data, isLoading } = useMonthlyMetricsV2({
 *   clientId: 1,
 *   startDate: "2025-01-01",
 *   endDate: "2025-12-31",
 *   w_fase: 1.2, // Fase de intensificación
 * });
 * ```
 */
export function useMonthlyMetricsV2(
    params: UseMonthlyMetricsV2Params
): UseMonthlyMetricsV2Result {
    const { clientId, startDate, endDate, w_fase = 1.0 } = params;

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
    const actualStartDate = useMemo(() => {
        if (dateMapping.length === 0) {
            return startDate;
        }
        
        const earliestDate = new Date(dateMapping[0]);
        const originalStart = new Date(startDate);
        
        return earliestDate < originalStart ? startDate : dateMapping[0];
    }, [dateMapping, startDate]);

    // Paso 3: Llamar a POST /metrics/monthly
    const [getMonthlyMetricsV2, { data, isLoading: isLoadingMetrics, error: metricsError }] =
        useGetMonthlyMetricsV2Mutation();

    // Efecto para cargar métricas cuando hay items disponibles
    React.useEffect(() => {
        if (items.length > 0 && actualStartDate) {
            getMonthlyMetricsV2({
                items,
                start_date: actualStartDate,
                w_fase,
            });
        }
    }, [items, actualStartDate, w_fase, getMonthlyMetricsV2]);

    // Paso 4: Recalcular buckets mensuales usando fechas reales
    // El backend agrupa por mes basándose en fechas consecutivas, pero necesitamos usar fechas reales
    // Estrategia: Agrupar sesiones por semana ISO primero, luego por mes (igual que el backend)
    const monthlyMetrics = useMemo<MonthlyBucketV2[]>(() => {
        if (dateMapping.length === 0 || items.length === 0) {
            return [];
        }

        // Paso 1: Agrupar por semana ISO usando fechas reales
        const weeklyBuckets = new Map<string, number[]>(); // weekKey -> [cidValues]
        
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
                weeklyBuckets.set(weekKey, []);
            }
            
            weeklyBuckets.get(weekKey)!.push(cidValue);
        });

        // Paso 2: Calcular sumas semanales y aplicar w_fase, luego agrupar por mes
        const monthlyBuckets = new Map<string, number[]>(); // "YYYY-MM" -> [weeklyWeightedSums]
        
        for (const [weekKey, dailyCidValues] of weeklyBuckets.entries()) {
            const weeklySum = dailyCidValues.reduce((sum, v) => sum + v, 0);
            const weightedWeekly = weeklySum * w_fase; // Aplicar w_fase como el backend
            
            // Determinar el mes de esta semana (usar el lunes de la semana)
            // weekKey ya está en formato YYYY-MM-DD
            const [year, month] = weekKey.split('-').map(Number);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            
            if (!monthlyBuckets.has(monthKey)) {
                monthlyBuckets.set(monthKey, []);
            }
            
            monthlyBuckets.get(monthKey)!.push(weightedWeekly);
        }

        // Paso 3: Convertir a array MonthlyBucketV2
        // IMPORTANTE: El schema MonthlyBucketV2 solo tiene month (1-12), no año
        // Si hay datos de múltiples años, agrupamos por mes-año primero, luego consolidamos
        // Para el rango de "últimos 12 meses", normalmente todos son del mismo año o máximo 2 años consecutivos
        const result: MonthlyBucketV2[] = [];
        const sortedMonthKeys = Array.from(monthlyBuckets.keys()).sort();
        
        // Si hay datos de múltiples años, necesitamos consolidar meses del mismo número
        // Por ejemplo, si hay "2024-11" y "2025-11", ambos se consolidan en month=11
        const consolidatedByMonth = new Map<number, number[]>(); // month -> [cidSums de todos los años]
        
        for (const monthKey of sortedMonthKeys) {
            const weeklySums = monthlyBuckets.get(monthKey)!;
            const cidSum = weeklySums.reduce((sum, v) => sum + v, 0);
            
            // Extraer el mes del key (formato "YYYY-MM")
            const month = parseInt(monthKey.split('-')[1], 10);
            
            if (!consolidatedByMonth.has(month)) {
                consolidatedByMonth.set(month, []);
            }
            
            // Agregar la suma de este mes-año
            consolidatedByMonth.get(month)!.push(cidSum);
        }
        
        // Consolidar: si un mes aparece en múltiples años, sumar los valores
        const sortedMonths = Array.from(consolidatedByMonth.keys()).sort();
        for (const month of sortedMonths) {
            const cidSums = consolidatedByMonth.get(month)!;
            const cidSum = cidSums.reduce((sum, v) => sum + v, 0);
            const cidAvg = cidSum / cidSums.length; // Promedio de las sumas de diferentes años
            
            result.push({
                month,
                cid_sum: cidSum,
                cid_avg: cidAvg,
            });
        }

        return result;
    }, [dateMapping, items, w_fase]);

    const isLoading = isLoadingSessions || isLoadingMetrics;
    const error = sessionsError || metricsError;

    const refetch = () => {
        refetchSessions();
        // El refetch se disparará automáticamente cuando cambien items o actualStartDate
    };

    return {
        items,
        monthlyMetrics,
        data,
        isLoading,
        error,
        refetch,
    };
}

