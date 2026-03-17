/**
 * sessionProgramming.ts — Tipos para Session Programming
 *
 * Contexto:
 * - Alineado 100% con Swagger backend
 * - Session Templates, Training Block Types, Sessions, Blocks
 * - Endpoints: /session-programming/*
 *
 * @author Frontend Team
 * @since v5.2.0
 */

// ========================================
// ENUMS
// ========================================

export const SET_TYPE = {
    SINGLE_SET: "single_set",
    SUPERSET: "superset",
    DROPSET: "dropset",
    GIANT_SET: "giant_set",
    CIRCUIT: "circuit",
    FOR_TIME: "for_time",
    EMOM: "emom",
    AMRAP: "amrap",
} as const;

export type SetType = (typeof SET_TYPE)[keyof typeof SET_TYPE];

/** Labels para UI (Constructor de Sesión, selector tipo serie) */
export const SET_TYPE_LABELS: Record<SetType, string> = {
    single_set: "Clásico",
    superset: "Superset",
    dropset: "Dropset",
    giant_set: "Giant Set",
    circuit: "Circuit",
    for_time: "For Time",
    emom: "EMOM",
    amrap: "AMRAP",
};

export const EFFORT_CHARACTER = {
    RPE: "rpe",
    RIR: "rir",
    VELOCITY_LOSS: "velocity_loss",
} as const;

export type EffortCharacter = (typeof EFFORT_CHARACTER)[keyof typeof EFFORT_CHARACTER];

// ========================================
// TRAINING BLOCK TYPE
// ========================================

