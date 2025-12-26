/**
 * useDashboardAlerts.ts — Hook para alertas filtradas del dashboard del trainer
 *
 * Contexto:
 * - Filtra alertas según reglas UX: solo mostrar alertas que requieren acción inmediata
 * - Consume useGetUnreadFatigueAlertsQuery y aplica filtrado en frontend
 * - Regla UX: SOLO mostrar alertas de fatiga alta (recovery_needed con severity high/critical)
 * - NO mostrar: fatiga media, cancelaciones, desviaciones (se muestran en otros lugares)
 * - Dashboard muestra solo alertas NO RESUELTAS (is_resolved = false)
 *
 * Uso:
 * ```tsx
 * const { alerts, isLoading, error } = useDashboardAlerts();
 * ```
 *
 * @author Frontend Team
 * @since v6.2.0
 * @updated v6.3.0 - Filtrado por is_resolved en lugar de is_read
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetUnreadFatigueAlertsQuery } from "../../api/fatigueApi";
import type { RootState } from "../../store";
import type { FatigueAlert } from "../../types/training";

export interface UseDashboardAlertsResult {
    /**
     * Alertas filtradas según reglas UX (solo fatiga alta)
     * Array vacío si no hay alertas que cumplan los criterios
     */
    alerts: FatigueAlert[];
    /**
     * Estado de carga de la query
     */
    isLoading: boolean;
    /**
     * Error si la query falló
     */
    error: unknown;
    /**
     * Cantidad total de alertas filtradas
     */
    count: number;
}

/**
 * Hook para obtener alertas filtradas del dashboard del trainer
 *
 * Reglas de filtrado UX:
 * - ✅ MOSTRAR: Alertas de fatiga alta (recovery_needed con severity "high" o "critical")
 * - ❌ NO MOSTRAR:
 *   - Fatiga media (session_adjustment) → Se muestra como estado en detalle de cliente
 *   - Cancelaciones (attendance) → Se muestra en calendario
 *   - Desviaciones (plan_deviation) → Se muestra en detalle de sesión
 *
 * @returns Alertas filtradas, estado de carga, error y contador
 *
 * @example
 * ```typescript
 * const { alerts, isLoading, count } = useDashboardAlerts();
 *
 * if (isLoading) return <Loading />;
 * if (alerts.length === 0) return <NoAlerts />;
 *
 * return alerts.map(alert => <AlertCard key={alert.id} alert={alert} />);
 * ```
 */
export function useDashboardAlerts(): UseDashboardAlertsResult {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const { data: allAlerts, isLoading, error } = useGetUnreadFatigueAlertsQuery(undefined, {
        skip: !isAuthenticated,
    });

    /**
     * Filtrar alertas según reglas UX:
     * - Solo alertas NO RESUELTAS (is_resolved = false)
     * - Solo alertas de fatiga alta que requieren acción inmediata
     */
    const filteredAlerts = useMemo(() => {
        if (!allAlerts || allAlerts.length === 0) {
            return [];
        }

        return allAlerts.filter((alert: FatigueAlert) => {
            // PRIMERO: Solo alertas NO RESUELTAS
            if (alert.is_resolved) {
                return false;
            }

            // SEGUNDO: SOLO mostrar recovery_needed con severity high o critical
            if (alert.alert_type === "recovery_needed") {
                return alert.severity === "high" || alert.severity === "critical";
            }

            // NO mostrar:
            // - session_adjustment (fatiga media) → Se muestra como estado
            // - attendance (cancelaciones) → Se muestra en calendario
            // - plan_deviation (desviaciones) → Se muestra en detalle de sesión
            // - overtraining (ya no se usa, pero por si acaso)
            return false;
        });
    }, [allAlerts]);

    return {
        alerts: filteredAlerts,
        isLoading,
        error: error ?? null,
        count: filteredAlerts.length,
    };
}

