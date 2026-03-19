/**
 * metrics.ts — Tipos TypeScript para módulo de Métricas
 *
 * Contexto:
 * - Alineado con los endpoints de métricas del backend (POST)
 * - Sin dependencias de UI (uso en hooks/api dentro de shared)
 * - Patrón DDD/Hexagonal consistente con types/client y types/training
 *
 * Endpoints cubiertos:
 * - POST /metrics/normalize-intensity
 * - POST /metrics/fuerza-calc
 * - POST /metrics/aerobic-calc
 * - POST /metrics/anaerobic-calc
 * - POST /metrics/cid
 * - POST /metrics/daily
 * - POST /metrics/weekly
 * - POST /metrics/monthly
 * - POST /metrics/total-load
 * - POST /metrics/check-thresholds
 * - POST /metrics/normalize-volume
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

// ========================================
// ENUMS
// ========================================

export const INTENSITY_TYPE = {
    RELATIVE: "relative", // Intensidad relativa (0-10 RPE)
    ABSOLUTE: "absolute", // Intensidad absoluta (ej. watts, kg)
} as const;
export type IntensityType = (typeof INTENSITY_TYPE)[keyof typeof INTENSITY_TYPE];

export const LOAD_TYPE = {
    FUERZA: "fuerza",
    AEROBIC: "aerobic",
    ANAEROBIC: "anaerobic",
} as const;
export type LoadType = (typeof LOAD_TYPE)[keyof typeof LOAD_TYPE];

export const ALERT_TYPE = {
    INFO: "info",
    WARNING: "warning",
    CRITICAL: "critical",
} as const;
export type AlertType = (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE];

export const EXPERIENCE_LEVEL = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];

// ========================================
// COMMON STRUCTS
// ========================================

export interface SessionContext {
    client_id: number;
    trainer_id?: number;
    session_date: string; // ISO date
}

export interface LoadBreakdown {
    load_type: LoadType;
    total_volume: number;
    avg_intensity: number;
    sessions: number;
}

export interface MetricsAlert {
    type: AlertType;
    message: string;
    severity: AlertType;
    field?: string;
    code?: string;
}

// ========================================
// REQUESTS
// ========================================

export interface NormalizeIntensityRequest extends SessionContext {
    load_type: LoadType;
    intensity: number; // 0-10
    intensity_type: IntensityType;
    volume?: number;
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

export interface NormalizeVolumeRequest extends SessionContext {
    load_type: LoadType;
    volume: number;
    duration_minutes?: number;
    intensity?: number; // 0-10
    experiencia?: ExperienceLevel;
}

export interface FuerzaCalcRequest extends SessionContext {
    volume: number;
    intensity: number; // 0-10
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

export interface AerobicCalcRequest extends SessionContext {
    volume: number;
    intensity: number; // 0-10
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

export interface AnaerobicCalcRequest extends SessionContext {
    volume: number;
    intensity: number; // 0-10
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

export interface CalculateCIDRequest extends SessionContext {
    load_type: LoadType;
    intensity: number; // 0-10
    volume: number;
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

export interface DailyMetricsRequest {
    client_id: number;
    trainer_id?: number;
    date: string; // ISO date
}

export interface CIDCalcIn {
    volumen_level: number; // 1-10
    intensidad_level: number; // 1-10
    k_fase?: number; // Default 1.0
    k_experiencia?: number; // Default 1.0
    p?: number; // Default 1.0, Exponent 1.0-1.3
}

export interface WeeklyMetricsRequest {
    items: CIDCalcIn[];
    start_date: string; // ISO date
}

export interface MonthlyMetricsRequest {
    client_id: number;
    trainer_id?: number;
    month: string; // YYYY-MM
}

export interface TotalLoadRequest {
    client_id: number;
    trainer_id?: number;
    from_date: string; // ISO date
    to_date: string; // ISO date
    load_type?: LoadType;
}

export interface CheckThresholdsRequest extends SessionContext {
    load_type: LoadType;
    intensity: number;
    volume: number;
    duration_minutes?: number;
    experiencia?: ExperienceLevel;
}

// ========================================
// RESPONSES
// ========================================

export interface NormalizedIntensityResponse {
    normalized_intensity: number;
    load_type: LoadType;
    intensity_type: IntensityType;
    method?: string;
}

export interface NormalizedVolumeResponse {
    normalized_volume: number;
    load_type: LoadType;
    method?: string;
}

export interface LoadCalculation {
    load_type: LoadType;
    session_load: number;
    normalized_intensity?: number;
    normalized_volume?: number;
    duration_minutes?: number;
    alerts?: MetricsAlert[];
}

export interface CIDCalculation {
    load_type: LoadType;
    cid_score: number;
    status: AlertType;
    alerts?: MetricsAlert[];
}

export interface AggregateMetrics {
    client_id: number;
    trainer_id?: number;
    period_start: string; // ISO date
    period_end: string; // ISO date
    total_volume: number;
    total_duration_minutes: number;
    avg_intensity: number;
    load_breakdown: LoadBreakdown[];
    alerts?: MetricsAlert[];
}

export interface DailyMetricsResponse extends AggregateMetrics {
    day: string; // ISO date
}

export interface WeeklyBucket {
    week_start: string; // ISO date (Monday)
    cid_sum: number;
    cid_avg: number;
}

export interface WeeklyMetricsResponse {
    buckets: WeeklyBucket[];
}

export interface MonthlyMetricsResponse extends AggregateMetrics {
    month: string; // YYYY-MM
}

export interface TotalLoadResponse {
    client_id: number;
    trainer_id?: number;
    from_date: string; // ISO date
    to_date: string; // ISO date
    total_load: number;
    load_breakdown: LoadBreakdown[];
}

export interface CheckThresholdsResponse {
    is_within_thresholds: boolean;
    alerts: MetricsAlert[];
    recommended_action?: string;
}

export interface FuerzaCalcResponse extends LoadCalculation {}
export interface AerobicCalcResponse extends LoadCalculation {}
export interface AnaerobicCalcResponse extends LoadCalculation {}


