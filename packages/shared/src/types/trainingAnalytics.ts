/**
 * trainingAnalytics.ts — Tipos para analytics de Training Plans
 * 
 * Contexto:
 * - Schemas para endpoints de summary (yearly/monthly/weekly)
 * - Alineados con backend/app/schemas.py
 * - Usado por dashboards de planning (Yearly/Monthly Planning)
 * 
 * Endpoints:
 * - GET /training-plans/analytics/yearly-summary
 * - GET /training-plans/analytics/monthly-summary
 * - GET /training-plans/analytics/weekly-summary
 * - GET /training-plans/analytics/adherence-stats
 * 
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import type { Milestone } from "./training";

// ============================================================================
// SCHEMAS BASE
// ============================================================================

/**
 * TrainingPlanDistributionItem - Item de distribución de cualidades físicas
 * Usado en yearly/monthly/weekly summaries para mostrar distribución porcentual
 */
export interface TrainingPlanDistributionItem {
    name: string;
    percentage: number;
}

/**
 * TrainingLoadSummary - Resumen de carga de entrenamiento (volume/intensity)
 * Valores float 1-10 para coherencia
 */
export interface TrainingLoadSummary {
    volume_level: number;      // Float 1-10
    intensity_level: number;   // Float 1-10
}

/**
 * TrainingPlanSummaryStats - Estadísticas generales del plan
 * Adherence rate en porcentaje 0-100
 */
export interface TrainingPlanSummaryStats {
    total_sessions_planned: number;
    sessions_completed: number;
    adherence_rate: number;  // Percentage 0-100
}

// ============================================================================
// YEARLY SUMMARY
// ============================================================================

/**
 * MonthlyTrainingProgress - Progreso mensual dentro del resumen anual
 * Cada mes tiene distribución de cualidades y niveles de carga
 */
export interface MonthlyTrainingProgress {
    month: number;  // 1-12 (January = 1, December = 12)
    qualities: TrainingPlanDistributionItem[];
    volume_level: number;
    intensity_level: number;
}

/**
 * ClientTrainingPlanSummary - Resumen anual completo del plan de entrenamiento
 * 
 * Endpoint: GET /training-plans/analytics/yearly-summary?client_id={id}&year={year}
 * 
 * Incluye:
 * - Información del plan (nombre, objetivo)
 * - Distribución de cualidades físicas
 * - Carga de entrenamiento (volume/intensity)
 * - Progresión mensual (12 meses)
 * - Estadísticas de adherencia
 * - Milestones del año
 */
export interface ClientTrainingPlanSummary {
    client_id: number;
    year: number;
    has_active_plan: boolean;
    plan_name: string | null;
    plan_goal: string | null;
    distribution: TrainingPlanDistributionItem[];
    physical_qualities: TrainingPlanDistributionItem[];
    training_load: TrainingLoadSummary;
    yearly_progression: MonthlyTrainingProgress[];
    summary: TrainingPlanSummaryStats;
    milestones: Milestone[];
}

// ============================================================================
// MONTHLY SUMMARY
// ============================================================================

/**
 * TrainingPlanQualityAverage - Promedio de cualidad física (planned vs actual)
 * Usado en comparación planned vs actual
 */
export interface TrainingPlanQualityAverage {
    quality: string;
    planned_avg: number;
    actual_avg: number;
}

/**
 * PlannedVsActualComparison - Comparación entre lo planificado y lo ejecutado
 * 
 * Status values:
 * - "on_track": Cumple con lo planificado
 * - "below_target": Por debajo del objetivo
 */
export interface PlannedVsActualComparison {
    planned_volume: number;
    actual_volume: number;
    volume_status: "on_track" | "below_target";
    planned_intensity: number;
    actual_intensity: number;
    intensity_status: "on_track" | "below_target";
    qualities: TrainingPlanQualityAverage[];
}

/**
 * MonthlyWeekBreakdown - Desglose semanal dentro del mes
 * Cada semana (1-5) tiene distribución y carga
 */
export interface MonthlyWeekBreakdown {
    week: number;  // 1-5 (Week 1, Week 2, etc.)
    qualities: TrainingPlanDistributionItem[];
    volume_level: number;
    intensity_level: number;
}

