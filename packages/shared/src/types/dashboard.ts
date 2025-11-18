/**
 * dashboard.ts — Tipos TypeScript para Trainer Dashboard
 *
 * Contexto:
 * - Tipos para KPIs del dashboard (improvement, satisfaction, adherence, progress, billing)
 * - Alineado con endpoints implementados por backend
 * - Usado por hooks y componentes del dashboard
 *
 * @author Frontend Team
 * @since v5.3.0
 */

// ========================================
// KPI RESPONSES
// ========================================

/**
 * Respuesta de Avg Client Improvement
 * Endpoint: GET /api/v1/clients/improvement-avg
 */
export interface ClientImprovementResponse {
    average: number;
    trend: string;
}

/**
 * Respuesta de Client Satisfaction
 * Endpoint: GET /api/v1/clients/satisfaction-avg
 */
export interface ClientSatisfactionResponse {
    rating: number;
    total_reviews: number;
    trend: string;
}

/**
 * Respuesta de Plan Adherence
 * Endpoint: GET /api/v1/training-plans/adherence-stats
 */
export interface PlanAdherenceResponse {
    adherence_percentage: number;
    trend: string;
}

/**
 * Respuesta de Progress Categories
 * Endpoint: GET /api/v1/clients/progress-categories
 */
export interface ProgressCategoriesResponse {
    on_track: number;
    behind_schedule: number;
    need_attention: number;
    overall_percentage: number;
    trend: string;
}

// ========================================
// BILLING TYPES
// ========================================

/**
 * Periodo para estadísticas de billing
 */
export type BillingPeriod = "monthly" | "annual";

/**
 * Punto de dato para gráfico de billing
 */
export interface BillingDataPoint {
    month: string;
    revenue: number;
    clients: number;
    growth?: number;
}

/**
 * Respuesta de Billing Stats
 * Endpoint: GET /api/v1/billing/stats?period=monthly|annual
 */
export interface BillingStatsResponse {
    data: BillingDataPoint[];
    summary: {
        current: number;
        growth: string;
        revenue: string;
        year: number;
    };
}

