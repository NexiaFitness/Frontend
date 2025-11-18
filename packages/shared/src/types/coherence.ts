/**
 * coherence.ts — Tipos TypeScript para Daily Coherence
 *
 * Contexto:
 * - Tipos para métricas de coherencia diaria (adherence, sRPE, monotony, strain)
 * - Usado por ClientDailyCoherenceTab y hooks relacionados
 * - Alineado con estructura de datos del backend (cuando esté disponible)
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import type React from "react";

// ========================================
// TIPOS DE DATOS DE COHERENCE
// ========================================

/**
 * Datos de intensidad prescrita vs percibida
 */
export interface PrescribedPerceivedData {
    prescribed: number;
    perceived: number;
}

/**
 * Datos de monotonía por semana
 */
export interface MonotonyWeekData {
    week: string;
    monotony: number;
}

/**
 * Datos de strain y carga por semana
 */
export interface StrainWeekData {
    week: string;
    load: number;
    strain: number;
}

/**
 * Datos completos de coherencia diaria
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