/**
 * TrainingPlanMonthlySummary - Resumen mensual completo del plan
 * 
 * Endpoint: GET /training-plans/analytics/monthly-summary?client_id={id}&year={year}&month={month}
 * 
 * Incluye:
 * - Información del plan
 * - Distribución de cualidades
 * - Carga de entrenamiento
 * - Plan alignment (coherencia)
 * - Comparación planned vs actual
 * - Desglose por semanas (4-5 semanas)
 * - Estadísticas de adherencia
 */
export interface TrainingPlanMonthlySummary {
    client_id: number;
    year: number;
    month: number;  // 1-12
    has_active_plan: boolean;
    plan_name: string | null;
    plan_goal: string | null;
    distribution: TrainingPlanDistributionItem[];
    physical_qualities: TrainingPlanDistributionItem[];
    training_load: TrainingLoadSummary;
    plan_alignment: number;  // Coherence score 0-100
    planned_vs_actual: PlannedVsActualComparison;
    weeks: MonthlyWeekBreakdown[];
    summary: TrainingPlanSummaryStats;
}

// ============================================================================
// WEEKLY SUMMARY
// ============================================================================

/**
 * DailyProgressionPoint - Punto de progresión diario dentro de la semana
 * Cada día (1-7, Lunes-Domingo) tiene distribución y carga
 */
export interface DailyProgressionPoint {
    day: number;  // 1-7 (Monday = 1, Sunday = 7)
    date: string;  // ISO date YYYY-MM-DD
    qualities: TrainingPlanDistributionItem[];
    volume_level: number;
    intensity_level: number;
}

/**
 * WeeklySessionEntry - Entrada de sesión dentro del resumen semanal
 * Incluye información de sesión planificada vs ejecutada
 */
export interface WeeklySessionEntry {
    session_id: number;
    session_date: string;  // ISO date YYYY-MM-DD
    session_name: string;
    session_type: string | null;
    status: string;  // e.g., "completed", "planned", "cancelled"
    planned_volume: number | null;
    planned_intensity: number | null;
    actual_volume: number | null;
    actual_intensity: number | null;
}

/**
 * TrainingPlanWeeklySummary - Resumen semanal completo del plan
 * 
 * Endpoint: GET /training-plans/analytics/weekly-summary?client_id={id}&week_start={date}
 * 
 * Incluye:
 * - Información del plan
 * - Distribución de cualidades
 * - Carga de entrenamiento
 * - Plan alignment (coherencia)
 * - Progresión diaria (7 días)
 * - Comparación planned vs actual
 * - Lista de sesiones de la semana
 * - Estadísticas de adherencia
 */
export interface TrainingPlanWeeklySummary {
    client_id: number;
    week_start: string;  // ISO date YYYY-MM-DD
    week_end: string;    // ISO date YYYY-MM-DD
    has_active_plan: boolean;
    plan_name: string | null;
    plan_goal: string | null;
    distribution: TrainingPlanDistributionItem[];
    physical_qualities: TrainingPlanDistributionItem[];
    training_load: TrainingLoadSummary;
    plan_alignment: number;  // Coherence score 0-100
    daily_progression: DailyProgressionPoint[];
    planned_vs_actual: PlannedVsActualComparison;
    sessions: WeeklySessionEntry[];
    summary: TrainingPlanSummaryStats;
}

// ============================================================================
// ADHERENCE STATS
// ============================================================================

/**
 * PlanAdherenceStats - Estadísticas de adherencia del plan
 * 
 * Endpoint: GET /training-plans/analytics/adherence-stats?client_id={id}
 * 
 * Trend values:
 * - "improving": Mejorando
 * - "stable": Estable
 * - "declining": Empeorando
 * 
 * Source values:
 * - "session_completion": Basado en completitud de sesiones
 * - "plan_alignment": Basado en alineación con el plan
 */
export interface PlanAdherenceStats {
    adherence_percentage: number;  // 0-100
    trend: "improving" | "stable" | "declining";
    aligned_plans: number | null;
    total_plans: number | null;
    source: string;  // e.g., "session_completion", "plan_alignment"
    note: string | null;
}

