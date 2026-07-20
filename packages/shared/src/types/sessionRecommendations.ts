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

/** Contexto capacidad → bloque → objetivo (GET /training-sessions/recommendations) */
export interface VolumeIntensityContextDto {
    client_capacity: {
        volume_level_es: string;
        max_sets: number;
        min_sets: number | null;
        based_on: Record<string, unknown>;
    } | null;
    block_modulation: {
        volume_level: number;
        volume_level_es: string;
        intensity_level: number;
        intensity_level_es: string;
    };
    result: {
        weekly_target_sets: number | null;
        daily_target_sets: number | null;
        weekly_target_label: string | null;
        daily_target_label: string | null;
    };
}

/** Patrón de movimiento esperado para el día */
export interface SessionDayMovementPattern {
    id: number;
    name_es: string;
    ui_bucket: string;
    sub_pattern: string | null;
}

/** Grupo muscular objetivo derivado de los patrones del día */
export interface SessionDayTargetMuscleGroup {
    id: number;
    name_es: string;
}

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
    /** Origen de volumen/intensidad: block | week | month */
    source?: string | null;
    period_block_id?: number | null;
    period_block_name?: string | null;
    period_block_start_date?: string | null;
    period_block_end_date?: string | null;
    block_week_ordinal?: number | null;
    block_week_count?: number | null;
    month_volume: number | null;
    month_intensity: number | null;
    week_volume: number | null;
    week_intensity: number | null;
    /** Patrones de movimiento planificados para esta fecha (Fase A — movement_patterns) */
    movement_patterns?: SessionDayMovementPattern[] | null;
    /** Grupos musculares objetivo del día (heurística catálogo + estructura semanal) */
    target_muscle_groups?: SessionDayTargetMuscleGroup[] | null;
    /** Plan activo (navegación a estructura semanal) */
    training_plan_id?: number | null;
    /** Nivel volumen/intensidad nominal del bloque (1–10) */
    volume_level?: number | null;
    intensity_level?: number | null;
    /** Cobertura de estructura semanal vs semanas calendario del bloque */
    configured_week_count?: number | null;
    calendar_week_count?: number | null;
    has_complete_weekly_structure?: boolean | null;
    /** Si la semana ordinal de session_date tiene fila en weekly_structure_weeks */
    current_week_has_structure?: boolean | null;
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
    /** Fase 4 — Intelligent Training Engine */
    axial_threshold?: number;
    client_has_injuries?: boolean;
    injury_regions?: string[];
    volume_intensity_context?: VolumeIntensityContextDto;
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
