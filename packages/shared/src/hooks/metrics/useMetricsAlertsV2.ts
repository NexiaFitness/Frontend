/**
 * hooks/metrics/useMetricsAlertsV2.ts - Hook V2 para alertas de métricas
 * 
 * Contexto:
 * - Hook V2 que obtiene sesiones, las transforma y verifica umbrales
 * - Usa useClientSessionsByDateRange y transformSessionsToCIDCalcIn
 * - Consume POST /metrics/check-thresholds con contrato real del backend
 * - NO reemplaza useMetricsAlerts legacy
 * 
 * Flujo:
 * 1. Obtener sesiones del cliente en rango de fechas
 * 2. Transformar sesiones → CIDCalcIn[]
 * 3. Llamar a POST /metrics/check-thresholds con items + start_date + thresholds
 * 4. Retornar alertas formateadas por severidad
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 2: Integración V2
 */

import React from "react";
import { useMemo } from "react";
import { useCheckThresholdsV2Mutation } from "../../api/metricsApiV2";
import { useClientSessionsByDateRange } from "./useClientSessionsByDateRange";
import { transformSessionsToCIDCalcInWithDates } from "../../utils/metrics/transformSessionsToCIDCalcIn";
import type { CheckThresholdsResponseV2, ThresholdAlertV2 } from "../../types/metricsV2";

export interface UseMetricsAlertsV2Params {
    clientId: number;
    startDate: string; // ISO date (YYYY-MM-DD)
    endDate: string; // ISO date (YYYY-MM-DD)
    trainerId?: number;
    daily_threshold?: number; // Default 80.0
    weekly_threshold?: number; // Default 450.0
    consecutive_threshold?: number; // Default 70.0
    consecutive_days?: number; // Default 3
    create_alerts?: boolean; // Default false
}

export interface UseMetricsAlertsV2Result {
    items: ReturnType<typeof transformSessionsToCIDCalcInWithDates>["items"]; // Items transformados
    alerts: ThresholdAlertV2[]; // Todas las alertas
    activeAlerts: ThresholdAlertV2[]; // Alertas activas (todas por ahora)
    criticalAlerts: ThresholdAlertV2[]; // Alertas críticas
    highAlerts: ThresholdAlertV2[]; // Alertas altas
    mediumAlerts: ThresholdAlertV2[]; // Alertas medias
    alertsByType: Record<string, ThresholdAlertV2[]>; // Agrupadas por tipo
    hasAlerts: boolean;
    hasCritical: boolean;
    data: CheckThresholdsResponseV2 | undefined; // Resultado completo del endpoint
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook V2 para verificar umbrales de métricas y obtener alertas
 * 
 * @param params - clientId, startDate, endDate, thresholds, trainerId, create_alerts
 * @returns Alertas formateadas, items transformados, resultado del endpoint, estado de carga y error
 * 
 * @example
 * ```typescript
 * const { alerts, criticalAlerts, hasAlerts } = useMetricsAlertsV2({
 *   clientId: 1,
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 *   daily_threshold: 80,
 *   weekly_threshold: 450,
 * });
 * ```
 */
export function useMetricsAlertsV2(
    params: UseMetricsAlertsV2Params
): UseMetricsAlertsV2Result {
    const {
        clientId,
        startDate,
        endDate,
        trainerId,
        daily_threshold = 80.0,
        weekly_threshold = 450.0,
        consecutive_threshold = 70.0,
        consecutive_days = 3,
        create_alerts = false,
    } = params;

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

    // Calcular fecha real de inicio (primera sesión)
    const actualStartDate = useMemo(() => {
        if (dateMapping.length === 0) {
            return startDate;
        }
        
        const earliestDate = new Date(dateMapping[0]);
        const originalStart = new Date(startDate);
        
        return earliestDate < originalStart ? startDate : dateMapping[0];
    }, [dateMapping, startDate]);

    // Paso 3: Llamar a POST /metrics/check-thresholds
    const [checkThresholdsV2, { data, isLoading: isLoadingMetrics, error: metricsError }] =
        useCheckThresholdsV2Mutation();

    // Efecto para verificar umbrales cuando hay items disponibles
    React.useEffect(() => {
        if (items.length > 0 && actualStartDate) {
            checkThresholdsV2({
                items,
                start_date: actualStartDate,
                daily_threshold,
                weekly_threshold,
                consecutive_threshold,
                consecutive_days,
                create_alerts,
                client_id: create_alerts ? clientId : undefined,
                trainer_id: create_alerts ? trainerId : undefined,
            });
        }
    }, [
        items,
        actualStartDate,
        daily_threshold,
        weekly_threshold,
        consecutive_threshold,
        consecutive_days,
        create_alerts,
        clientId,
        trainerId,
        checkThresholdsV2,
    ]);

    // Paso 4: Formatear alertas por severidad
    const alerts = useMemo(() => {
        return data?.alerts ?? [];
    }, [data]);

    const activeAlerts = useMemo(() => {
        // Por ahora todas las alertas se consideran activas
        return alerts;
    }, [alerts]);

    const criticalAlerts = useMemo(() => {
        return activeAlerts.filter((alert) => alert.severity === "critical");
    }, [activeAlerts]);

    const highAlerts = useMemo(() => {
        return activeAlerts.filter((alert) => alert.severity === "high");
    }, [activeAlerts]);

    const mediumAlerts = useMemo(() => {
        return activeAlerts.filter((alert) => alert.severity === "medium");
    }, [activeAlerts]);

    const alertsByType = useMemo(() => {
        const grouped: Record<string, ThresholdAlertV2[]> = {};
        activeAlerts.forEach((alert) => {
            const key = alert.type;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(alert);
        });
        return grouped;
    }, [activeAlerts]);

    const isLoading = isLoadingSessions || isLoadingMetrics;
    const error = sessionsError || metricsError;

    const refetch = () => {
        refetchSessions();
        // El refetch se disparará automáticamente cuando cambien los datos
    };

    return {
        items,
        alerts,
        activeAlerts,
        criticalAlerts,
        highAlerts,
        mediumAlerts,
        alertsByType,
        hasAlerts: activeAlerts.length > 0,
        hasCritical: criticalAlerts.length > 0,
        data,
        isLoading,
        error,
        refetch,
    };
}

