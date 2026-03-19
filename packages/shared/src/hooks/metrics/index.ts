/**
 * hooks/metrics/index.ts - Exports de hooks de métricas
 * @author Nelson Valero
 * @since v5.6.0
 */

// Legacy hooks (mantener para compatibilidad)
export * from "./useWeeklyMetrics";
export * from "./useMetricsAlerts";
export * from "./useCalculateCID";

// V2 hooks (Fase 1: Preparación)
export * from "./useClientSessionsByDateRange";

// V2 hooks (Fase 2: Integración)
export * from "./useWeeklyMetricsV2";
export * from "./useDailyMetricsV2";
export * from "./useMonthlyMetricsV2";
export * from "./useMetricsAlertsV2";

