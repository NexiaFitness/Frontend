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
 * @updated v3.2.0 - Agregados tipos para CRUD Training Plans (Fase 1)
 * @updated v3.3.0 - Agregados tipos para Cycles System (Fase 2)
 */

// ========================================
// ENUMS
// ========================================

export const TRAINING_PLAN_STATUS = {
    ACTIVE: "active",
    COMPLETED: "completed",
    PAUSED: "paused",
    CANCELLED: "cancelled",
} as const;

export type TrainingPlanStatus = (typeof TRAINING_PLAN_STATUS)[keyof typeof TRAINING_PLAN_STATUS];

export const TRAINING_PLAN_GOAL = {
    MUSCLE_GAIN: "Muscle Gain",
    WEIGHT_LOSS: "Weight Loss",
    STRENGTH: "Strength",
    ENDURANCE: "Endurance",
    GENERAL_FITNESS: "General Fitness",
    REHABILITATION: "Rehabilitation",
    PERFORMANCE: "Performance",
} as const;

export type TrainingPlanGoal = (typeof TRAINING_PLAN_GOAL)[keyof typeof TRAINING_PLAN_GOAL];

// ========================================
// TRAINING PLAN (Entity - Backend Response)
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
// TRAINING PLAN REQUEST TYPES
// ========================================

/**
 * TrainingPlanCreate - POST /training-plans/
 * Alineado con TrainingPlanCreate schema de Swagger
 */
export interface TrainingPlanCreate {
    trainer_id: number;
    client_id: number;
    name: string;
    description?: string | null;
    start_date: string; // ISO date YYYY-MM-DD
    end_date: string; // ISO date YYYY-MM-DD
    goal: string;
    status?: string; // Default: "active"
}

/**
 * TrainingPlanUpdate - PUT /training-plans/{id}
 * Todos los campos opcionales
 */
export interface TrainingPlanUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    goal?: string;
    status?: string;
}

// ========================================
// TRAINING PLAN FILTERS & QUERY PARAMS
// ========================================

export interface TrainingPlanFilters {
    client_id?: number; // Required si no hay trainer_id
    trainer_id?: number; // Required si no hay client_id
    status?: TrainingPlanStatus;
    goal?: TrainingPlanGoal;
    skip?: number; // Pagination offset (default: 0)
    limit?: number; // Pagination limit (default: 100, max: 1000)
}

// ========================================
// API RESPONSES
// ========================================

/**
 * TrainingPlansListResponse
 * Backend devuelve array directo (no wrapper con pagination metadata)
 */
export type TrainingPlansListResponse = TrainingPlan[];

export interface DeleteTrainingPlanResponse {
    message: string;
}

// ========================================
// REDUX STATE
// ========================================

/**
 * TrainingPlanState - Estado de Redux para gestión de training plans
 */
export interface TrainingPlanState {
    plans: TrainingPlan[];
    selectedPlan: TrainingPlan | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    filters: TrainingPlanFilters;
}

// ========================================
// FORM TYPES (Frontend only)
// ========================================

export interface TrainingPlanFormData {
    name: string;
    description?: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    goal: string;
    client_id?: number; // Pre-filled en algunos contextos
}

export interface TrainingPlanFormErrors {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
    client_id?: string;
    general?: string;
}

// ========================================
// MACROCYCLE (Fase Macro)
// ========================================

/**
 * Macrocycle - Fase macro del plan (ej. "Preparación General - 12 semanas")
 * Alineado con MacrocycleOut schema de Swagger
 */
export interface Macrocycle {
    id: number;
    training_plan_id: number;
    name: string;
    description: string | null;
    start_date: string; // ISO date
    end_date: string; // ISO date
    focus: string;
    volume_intensity_ratio: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

/**
 * MacrocycleCreate - POST /training-plans/{plan_id}/macrocycles
 */
export interface MacrocycleCreate {
    training_plan_id: number; // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string; // ISO date YYYY-MM-DD
    end_date: string; // ISO date YYYY-MM-DD
    focus: string;
    volume_intensity_ratio?: string | null;
}

/**
 * MacrocycleUpdate - PUT /training-plans/macrocycles/{id}
 */
export interface MacrocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    focus?: string;
    volume_intensity_ratio?: string | null;
}

// ========================================
// MESOCYCLE (Fase Meso)
// ========================================

/**
 * Mesocycle - Fase meso del macrociclo (ej. "Hipertrofia - 4 semanas")
 * Alineado con MesocycleOut schema de Swagger
 */
export interface Mesocycle {
    id: number;
    macrocycle_id: number;
    name: string;
    description: string | null;
    start_date: string; // ISO date
    end_date: string; // ISO date
    duration_weeks: number;
    primary_focus: string;
    secondary_focus: string | null;
    target_volume: string | null;
    target_intensity: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

/**
 * MesocycleCreate - POST /training-plans/macrocycles/{macrocycle_id}/mesocycles
 */
export interface MesocycleCreate {
    macrocycle_id: number; // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string; // ISO date YYYY-MM-DD
    end_date: string; // ISO date YYYY-MM-DD
    duration_weeks: number;
    primary_focus: string;
    secondary_focus?: string | null;
    target_volume?: string | null;
    target_intensity?: string | null;
}

/**
 * MesocycleUpdate - PUT /training-plans/mesocycles/{id}
 */
export interface MesocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    duration_weeks?: number;
    primary_focus?: string;
    secondary_focus?: string | null;
    target_volume?: string | null;
    target_intensity?: string | null;
}

// ========================================
// MICROCYCLE (Fase Micro)
// ========================================

/**
 * Microcycle - Fase micro del mesociclo (ej. "Semana 1 - Alta intensidad")
 * Alineado con MicrocycleOut schema de Swagger
 */
export interface Microcycle {
    id: number;
    mesocycle_id: number;
    name: string;
    description: string | null;
    start_date: string; // ISO date
    end_date: string; // ISO date
    duration_days: number; // Default: 7
    training_frequency: number; // Default: 3
    deload_week: boolean; // Default: false
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

/**
 * MicrocycleCreate - POST /training-plans/mesocycles/{mesocycle_id}/microcycles
 */
export interface MicrocycleCreate {
    mesocycle_id: number; // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string; // ISO date YYYY-MM-DD
    end_date: string; // ISO date YYYY-MM-DD
    duration_days?: number; // Default: 7
    training_frequency?: number; // Default: 3
    deload_week?: boolean; // Default: false
    notes?: string | null;
}

/**
 * MicrocycleUpdate - PUT /training-plans/microcycles/{id}
 */
export interface MicrocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    training_frequency?: number;
    deload_week?: boolean;
    notes?: string | null;
}

// ========================================
// CYCLES API RESPONSES
// ========================================

export type MacrocyclesListResponse = Macrocycle[];
export type MesocyclesListResponse = Mesocycle[];
export type MicrocyclesListResponse = Microcycle[];

export interface DeleteCycleResponse {
    message: string;
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

export interface AllCyclesResponse {
    macrocycles: Macrocycle[];
    mesocycles: Mesocycle[];
    microcycles: Microcycle[];
}