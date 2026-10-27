/**
 * engineSafety.ts — Tipos para el Intelligent Training Engine (safety filter + alternatives)
 *
 * Contexto:
 * - Contratos con backend: backend/app/schemas/engine_safety.py
 * - Endpoints: POST /exercises/safety-check, POST /exercises/safety-check/batch
 *   GET /exercises/{id}/safe-alternatives, POST /session-load/validate-draft,
 *   POST /session-validation/validate-session, GET /training-sessions/recommendations
 *
 * @author Frontend Team
 * @since Fase 4 — Intelligent Training Engine frontend integration
 */

// ---------------------------------------------------------------------------
// Axial load scoring
// ---------------------------------------------------------------------------

export interface AxialScoreItemOut {
    exercise_id: number;
    exercise_name: string;
    axial_load: string | null;
    /** pending_review: valor propuesto aún sin revisar (se usa, marcado). */
    axial_load_review?: string | null;
    score: number;
    /** false: el ejercicio no tiene carga axial; suma 0 y no cuenta como «baja». */
    verifiable: boolean;
}

export interface AxialScoreResponse {
    total_score: number;
    exercises_count: number;
    exceeds_threshold: boolean;
    threshold: number;
    exercises_breakdown: AxialScoreItemOut[];
    /** Ejercicios sin carga axial: no entran en total_score. */
    unverifiable_count: number;
}

// ---------------------------------------------------------------------------
// Injury safety check
// ---------------------------------------------------------------------------

/** H4: «no verificable» nunca equivale a seguro. */
export type ExerciseSafetyStatus = "safe" | "unsafe" | "not_verifiable";
export type ExerciseUnverifiableReason = "no_joint_actions";

export interface ExerciseSafetyResponse {
    is_safe: boolean;
    blocking: boolean;
    reason?: string | null;
    severity?: "warning" | "danger" | string | null;
    conflicting_joint_id?: number | null;
    conflicting_joint_name?: string | null;
    conflicting_movement_id?: number | null;
    conflicting_movement_name?: string | null;
    suggested_alternatives: number[];
    pain_level?: number | null;
    status: ExerciseSafetyStatus;
    unverifiable_reason?: ExerciseUnverifiableReason | null;
}

export interface ExerciseSafetyCheckRequest {
    client_id: number;
    exercise_id: number;
}

// ---------------------------------------------------------------------------
// Batch safety check
// ---------------------------------------------------------------------------

export interface ExerciseSafetyBatchRequest {
    client_id: number;
    exercise_ids: number[];
}

export interface ExerciseSafetyBatchResponse {
    results: Record<number, ExerciseSafetyResponse>;
}

// ---------------------------------------------------------------------------
// Session safety summary
// ---------------------------------------------------------------------------

export interface SessionSafetySummaryOut {
    total_checks: number;
    blocking_count: number;
    warning_count: number;
    safe_count: number;
    /** Ejercicios que no se pudieron comprobar (sin acciones articulares). */
    unverifiable_count: number;
    details: ExerciseSafetyResponse[];
}

// ---------------------------------------------------------------------------
// Safe alternatives
// ---------------------------------------------------------------------------

import type { Exercise } from "../hooks/exercises";

/** Why GET /exercises/{id}/safe-alternatives returned an empty list. */
export type AlternativesEmptyReason =
    | "none"
    | "no_pool"
    | "joint_catalog"
    | "injury_filter"
    | "score_threshold"
    | "manual_empty";

export interface SafeAlternativesResponse {
    original_exercise_id: number;
    client_id: number;
    is_original_safe: boolean;
    alternatives: Exercise[];
    safety_results: ExerciseSafetyResponse[];
    match_scores: Record<number, number>;
    /** True when the API found no safe alternative (threshold, injury filter, or empty catalog). */
    no_alternatives_found: boolean;
    /** Primary cause when alternatives is empty; "none" when alternatives exist. */
    empty_reason: AlternativesEmptyReason;
}
