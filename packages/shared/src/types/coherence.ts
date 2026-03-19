/**
 * coherence.ts — Tipos TypeScript para Daily Coherence
 *
 * Contexto:
 * - Tipos para métricas de coherencia diaria (adherence, sRPE, monotony, strain)
 * - Usado por ClientDailyCoherenceTab y hooks relacionados
 * - Alineado con estructura de datos del backend
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.4.0 - Tipos actualizados para coincidir con backend real
 */

import type React from "react";

// ========================================
// TIPOS DEL BACKEND (snake_case)
// ========================================

/**
 * Punto de datos sRPE para scatter plot (backend)
 */
export interface SRPEPoint {
    prescribed_srpe: number; // X-axis: planned intensity (0-10)
    perceived_srpe: number; // Y-axis: perceived effort from feedback (0-10)
    session_date: string; // ISO date string
    session_id: number;
}

/**
 * Punto genérico de monotonía/strain según granularidad solicitada
 */
export interface MonotonyStrainDataPoint {
    period_start: string; // ISO date string del inicio del periodo
    period_label: string; // Etiqueta amigable (día, semana "W46", mes "Nov 2025")
    monotony: number; // Promedio diario / desviación estándar del periodo
    strain: number; // Carga del periodo × monotonía
    period_load: number; // Carga agregada del periodo (antes weekly_load)
    cumulative_strain: number; // Suma acumulada de strain
}

/**
 * KPIs de coherencia diaria (backend)
 */
export interface DailyCoherenceKPIs {
    adherence_percentage: number; // (Completed / Planned) × 100
    average_srpe: number; // Average perceived sRPE
    monotony: number; // Current week monotony
    strain: number; // Current week strain
}

/**
 * Datos de adherencia para gráficos (backend)
 */
export interface AdherenceDataPoint {
    period: string;
    adherence: number;
}

/**
 * Respuesta completa del backend
 */
export interface DailyCoherenceAnalyticsOut {
    client_id: number;
    period_start: string; // ISO date string
    period_end: string; // ISO date string
    period_type: "week" | "month" | "training_block" | "year";
    kpis: DailyCoherenceKPIs;
    adherence_data: AdherenceDataPoint[]; // For donut/bar chart
    srpe_scatter_data: SRPEPoint[]; // For scatter plot
    monotony_strain_data: MonotonyStrainDataPoint[]; // For line/area chart
    interpretive_summary: string; // Auto-generated text analysis
    key_recommendations: string[]; // Actionable recommendations
}

// ========================================
// TIPOS TRANSFORMADOS (camelCase para UI)
// ========================================

/**
 * Datos de intensidad prescrita vs percibida (transformado)
 */
export interface PrescribedPerceivedData {
    prescribed: number;
    perceived: number;
}

/**
 * Datos de monotonía por semana (transformado)
 */
export interface MonotonyWeekData {
    week: string;
    monotony: number;
}

/**
 * Datos de strain y carga por semana (transformado)
 */
export interface StrainWeekData {
    week: string;
    load: number;
    strain: number;
    cumulative_strain: number;
}

/**
 * Datos completos de coherencia diaria (transformado para UI)
 */
export interface CoherenceData {
    adherence_percentage: number;
    sessions_completed: number;
    sessions_total: number;
    average_srpe: number;
    monotony: number;
    strain: number;
    prescribed_vs_perceived: PrescribedPerceivedData[];
    monotony_by_week: MonotonyWeekData[];
    strain_by_week: StrainWeekData[];
    summary: string;
    recommendations: string[];
}

// ========================================
// TIPOS PARA COMPONENTES UI
// ========================================

/**
 * Color para MetricCard
 */
export type MetricCardColor = "blue" | "green" | "orange" | "red";

/**
 * Props para MetricCard component
 */
export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: MetricCardColor;
}

/**
 * Props para ChartCard component
 */
export interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

// ========================================
// TIPOS PARA TOOLTIPS DE GRÁFICOS
// ========================================

/**
 * Payload de tooltip para datos de monotonía
 */
export interface MonotonyTooltipPayload {
    payload?: MonotonyWeekData & {
        periodLabel?: string;
    };
    value?: number;
    name?: string;
}

/**
 * Payload de tooltip para datos de strain y carga
 */
export interface StrainTooltipPayload {
    payload?: StrainWeekData & {
        periodLabel?: string;
        periodLoad?: number;
        rawStrain?: number;
        rawLoad?: number;
    };
    value?: number;
    name?: string;
}

