/**
 * Tipos para GET /clients/{id}/session-load/weekly-by-muscle (espejo OpenAPI / Pydantic).
 */

export interface WeeklyMusclePlannedLoadRowOut {
    muscle_group_id: number;
    name_es: string;
    planned_sets_sum: number;
    /** Decisión D1: desglose directo/indirecto/total */
    direct_sets?: number;
    indirect_sets?: number;
    total_sets?: number;
}

export interface WeeklyMusclePlannedLoadOut {
    client_id: number;
    week_start: string;
    week_end: string;
    rows: WeeklyMusclePlannedLoadRowOut[];
}

export interface GetWeeklySessionLoadByMuscleArg {
    clientId: number;
    weekStart: string;
    excludeTrainingSessionId?: number;
    excludeStandaloneSessionId?: number;
    /** Default true — alineado con backend D2 */
    includeStandalone?: boolean;
}

/** POST /session-load/validate-draft (Fase B) — cuerpo JSON (snake_case). */
export interface SessionLoadDraftExerciseIn {
    exercise_id: number;
    planned_sets: number;
}

export interface SessionLoadDraftValidateIn {
    client_id: number;
    week_start: string;
    training_session_id?: number | null;
    exclude_standalone_session_id?: number | null;
    include_standalone?: boolean;
    draft_exercises: SessionLoadDraftExerciseIn[];
    /** Fase C: session volume slider 1-10. When set, backend returns hints. */
    volume_level?: number | null;
    session_date?: string | null;
}

/** Respuesta: solo sumas; deficit/on_target/excess lo calcula el frontend (shared). */
export interface SessionLoadDraftRowOut {
    muscle_group_id: number;
    name_es: string;
    accumulated_saved_without_session: number;
    /** Decisión D1: desglose acumulado */
    accumulated_direct?: number;
    accumulated_indirect?: number;
    draft_sets: number;
    /** Decisión D1: desglose borrador */
    draft_direct?: number;
    draft_indirect?: number;
    projected_total: number;
    daily_target: number;
}

/** Fase C: hint textual dinámico por grupo muscular. */
export interface SessionLoadHintOut {
    muscle_group_id: number;
    name_es: string;
    message: string;
    severity: "info" | "warning" | "excess";
}

export interface SessionLoadDraftValidateOut {
    client_id: number;
    week_start: string;
    week_end: string;
    weekly_target: number;
    rows: SessionLoadDraftRowOut[];
    hints: SessionLoadHintOut[];
}
