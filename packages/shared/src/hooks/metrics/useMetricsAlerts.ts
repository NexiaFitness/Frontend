/**
 * hooks/metrics/useMetricsAlerts.ts - Hook para alertas de métricas
 * Gestiona alertas de sobrecarga, monotonía y strain.
 * Migrado a V2: usa useLazyCheckThresholdsV2Query (POST /metrics/check-thresholds).
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { useCallback, useMemo } from "react";
import { useLazyCheckThresholdsV2Query } from "../../api/metricsApiV2";
import type { MetricsAlert, LOAD_TYPE, CIDCalcIn } from "../../types/metrics";
import type { ThresholdAlertV2 } from "../../types/metricsV2";

function kExperienciaFrom(experiencia?: "Baja" | "Media" | "Alta"): number {
    if (experiencia === "Baja") return 0.8;
    if (experiencia === "Alta") return 1.1;
    return 1.0;
}

function thresholdAlertToMetricsAlert(a: ThresholdAlertV2): MetricsAlert {
    return {
        type: a.severity === "critical" ? "critical" : a.severity === "high" ? "warning" : "info",
        message: a.message,
        severity: a.severity === "critical" ? "critical" : a.severity === "high" ? "warning" : "info",
    };
}

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
    sessionDate: string; // ISO date
}

export const useMetricsAlerts = ({ clientId, trainerId }: UseMetricsAlertsParams) => {
    const [triggerCheck, { data, isLoading, error }] = useLazyCheckThresholdsV2Query();

    const checkAlerts = useCallback(
        async ({ intensity, volume, experiencia, sessionDate }: CheckAlertsParams) => {
            const item: CIDCalcIn = {
                volumen_level: Math.min(10, Math.max(1, volume)),
                intensidad_level: Math.min(10, Math.max(1, intensity)),
                k_fase: 1.0,
                k_experiencia: kExperienciaFrom(experiencia),
                p: 1.0,
            };
            const result = await triggerCheck({
                items: [item],
                start_date: sessionDate,
                client_id: clientId,
                trainer_id: trainerId,
            }).unwrap();
            return result;
        },
        [triggerCheck, clientId, trainerId]
    );

    const alerts: MetricsAlert[] = useMemo(
        () => (data?.alerts ?? []).map(thresholdAlertToMetricsAlert),
        [data]
    );

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

