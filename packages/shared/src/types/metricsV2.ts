/**
 * types/metricsV2.ts — Tipos TypeScript V2 para módulo de Métricas
 * 
 * Contexto:
 * - Tipos V2 alineados 100% con contratos reales del backend
 * - NO reemplaza tipos legacy en metrics.ts
 * - Usado por metricsApiV2.ts y hooks V2
 * 
 * Diferencia con legacy:
 * - Legacy: espera client_id, trainer_id, date/month individuales
 * - V2: espera items: CIDCalcIn[] y start_date (contrato real del backend)
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 1: Preparación V2
 */

import type { CIDCalcIn, AlertType } from "./metrics";

// ========================================
// REQUESTS V2 (Alineados con backend real)
// ========================================

/**
 * Request V2 para métricas semanales
 * Backend espera: { items: CIDCalcIn[], start_date: date }
 */
export interface WeeklyMetricsRequestV2 {
    items: CIDCalcIn[];
    start_date: string; // ISO date (YYYY-MM-DD)
}

/**
 * Request V2 para métricas diarias
 * Backend espera: { items: CIDCalcIn[], start_date: date }
 */
export interface DailyMetricsRequestV2 {
    items: CIDCalcIn[];
    start_date: string; // ISO date (YYYY-MM-DD)
}

/**
 * Request V2 para métricas mensuales
 * Backend espera: { items: CIDCalcIn[], start_date: date, w_fase?: float }
 */
export interface MonthlyMetricsRequestV2 {
    items: CIDCalcIn[];
    start_date: string; // ISO date (YYYY-MM-DD)
    w_fase?: number; // Phase weight 0.6-1.3, default 1.0
}

/**
 * Request V2 para verificación de umbrales
 * Backend espera: { items: CIDCalcIn[], start_date: date, thresholds, create_alerts?, client_id?, trainer_id? }
 */
export interface CheckThresholdsRequestV2 {
    items: CIDCalcIn[];
    start_date: string; // ISO date (YYYY-MM-DD)
    daily_threshold?: number; // Default 80.0
    weekly_threshold?: number; // Default 450.0
    consecutive_threshold?: number; // Default 70.0
    consecutive_days?: number; // Default 3
    create_alerts?: boolean; // Default false
    client_id?: number; // Required if create_alerts=true
    trainer_id?: number; // Required if create_alerts=true
}

/**
 * Request V2 para carga total
 * Backend espera: { c_fuerza, c_aerobica, c_anaerobica, p_fuerza, p_aerobica, p_anaerobica }
 * 
 * Nota: Este endpoint calcula carga total combinada, no obtiene datos históricos.
 * Diferente del contrato legacy que esperaba client_id, from_date, to_date.
 */
export interface TotalLoadRequestV2 {
    c_fuerza: number; // 0-100
    c_aerobica: number; // 0-100
    c_anaerobica: number; // 0-100
    p_fuerza: number; // 0-1 (weight)
    p_aerobica: number; // 0-1 (weight)
    p_anaerobica: number; // 0-1 (weight)
}

// ========================================
// RESPONSES V2 (Alineados con backend real)
// ========================================

/**
 * Response V2 para métricas semanales
 * Backend devuelve: { buckets: WeeklyBucket[] }
 */
export interface WeeklyBucketV2 {
    week_start: string; // ISO date (Monday)
    cid_sum: number;
    cid_avg: number;
}

export interface WeeklyMetricsResponseV2 {
    buckets: WeeklyBucketV2[];
}

/**
 * Response V2 para métricas diarias
 * Backend devuelve: { days: DailyCIDItem[] }
 */
export interface DailyCIDItemV2 {
    date: string; // ISO date
    input: CIDCalcIn;
    cid_0_100: number;
}

export interface DailyMetricsResponseV2 {
    days: DailyCIDItemV2[];
}

/**
 * Response V2 para métricas mensuales
 * Backend devuelve: { buckets: MonthlyBucket[] }
 */
export interface MonthlyBucketV2 {
    month: number; // 1-12
    cid_sum: number;
    cid_avg: number;
}

export interface MonthlyMetricsResponseV2 {
    buckets: MonthlyBucketV2[];
}

/**
 * Response V2 para verificación de umbrales
 * Backend devuelve: { alerts, has_alerts, daily_max, weekly_max, consecutive_max, created_fatigue_alerts? }
 */
export interface ThresholdAlertV2 {
    type: "daily_high" | "weekly_high" | "consecutive_high";
    severity: "medium" | "high" | "critical";
    message: string;
    value: number;
    threshold: number;
    date: string | null; // ISO date or null
}

export interface CheckThresholdsResponseV2 {
    alerts: ThresholdAlertV2[];
    has_alerts: boolean;
    daily_max: number;
    weekly_max: number;
    consecutive_max: number;
    created_fatigue_alerts?: number | null; // Count if create_alerts=true
}

/**
 * Response V2 para carga total
 * Backend devuelve: { ct_0_100, breakdown }
 */
export interface TotalLoadResponseV2 {
    ct_0_100: number;
    breakdown: {
        fuerza: number;
        aerobica: number;
        anaerobica: number;
    };
}

