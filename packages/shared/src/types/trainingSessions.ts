/**
 * Training Sessions Types
 * Sesiones de entrenamiento con link directo a Training Plans
 * Sin dependencia obligatoria de Macrocycles/Mesocycles/Microcycles
 *
 * Coherencia: el backend incluye opcionalmente coherence en POST/PUT (Fase 3 plan UX).
 *
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

/** Aviso de coherencia (backend: coherence.coherence_warnings[].message) */
export interface SessionCoherenceWarning {
    type?: string;
    message: string;
    deviation_percentage?: number;
    planned_value?: number;
    actual_value?: number;
}

/** Respuesta de validación de coherencia (GET .../coherence o en POST/PUT session) */
export interface SessionCoherence {
    session_id: number;
    has_planned_values?: boolean;
    session_has_values?: boolean;
    planned_volume?: number;
    planned_intensity?: number;
    session_volume?: number;
    session_intensity?: number;
    volume_deviation?: number;
    intensity_deviation?: number;
    coherence_percentage?: number;
    coherence_warnings: SessionCoherenceWarning[];
}

/** Item de sugerencia de ejercicio (GET /training-sessions/exercise-selection/suggestions) */
export interface ExerciseSelectionSuggestionItem {
    id: number;
    exercise_id: number;
    nombre: string;
    nombre_ingles: string | null;
    tipo: string;
    equipo: string | null;
    musculatura_principal: string | null;
    nivel: string | null;
}

/** Parámetros para GET exercise-selection/suggestions */
export interface ExerciseSelectionSuggestionsParams {
    exercise_type: "multi_joint" | "single_joint";
    equipment?: string | null;
    level?: string | null;
    limit?: number;
}

/** Respuesta de GET exercise-selection/suggestions */
export interface ExerciseSelectionSuggestionsResponse {
    exercise_type: string;
    count: number;
    suggestions: ExerciseSelectionSuggestionItem[];
}

/**
 * Training Session - Sesión individual de entrenamiento
 * Vinculada directamente a un Training Plan (puede tener o no microcycle_id)
 * 
 * NOTA: Este tipo refleja la estructura real del backend después de la migración flexible.
 * - training_plan_id: Opcional, para sesiones vinculadas directamente al plan
 * - microcycle_id: Opcional, para compatibilidad con planes legacy
 */
export interface TrainingSession {
    id: number;
    training_plan_id: number | null;  // Link directo al plan
    period_block_id: number | null;   // Link al bloque de periodización (mesociclo)
    microcycle_id: number | null;     // Link a microcycle (legacy, opcional)
    client_id: number;
    trainer_id: number;
    session_date: string | null;      // ISO date: "2026-01-23", nullable for generic plans
    /** Hora local de la sesión (backend: Time → JSON "HH:MM:SS" o null). */
    session_time?: string | null;
    session_name: string;
    session_type: string;
    // Generic plan support
    training_day_number?: number | null; // ge=1, for generic plans
    is_generic_session: boolean;         // default=False
    planned_duration: number | null;     // in minutes
    actual_duration: number | null;       // in minutes
    planned_intensity: number | null;   // 0-100% or 1-10 scale
    planned_volume: number | null;       // 0-100% or 1-10 scale
    actual_intensity: number | null;
    actual_volume: number | null;
    status: string;                      // planned, completed, skipped, modified
    notes: string | null;
    created_at: string;                 // ISO datetime
    updated_at: string;                  // ISO datetime
    is_active: boolean;
    /** Incluido en POST/PUT por backend (Fase 3); evita GET adicional. */
    coherence?: SessionCoherence | null;
}

/**
 * Payload para crear Training Session
 * Requiere training_plan_id (nuevo modelo) o microcycle_id (legacy)
 */
export interface TrainingSessionCreate {
    training_plan_id?: number | null;   // Link directo al plan
    period_block_id?: number | null;    // Link al bloque de periodización
    microcycle_id?: number | null;       // Legacy: link a microcycle (opcional)
    client_id: number;
    trainer_id: number;
    session_date: string;                // ISO date: "2026-01-23"
    session_time?: string | null;
    session_name: string;
    session_type: string;
    training_day_number?: number | null;
    is_generic_session?: boolean;        // default=False
    planned_duration?: number | null;     // in minutes
    actual_duration?: number | null;     // in minutes
    planned_intensity?: number | null;   // 0-100% or 1-10 scale
    planned_volume?: number | null;      // 0-100% or 1-10 scale
    actual_intensity?: number | null;
    actual_volume?: number | null;
    status?: string;                     // Default: "planned"
    notes?: string | null;
}

