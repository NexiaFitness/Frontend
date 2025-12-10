/**
 * hooks/metrics/useMetricsAlerts.ts - Hook para alertas de métricas
 * Gestiona alertas de sobrecarga, monotonía y strain
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { useCallback, useMemo } from "react";
import { useCheckThresholdsMutation } from "../../api/metricsApi";
import type { CheckThresholdsRequest, MetricsAlert, LOAD_TYPE } from "../../types/metrics";

interface UseMetricsAlertsParams {
    clientId: number;
    trainerId?: number;
}

interface CheckAlertsParams {
    loadType: (typeof LOAD_TYPE)[keyof typeof LOAD_TYPE];
    intensity: number;
    volume: number;
    durationMinutes?: number;
    experiencia?: "Baja" | "Media" | "Alta";
    sessionDate: string; // ISO date - required by SessionContext
}

export const useMetricsAlerts = ({ clientId, trainerId }: UseMetricsAlertsParams) => {
    const [checkThresholds, { data, isLoading, error }] = useCheckThresholdsMutation();

    // Verificar umbrales
    const checkAlerts = useCallback(
        async ({ loadType, intensity, volume, durationMinutes, experiencia, sessionDate }: CheckAlertsParams) => {
            const payload: CheckThresholdsRequest = {
                client_id: clientId,
                trainer_id: trainerId,
                session_date: sessionDate,
                load_type: loadType,
                intensity,
                volume,
                duration_minutes: durationMinutes,
                experiencia,
            };

            return await checkThresholds(payload).unwrap();
        },
        [checkThresholds, clientId, trainerId]
    );

    const alerts: MetricsAlert[] = useMemo(() => data?.alerts ?? [], [data]);

    // En ausencia de flag is_active en el schema, consideramos todas activas.
    const activeAlerts = useMemo(() => alerts, [alerts]);

    const criticalAlerts = useMemo(
        () => activeAlerts.filter((a) => a.severity === "critical"),
        [activeAlerts]
    );

    const warningAlerts = useMemo(
        () => activeAlerts.filter((a) => a.severity === "warning"),
        [activeAlerts]
    );

    const alertsByType = useMemo(() => {
        const grouped: Record<string, MetricsAlert[]> = {};
        activeAlerts.forEach((alert) => {
            const key = alert.type ?? "unknown";
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(alert);
        });
        return grouped;
    }, [activeAlerts]);

    return {
        checkAlerts,
        alerts,
        activeAlerts,
        criticalAlerts,
        warningAlerts,
        alertsByType,
        hasAlerts: activeAlerts.length > 0,
        hasCritical: criticalAlerts.length > 0,
        isLoading,
        error,
    };
};