export interface TrainingBlockType {
    id: number;
    name: string;
    description: string | null;
    is_predefined: boolean;
    color: string | null;
    icon: string | null;
    created_by_trainer_id: number | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

export interface TrainingBlockTypeCreate {
    name: string;
    description?: string | null;
    is_predefined?: boolean; // Default: true
    color?: string | null;
    icon?: string | null;
}

export interface TrainingBlockTypeUpdate {
    name?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
}

// ========================================
// SESSION TEMPLATE
// ========================================

export interface SessionTemplate {
    id: number;
    trainer_id: number;
    name: string;
    description: string | null;
    session_type: string;
    estimated_duration: number | null; // in minutes
    difficulty_level: string | null;
    target_muscles: string | null;
    equipment_needed: string | null;
    is_public: boolean;
    usage_count: number;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

export interface SessionTemplateCreate {
    name: string;
    description?: string | null;
    session_type: string;
    estimated_duration?: number | null;
    difficulty_level?: string | null;
    target_muscles?: string | null;
    equipment_needed?: string | null;
    is_public?: boolean; // Default: false
}

export interface SessionTemplateUpdate {
    name?: string;
    description?: string | null;
    session_type?: string;
    estimated_duration?: number | null;
    difficulty_level?: string | null;
    target_muscles?: string | null;
    equipment_needed?: string | null;
    is_public?: boolean;
}

// ========================================
// SESSION BLOCK
// ========================================

export interface SessionBlock {
    id: number;
    training_session_id: number;
    block_type_id: number;
    order_in_session: number;
    set_type: SetType | null;
    rounds: number | null;
    time_cap: number | null;
    interval_seconds: number | null;
    objective_text: string | null;
    planned_intensity: number | null;
    planned_volume: number | null;
    actual_intensity: number | null;
    actual_volume: number | null;
    estimated_duration: number | null; // in minutes
    actual_duration: number | null; // in minutes
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

export interface SessionBlockCreate {
    block_type_id: number;
    order_in_session: number;
    set_type?: SetType | null;
    rounds?: number | null;
    time_cap?: number | null;
    interval_seconds?: number | null;
    objective_text?: string | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    actual_intensity?: number | null;
    actual_volume?: number | null;
    estimated_duration?: number | null;
    actual_duration?: number | null;
    notes?: string | null;
}

export interface SessionBlockUpdate {
    set_type?: SetType | null;
    rounds?: number | null;
    time_cap?: number | null;
    interval_seconds?: number | null;
    objective_text?: string | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    actual_intensity?: number | null;
    actual_volume?: number | null;
    estimated_duration?: number | null;
    actual_duration?: number | null;
    notes?: string | null;
}

// ========================================
// SESSION BLOCK EXERCISE
// ========================================

export interface SessionBlockExercise {
    id: number;
    session_block_id: number;
    exercise_id: number;
    order_in_block: number;
    set_type: SetType;
    superset_group_id: number | null;
    dropset_sequence: number | null;
    planned_sets: number | null;
    planned_reps: string | null;
    planned_weight: number | null;
    planned_duration: number | null; // in seconds
    planned_distance: number | null;
    planned_rest: number | null; // in seconds
    effort_character: EffortCharacter | null;
    effort_value: number | null;
    actual_sets: number | null;
    actual_reps: string | null;
    actual_weight: number | null;
    actual_duration: number | null; // in seconds
    actual_distance: number | null;
    actual_rest: number | null; // in seconds
    actual_effort_value: number | null;
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

export interface SessionBlockExerciseCreate {
    exercise_id: number;
    order_in_block: number;
    set_type?: SetType; // Default: "single_set"
    superset_group_id?: number | null;
    dropset_sequence?: number | null;
    planned_sets?: number | null;
    planned_reps?: string | null;
    planned_weight?: number | null;
    planned_duration?: number | null;
    planned_distance?: number | null;
    planned_rest?: number | null;
    effort_character?: EffortCharacter | null;
    effort_value?: number | null;
    notes?: string | null;
}

export interface SessionBlockExerciseUpdate {
    planned_sets?: number | null;
    planned_reps?: string | null;
    planned_weight?: number | null;
    planned_duration?: number | null;
    planned_distance?: number | null;
    planned_rest?: number | null;
    effort_character?: EffortCharacter | null;
    effort_value?: number | null;
    actual_sets?: number | null;
    actual_reps?: string | null;
    actual_weight?: number | null;
    actual_duration?: number | null;
    actual_distance?: number | null;
    actual_rest?: number | null;
    actual_effort_value?: number | null;
    notes?: string | null;
}

// ========================================
// SESSION SUMMARY
// ========================================

export interface SessionSummary {
    total_sets: number;
    estimated_duration: number; // in minutes
    blocks: number;
    planned_intensity: number | null;
    planned_volume: number | null;
    actual_intensity: number | null;
    actual_volume: number | null;
}

// ========================================
// TRAINING SESSION CREATE (for session programming)
// ========================================

/** Fase 6: sessions use training_plan_id only; microcycle_id no longer sent. */
export interface TrainingSessionCreate {
    training_plan_id: number;
    client_id: number;
    trainer_id: number;
    session_date: string; // ISO date YYYY-MM-DD
    session_name: string;
    session_type: string;
    planned_duration?: number | null;
    actual_duration?: number | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    actual_intensity?: number | null;
    actual_volume?: number | null;
    status?: string;
    notes?: string | null;
}

// ========================================
// FORM TYPES (Frontend only)
// ========================================

/**
 * CreateSessionFormData - Datos del formulario para crear sesión
 * Usado en componentes de UI para capturar datos del usuario
 */
export interface CreateSessionFormData {
    sessionName: string;
    sessionDate: string; // ISO date YYYY-MM-DD
    sessionType: string;
    plannedDuration: string; // String del input, puede estar vacío
    plannedIntensity: string; // String del input, puede estar vacío
    plannedVolume: string; // String del input, puede estar vacío
    trainingPlanId: string; // Fase 6: plan ID (required)
    notes: string; // Puede estar vacío
}

/**
 * CreateSessionFormErrors - Errores de validación del formulario
 */
export interface CreateSessionFormErrors {
    sessionName?: string;
    sessionDate?: string;
    sessionType?: string;
    trainingPlanId?: string;
    plannedDuration?: string;
    plannedIntensity?: string;
    plannedVolume?: string;
    notes?: string;
}

