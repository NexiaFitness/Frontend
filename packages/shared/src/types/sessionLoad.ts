/**
 * Tipos para GET /clients/{id}/session-load/weekly-by-muscle y POST /session-load/validate-draft
 * (espejo OpenAPI / Pydantic).
 *
 * H4 (motor v2): volumen en pasos de 0,25 (el directo también puede ser fraccional por el
 * descuento pliométrico) y `volume_notes` en todas las respuestas de volumen.
 */

/** Ejercicio citado en una nota de volumen. */
export interface VolumeNoteExerciseOut {
    exercise_id: number;
    exercise_code: string;
    name_es: string;
}

/** Lo que el volumen excluye o no puede contar (backend: VolumeNotesOut). Nunca se oculta. */
export interface VolumeNotesOut {
    /** Series en bloques de calentamiento: no son volumen muscular (D1). */
    warmup_sets_excluded: number;
    /** Líneas sin series ni duración: cuentan 0; las completa el entrenador. */
    lines_missing_sets: VolumeNoteExerciseOut[];
    /** Ejercicios de fuerza sin músculo con grupo; los completa el administrador. */
    unmapped_exercises: VolumeNoteExerciseOut[];
}

export interface WeeklyMusclePlannedLoadRowOut {
    muscle_group_id: number;
    name_es: string;
    planned_sets_sum: number;
    /** Decisión D1: desglose directo/indirecto/total */
    direct_sets?: number;
    indirect_sets?: number;
    total_sets?: number;
}

export type WeeklyLoadCoverageStatus =
    | "empty_week"
    | "no_evaluable"
    | "partial_week"
    | "evaluable";

export interface WeeklySessionPlannedLoadSliceOut {
    session_kind: "training" | "standalone";
    session_id: number;
    session_date: string;
    session_name: string;
    planned_sets_sum: number;
    rows: WeeklyMusclePlannedLoadRowOut[];
}

export interface WeeklyMusclePlannedLoadOut {
    client_id: number;
    week_start: string;
    week_end: string;
    rows: WeeklyMusclePlannedLoadRowOut[];
    coverage_status: WeeklyLoadCoverageStatus;
    sessions_in_week: number;
    expected_training_days?: number | null;
    session_slices?: WeeklySessionPlannedLoadSliceOut[] | null;
    volume_notes: VolumeNotesOut;
}

export interface GetWeeklySessionLoadByMuscleArg {
    clientId: number;
    weekStart: string;
    excludeTrainingSessionId?: number;
    excludeStandaloneSessionId?: number;
    /** Default true — alineado con backend D2 */
    includeStandalone?: boolean;
    /** Per-session muscle distribution (same D1/D1b rules) */
    includeSessionBreakdown?: boolean;
}

/**
 * POST /session-load/validate-draft (Fase B) — una línea del constructor (snake_case).
 * El backend la resuelve con la misma regla que las líneas guardadas (calentamiento,
 * isométrico por tiempo, sin series).
 */
export interface SessionLoadDraftExerciseIn {
    exercise_id: number;
    planned_sets?: number | null;
    /** Segundos por serie; sin series = una serie por tiempo. */
    planned_duration?: number | null;
    /** Tipo de bloque de la línea; un bloque de calentamiento no suma volumen. */
    block_type_id?: number | null;
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
    /** Sesiones de la semana que tocan este músculo según patrón del bloque; 0 si no se resolvió. */
    pattern_session_days?: number;
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
    /** Fase 4 — Intelligent Training Engine: axial load score for the draft */
    axial_score?: import("./engineSafety").AxialScoreResponse;
    /** Fase 4 — safety flags per exercise in the draft */
    safety_flags?: import("./engineSafety").ExerciseSafetyResponse[];
    /** Notas del borrador: calentamiento excluido, líneas sin series y ejercicios sin mapeo (B6). */
    volume_notes: VolumeNotesOut;
}
