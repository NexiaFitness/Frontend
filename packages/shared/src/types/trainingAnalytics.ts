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

// ============================================================================
// PLANNING ENDPOINTS (Training Plan-based, Editable)
// ============================================================================
// Estos tipos son para los endpoints /training-plans/{id}/planning/*
// Difieren de los tipos de cliente porque son editables y orientados a plan

/**
 * PlanningCycleItem - Ciclo individual en vista de planning con campos editables
 * 
 * Alineado con backend/app/schemas.py PlanningCycleItem
 */
export interface PlanningCycleItem {
    cycle_id: number;
    /** Period-based: "month" | "week" | "day" or legacy cycle_type from API */
    cycle_type: string;
    name: string;
    start_date: string;  // ISO date YYYY-MM-DD
    end_date: string;    // ISO date YYYY-MM-DD
    physical_quality: string | null;
    volume: number | null;  // 1-10
    intensity: number | null;  // 1-10
    has_values: boolean;  // True if volume/intensity are set
    inherited: boolean;  // True if values are inherited from parent
}

/**
 * PlanningDistributionItem - Item de distribución de cualidades físicas
 * 
 * Alineado con backend/app/schemas.py PlanningDistributionItem
 * Diferente de TrainingPlanDistributionItem porque incluye cycle_ids
 */
export interface PlanningDistributionItem {
    name: string;
    percentage: number;  // 0-100
    cycle_ids: number[];  // IDs of cycles with this quality
}

/**
 * PlanningLoadSummary - Resumen de carga de entrenamiento (volume/intensity)
 * 
 * Alineado con backend/app/schemas.py PlanningLoadSummary
 * Diferente de TrainingLoadSummary porque incluye cycle_ids
 */
export interface PlanningLoadSummary {
    volume_level: number;  // 1-10
    intensity_level: number;  // 1-10
    cycle_ids: number[];  // IDs of cycles included in calculation
}

/**
 * TrainingPlanYearlyPlanning - Vista de planning anual del plan
 * 
 * Endpoint: GET /training-plans/{id}/planning/yearly?year={year}
 * 
 * Alineado con backend/app/schemas.py PlanningYearlyResponse
 */
export interface TrainingPlanYearlyPlanning {
    plan_id: number;
    plan_name: string;
    year: number;
    distribution: PlanningDistributionItem[];
    training_load: PlanningLoadSummary;
    cycles: PlanningCycleItem[];  // Period-based: month-level items for the year
    monthly_progression: Record<string, unknown>[];  // Month-by-month breakdown (Dict from backend)
}

/**
 * TrainingPlanMonthlyPlanning - Vista de planning mensual del plan
 * 
 * Endpoint: GET /training-plans/{id}/planning/monthly?year={year}&month={month}
 * 
 * Alineado con backend/app/schemas.py PlanningMonthlyResponse
 */
export interface TrainingPlanMonthlyPlanning {
    plan_id: number;
    plan_name: string;
    year: number;
    month: number;  // 1-12
    distribution: PlanningDistributionItem[];
    training_load: PlanningLoadSummary;
    cycles: PlanningCycleItem[];  // Period-based: week-level items for the month
    weekly_progression: Record<string, unknown>[];  // Week-by-week breakdown (Dict from backend)
}

/**
 * TrainingPlanWeeklyPlanning - Vista de planning semanal del plan
 * 
 * Endpoint: GET /training-plans/{id}/planning/weekly?week_start={date}
 * 
 * Alineado con backend/app/schemas.py PlanningWeeklyResponse
 */
export interface TrainingPlanWeeklyPlanning {
    plan_id: number;
    plan_name: string;
    week_start: string;  // ISO date YYYY-MM-DD
    week_end: string;    // ISO date YYYY-MM-DD
    distribution: PlanningDistributionItem[];
    training_load: PlanningLoadSummary;
    cycles: PlanningCycleItem[];  // Period-based: day-level items for the week
    daily_progression: Record<string, unknown>[];  // Day-by-day breakdown (Dict from backend)
}

