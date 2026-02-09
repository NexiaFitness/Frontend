/**
 * sessionRecommendations.ts — Tipos para GET /training-sessions/recommendations
 *
 * Contexto:
 * - Respuesta "Hoy toca": plan del día con volumen/intensidad planificados
 * - Alineado 100% con backend crud_planning.get_session_recommendations
 *
 * @author Frontend Team
 * @since Fase 3 - Alineación documento canónico
 */

/** Detalle de recomendaciones para el día */
export interface SessionDayRecommendations {
    physical_quality: string;
    modality: string;
    client_experience: string;
    planned_volume_scale: number;
    planned_intensity_scale: number;
    training_frequency: number;
    weekly_volume_units: number;
    weekly_volume_unit_type: string;
    recommended_daily_volume_units: number;
    recommended_daily_volume_scale: number;
    recommended_daily_intensity_scale: number;
    day_inherited: boolean;
    month_volume: number | null;
    month_intensity: number | null;
    week_volume: number | null;
    week_intensity: number | null;
}

/** Respuesta sin plan activo */
export interface SessionRecommendationsNoPlan {
    client_id: number;
    session_date: string;
    has_active_plan: false;
    recommendations: null;
    coherence_warnings: string[];
}

/** Respuesta con plan pero sin valores planificados */
export interface SessionRecommendationsNoValues {
    client_id: number;
    session_date: string;
    has_active_plan: true;
    has_planned_day?: boolean;
    has_planned_values: false;
    recommendations: null;
    coherence_warnings: string[];
}

/** Respuesta con plan y valores planificados */
export interface SessionRecommendationsWithValues {
    client_id: number;
    session_date: string;
    has_active_plan: true;
    has_planned_day: true;
    has_planned_values: true;
    recommendations: SessionDayRecommendations;
    coherence_warnings: string[];
}

export type SessionRecommendationsResponse =
    | SessionRecommendationsNoPlan
    | SessionRecommendationsNoValues
    | SessionRecommendationsWithValues;

/** Params para la query */
export interface SessionRecommendationsParams {
    client_id: number;
    session_date: string;
    trainer_id: number;
}