/**
 * Payload para actualizar Training Session
 */
export interface TrainingSessionUpdate {
    period_block_id?: number | null;
    session_date?: string;
    session_time?: string | null;
    session_name?: string;
    session_type?: string;
    training_day_number?: number | null;
    is_generic_session?: boolean;
    planned_duration?: number | null;
    actual_duration?: number | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    actual_intensity?: number | null;
    actual_volume?: number | null;
    status?: string;
    notes?: string | null;
}

/**
 * Tipos de sesión de entrenamiento
 */
export type TrainingSessionType = 
    | 'strength'      // Fuerza
    | 'cardio'        // Cardio
    | 'flexibility'   // Flexibilidad
    | 'mixed'         // Mixta
    | 'recovery'      // Recuperación
    | 'training';     // Genérico (compatibilidad)

/**
 * Niveles de intensidad
 */
export type IntensityLevel = 
    | 'low'           // Baja (RPE 1-3)
    | 'moderate'      // Moderada (RPE 4-6)
    | 'high'          // Alta (RPE 7-8)
    | 'very_high';    // Muy Alta (RPE 9-10)

/**
 * Constantes para UI
 */
export const SESSION_TYPE_LABELS: Record<TrainingSessionType, string> = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    flexibility: 'Flexibilidad',
    mixed: 'Mixta',
    recovery: 'Recuperación',
    training: 'Entrenamiento',
};

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
    low: 'Baja',
    moderate: 'Moderada',
    high: 'Alta',
    very_high: 'Muy Alta',
};

/**
 * Status de sesión de entrenamiento
 * (Renombrado para evitar conflicto con SessionStatus de scheduling)
 */
export type TrainingSessionStatus = 
    | 'planned'   // Planificada
    | 'completed' // Completada
    | 'skipped'   // Saltada
    | 'modified'; // Modificada

export const TRAINING_SESSION_STATUS_LABELS: Record<TrainingSessionStatus, string> = {
    planned: 'Planificada',
    completed: 'Completada',
    skipped: 'Saltada',
    modified: 'Modificada',
};

/**
 * Session Exercise - Ejercicio asociado directamente a una Training Session
 * Vinculado directamente a la sesión (sin pasar por SessionBlocks)
 * 
 * @author Frontend Team - NEXIA
 * @since v6.1.0
 */
export interface SessionExercise {
    id: number;
    training_session_id: number;
    exercise_id: number;
    order_in_session: number;
    planned_sets: number | null;
    planned_reps: number | null;  // Backend usa int, no string
    planned_weight: number | null;
    planned_duration: number | null;
    planned_distance: number | null;
    planned_rest: number | null;
    actual_sets: number | null;
    actual_reps: number | null;
    actual_weight: number | null;
    actual_duration: number | null;
    actual_distance: number | null;
    actual_rest: number | null;
    notes: string | null;
    created_at: string;  // ISO datetime
    updated_at: string;  // ISO datetime
    is_active: boolean;
    // Relaciones opcionales (pueden venir del backend)
    alternatives?: Array<Record<string, unknown>>;  // Equipment-based alternatives
    injury_alert?: unknown;  // Injury conflict alert
    exercise?: {
        id: number;
        nombre: string;
        // Otros campos de Exercise si se necesitan
    };
}

/**
 * Payload para crear Session Exercise
 * training_session_id es opcional porque se usa del URL param
 * 
 * @author Frontend Team - NEXIA
 * @since v6.1.0
 */
export interface SessionExerciseCreate {
    exercise_id: number;
    training_session_id?: number;  // Opcional (usa URL param)
    order_in_session: number;
    planned_sets?: number | null;
    planned_reps?: number | null;  // Backend espera int, convertir de string
    planned_weight?: number | null;
    planned_duration?: number | null;
    planned_distance?: number | null;
    planned_rest?: number | null;
    notes?: string | null;
}

