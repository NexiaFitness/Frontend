/**
 * exerciseAlternatives.ts - Tipos para alternativas de ejercicios
 *
 * Propósito: Tipar CRUD y auto-suggest de alternativas. Backend: /api/v1/exercise-alternatives/*
 * Contexto: Usado por InjuriesTab y ExerciseDetail para sugerir ejercicios alternativos.
 * Mantenimiento: Alinear con backend schemas ExerciseAlternativeOut, ExerciseAlternativeCreate, etc.
 *
 * @author Frontend Team
 * @since v6.2.0 - Ola 1 API Layer
 */

export interface ExerciseAlternativeCreate {
    exercise_id: number;
    alternative_exercise_id: number;
    priority?: number;
    notes?: string | null;
}

export interface ExerciseAlternativeUpdate {
    priority?: number;
    notes?: string | null;
}

export interface ExerciseAlternativeOut {
    id: number;
    exercise_id: number;
    alternative_exercise_id: number;
    priority: number;
    notes: string | null;
    created_at: string;
    is_active: boolean;
}

export interface ExerciseAlternativeWithDetails extends ExerciseAlternativeOut {
    alternative_exercise_name: string | null;
    alternative_exercise_equipo: string | null;
}

/** Respuesta de GET /exercise-alternatives/auto-suggest/{exercise_id} */
export interface ExerciseAutoSuggestItem {
    id: number;
    exercise_id: number;
    nombre: string;
    nombre_ingles: string | null;
    equipo: string;
    patron_movimiento: string;
    musculatura_principal: string;
    tipo: string;
    nivel: string;
    similarity_score: number;
    reason: string;
}

/** Respuesta de GET /exercise-alternatives/equipment-based/{exercise_id} */
export interface EquipmentAlternativesResponse {
    original_exercise: {
        id: number;
        nombre: string;
        equipo: string;
        patron_movimiento: string;
    };
    target_equipment: string;
    alternatives_found: number;
    alternatives: Array<{
        id: number;
        exercise_id: number;
        nombre: string;
        nombre_ingles: string | null;
        equipo: string;
        musculatura_principal: string;
        nivel: string;
    }>;
}
