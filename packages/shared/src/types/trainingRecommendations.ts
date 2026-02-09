/**
 * trainingRecommendations.ts — Tipos para GET /training-plans/recommendations/{client_id}
 *
 * Contexto:
 * - Respuesta 3-card: Volume, Intensidad, Selección de ejercicios
 * - Alineado 100% con backend crud_exercises.get_training_plan_recommendations
 *
 * @author Frontend Team
 * @since Fase 2 - Alineación documento canónico
 */

export interface TrainingPlanRecommendationsBasedOn {
    experience: string | null;
    training_frequency: number | null;
    session_duration: string | null;
    objective: string | null;
}

/** Recomendación de volumen (sets por grupo muscular por semana) */
export interface VolumeRecommendation {
    level: string;
    level_es: string;
    range: string;
    min_sets: number;
    max_sets: number;
    explanation: string;
}

/** Recomendación de intensidad (RPE, %1RM, RIR) */
export interface IntensityRecommendation {
    level: string;
    level_es: string;
    rpe_range: string;
    percent_1rm_range: string;
    rir_range: string;
    explanation: string;
}

/** Recomendación de selección de ejercicios (categorías y número por sesión) */
export interface ExerciseSelectionRecommendation {
    categories: string[];
    categories_raw: string[];
    total_exercises_per_session: number;
    explanation: string;
}

export interface TrainingPlanRecommendationsThreeCard {
    volume: VolumeRecommendation;
    intensity: IntensityRecommendation;
    exercise_selection: ExerciseSelectionRecommendation;
}

export interface TrainingPlanRecommendationsScenario {
    key: string;
    input_classification: Record<string, unknown>;
}

/** Respuesta cuando la ficha del cliente está incompleta */
export interface TrainingPlanRecommendationsIncomplete {
    client_id: number;
    status: "incomplete";
    message: string;
    missing_fields: string[];
    recommendations: null;
    based_on: TrainingPlanRecommendationsBasedOn;
}

/** Respuesta cuando hay recomendaciones completas */
export interface TrainingPlanRecommendationsComplete {
    client_id: number;
    status: "complete";
    recommendations: TrainingPlanRecommendationsThreeCard;
    based_on: TrainingPlanRecommendationsBasedOn;
    scenario: TrainingPlanRecommendationsScenario;
}

export type TrainingPlanRecommendationsResponse =
    | TrainingPlanRecommendationsIncomplete
    | TrainingPlanRecommendationsComplete;
