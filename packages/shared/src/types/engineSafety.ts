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
    score: number;
}

export interface AxialScoreResponse {
    total_score: number;
    exercises_count: number;
    exceeds_threshold: boolean;
    threshold: number;
    exercises_breakdown: AxialScoreItemOut[];
}

// ---------------------------------------------------------------------------
// Injury safety check
// ---------------------------------------------------------------------------

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
    details: ExerciseSafetyResponse[];
}

// ---------------------------------------------------------------------------
// Safe alternatives
// ---------------------------------------------------------------------------

import type { Exercise } from "../hooks/exercises";

export interface SafeAlternativesResponse {
    original_exercise_id: number;
    client_id: number;
    is_original_safe: boolean;
    alternatives: Exercise[];
    safety_results: ExerciseSafetyResponse[];
    match_scores: Record<number, number>;
    /** True when the API found no safe alternative (threshold, injury filter, or empty catalog). */
    no_alternatives_found: boolean;
}