// ============================================================================
// PLANNING UPDATE REQUESTS
// ============================================================================

/**
 * DistributionUpdateItem - Item individual de actualización de distribución
 * 
 * Alineado con backend/app/schemas.py DistributionUpdateItem
 */
export interface DistributionUpdateItem {
    name: string;
    percentage: number;  // 0-100
}

/**
 * UpdatePlanningDistributionRequest - Request para actualizar distribución de cualidades físicas
 * 
 * Endpoint: PUT /training-plans/{id}/planning/distribution
 * 
 * Alineado con backend/app/schemas.py DistributionUpdateRequest
 * 
 * Validación: Los porcentajes deben sumar 100%
 */
export interface UpdatePlanningDistributionRequest {
    cycle_ids: number[];  // IDs of cycles to update
    distribution: DistributionUpdateItem[];  // Must sum to 100%
    cascade: boolean;  // If True, update child cycles too
}

/**
 * UpdatePlanningLoadRequest - Request para actualizar volume/intensity
 * 
 * Endpoint: PUT /training-plans/{id}/planning/load
 * 
 * Alineado con backend/app/schemas.py LoadUpdateRequest
 */
export interface UpdatePlanningLoadRequest {
    cycle_ids: number[];  // IDs of cycles to update
    physical_quality: string | null;  // Optional: filter by quality
    volume: number | null;  // 1-10
    intensity: number | null;  // 1-10
    cascade: boolean;  // If True, update child cycles too
}

// ============================================================================
// PLAN COHERENCE (period-based: month / week / day)
// GET /api/v1/training-plans/{plan_id}/coherence?deviation_threshold=20
// ============================================================================

export interface PlanCoherenceMonthItem {
    month_plan_id: number;
    month: string;  // "YYYY-MM"
    physical_quality: string | null;
    planned_volume: number;
    planned_intensity: number;
    coherence_percentage: number;
    deviation_warning: boolean;
}

export interface PlanCoherenceWeekItem {
    weekly_override_id: number;
    week_id: string;
    month_plan_id: number;
    physical_quality: string | null;
    planned_volume: number;
    planned_intensity: number;
    month_volume: number;
    month_intensity: number;
    coherence_percentage: number;
    deviation_warning: boolean;
    inherited: boolean;
}

export interface PlanCoherenceDayItem {
    daily_override_id: number;
    date: string;  // ISO date
    physical_quality: string | null;
    planned_volume: number;
    planned_intensity: number;
    week_volume: number;
    week_intensity: number;
    coherence_percentage: number;
    deviation_warning: boolean;
    inherited: boolean;
}

export interface PlanCoherenceResponse {
    plan_id: number;
    month_coherence: PlanCoherenceMonthItem[];
    week_coherence: PlanCoherenceWeekItem[];
    day_coherence: PlanCoherenceDayItem[];
    overall_coherence: number;
    deviation_threshold: number;
}

// ============================================================================
// PLAN ALIGNMENT (period-based: month / week / day)
// GET /api/v1/training-plans/{plan_id}/alignment?weekly_override_id=&daily_override_id=
// ============================================================================

export type AlignmentCycleType = "month" | "week" | "day";

export interface CycleAlignmentPoint {
    cycle_id: number;
    cycle_type: AlignmentCycleType;
    cycle_name: string;
    date: string;  // ISO date
    physical_quality: string | null;
    volume: number | null;  // 1-10
    intensity: number | null;  // 1-10
    month_plan_id?: number | null;
    month?: string | null;
    weekly_override_id?: number | null;
    week_id?: string | null;
    daily_override_id?: number | null;
}

export interface ParentCycleValues {
    physical_quality: string | null;
    volume: number | null;
    intensity: number | null;
    cycle_name: string;
    start_date: string;  // ISO date
    end_date: string;  // ISO date
}

export interface TrainingPlanAlignmentResponse {
    plan_id: number;
    plan_name: string;
    yearly_values: ParentCycleValues | null;
    monthly_values: ParentCycleValues | null;
    alignment_graph: CycleAlignmentPoint[];
}
