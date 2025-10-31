/**
 * training.ts — Tipos para sistema de planes y sesiones de entrenamiento
 *
 * Contexto:
 * - Alineado 100% con Swagger backend
 * - TrainingPlanOut, TrainingSessionOut, ClientFeedbackOut, FatigueAnalysisOut
 * - Usado por ClientDetail tabs (Workouts, Progress)
 *
 * Endpoints:
 * - GET /training-plans/?client_id={id}
 * - GET /training-sessions/?client_id={id}
 * - GET /training-sessions/feedback/client/{client_id}
 * - GET /fatigue/clients/{client_id}/fatigue-analysis/
 *
 * @author Frontend Team
 * @since v3.1.0
 */

// ========================================
// TRAINING PLAN
// ========================================

export interface TrainingPlan {
    id: number;
    trainer_id: number;
    client_id: number;
    name: string;
    description: string | null;
    start_date: string; // ISO date
    end_date: string; // ISO date
    goal: string;
    status: string;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

// ========================================
// TRAINING SESSION
// ========================================

export interface TrainingSession {
    id: number;
    microcycle_id: number;
    client_id: number;
    trainer_id: number;
    session_date: string; // ISO date
    session_name: string;
    session_type: string;
    planned_duration: number | null;
    actual_duration: number | null;
    planned_intensity: number | null;
    planned_volume: number | null;
    actual_intensity: number | null;
    actual_volume: number | null;
    status: string;
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

// ========================================
// CLIENT FEEDBACK
// ========================================

export interface ClientFeedback {
    id: number;
    training_session_id: number;
    client_id: number;
    perceived_effort: number | null; // 1-10
    fatigue_level: number | null; // 1-10
    sleep_quality: number | null; // 1-10
    stress_level: number | null; // 1-10
    motivation_level: number | null; // 1-10
    energy_level: number | null; // 1-10
    muscle_soreness: string | null;
    pain_or_discomfort: string | null;
    notes: string | null;
    feedback_date: string; // ISO datetime
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

// ========================================
// FATIGUE ANALYSIS
// ========================================

export type RiskLevel = 'low' | 'medium' | 'high';
export type SessionType = 'training' | 'standalone';

export interface FatigueAnalysis {
    id: number;
    client_id: number;
    session_id: number | null;
    session_type: SessionType;
    analysis_date: string; // ISO date

    // Pre-session metrics
    pre_fatigue_level: number | null; // 1-10
    pre_energy_level: number | null; // 1-10
    pre_motivation_level: number | null; // 1-10
    pre_sleep_quality: number | null; // 1-10
    pre_stress_level: number | null; // 1-10
    pre_muscle_soreness: string | null;

    // Post-session metrics
    post_fatigue_level: number | null; // 1-10
    post_energy_level: number | null; // 1-10
    post_motivation_level: number | null; // 1-10
    post_muscle_soreness: string | null;

    // Calculated metrics
    fatigue_delta: number | null;
    energy_delta: number | null;
    workload_score: number | null;
    recovery_need_score: number | null;
    risk_level: RiskLevel | null;
    recommendations: string | null;
    next_session_adjustment: string | null;

    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}