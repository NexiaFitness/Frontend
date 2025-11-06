/**
 * progress.ts — Tipos para sistema de progreso físico del cliente
 *
 * Contexto:
 * - Alineado 100% con Swagger backend (ClientProgressOut, ProgressAnalytics)
 * - Usado por ClientDetail para mostrar evolución de peso/IMC
 * - Gráficos de tendencias y analytics
 *
 * Endpoints:
 * - GET /progress/?client_id={id}
 * - GET /progress/analytics/{client_id}
 *
 * @author Frontend Team
 * @since v3.1.0
 */

// ========================================
// CLIENT PROGRESS (Historial de mediciones)
// ========================================

export interface ClientProgress {
    id: number;
    client_id: number;
    fecha_registro: string; // ISO date
    peso: number | null;
    altura: number | null;
    unidad: string | null;
    imc: number | null;
    notas: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

// ========================================
// PROGRESS ANALYTICS (Análisis de tendencias)
// ========================================

export interface ProgressRecord {
    date: string; // ISO date
    weight: number | null;
    height: number | null;
    bmi: number | null;
    notes: string | null;
}

export type ProgressTrend =
    | 'stable'
    | 'losing_weight'
    | 'gaining_weight'
    | 'maintaining_weight';

export interface ProgressAnalytics {
    client_id: number;
    total_records: number;
    first_record_date: string | null; // ISO date
    latest_record_date: string | null; // ISO date
    weight_change_kg: number | null;
    bmi_change: number | null;
    progress_trend: ProgressTrend;
    progress_records: ProgressRecord[];
}

// ========================================
// PROGRESS TRACKING (Por ejercicio)
// ========================================

export interface ProgressTracking {
    id: number;
    client_id: number;
    exercise_id: number;
    tracking_date: string; // ISO date
    max_weight: number | null;
    max_reps: number | null;
    max_duration: number | null;
    max_distance: number | null;
    estimated_1rm: number | null;
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}