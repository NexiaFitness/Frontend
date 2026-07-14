/**
 * Athlete run context — reference, PR, suggestion (F3e / SPEC §9.1).
 */

import type { AthleteRunSuggestion } from "./athleteRunSuggestion";

export interface AthleteRunReferencePoint {
    source: string;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    rounds_completed: number | null;
    total_seconds: number | null;
    performed_at: string | null;
    session_date_label: string | null;
}

export interface AthleteRunPersonalBest {
    metric: string;
    weight_kg: number | null;
    reps: number | null;
    rounds_completed?: number | null;
    total_seconds?: number | null;
    performed_at: string | null;
    session_date_label: string | null;
}

export interface AthleteRunReference {
    exercise_id: number;
    step_key: string;
    reference: AthleteRunReferencePoint | null;
    personal_best: AthleteRunPersonalBest | null;
    suggestion: AthleteRunSuggestion | null;
}

export interface AthleteRunReferenceQuery {
    training_session_id: number;
    step_key: string;
    exercise_id: number;
    set_index?: number | null;
    round_index?: number | null;
    slot_label?: string | null;
    group_kind?: string | null;
    group_id?: string | null;
    prescribed_reps?: number | null;
    prescribed_reps_max?: number | null;
    prescribed_rpe?: number | null;
    prescribed_rir?: number | null;
    input_mode?: string;
}

/** SIG-06 — snapshot opcional de lo que el atleta vio al confirmar la serie. */
export interface AthleteRunExecutionSuggestionSnapshot {
    suggestion_shown: boolean;
    suggested_weight_kg: number | null;
    reference_weight_kg: number | null;
    suggestion_action: "increase" | "maintain" | "decrease" | null;
    load_step_kg: number | null;
    confidence?: "low" | "medium" | "high" | null;
}

export interface AthleteRunExecutionCreate {
    training_session_id: number;
    step_key: string;
    exercise_id: number;
    block_exercise_id?: number | null;
    session_exercise_id?: number | null;
    group_kind?: string | null;
    round_index?: number | null;
    set_index?: number | null;
    slot_label?: string | null;
    set_label?: string | null;
    input_mode?: string;
    weight_kg?: number | null;
    reps?: number | null;
    rpe?: number | null;
    duration_seconds?: number | null;
    rounds_completed?: number | null;
    partial_reps?: number | null;
    completed_as_planned?: boolean | null;
    failure_reason?: string | null;
    split_seconds?: number | null;
    source?: string;
    suggestion_snapshot?: AthleteRunExecutionSuggestionSnapshot | null;
}

export interface AthleteRunExecutionOut {
    id: number;
    training_session_id: number;
    step_key: string;
    exercise_id: number;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
}

export interface AthleteRunTimedResultCreate {
    training_session_id: number;
    group_id: string;
    timed_mode: string;
    step_key: string;
    session_block_id?: number | null;
    total_seconds?: number | null;
    rounds_completed?: number | null;
    emom_completed_count?: number | null;
    emom_failed_count?: number | null;
    payload_json?: string | null;
}

export interface AthleteRunTimedResultOut {
    id: number;
    training_session_id: number;
    group_id: string;
    timed_mode: string;
    total_seconds: number | null;
    rounds_completed: number | null;
    emom_completed_count: number | null;
    emom_failed_count: number | null;
}

export function hasAthleteRunReferencePoint(
    point: AthleteRunReferencePoint | null | undefined
): point is AthleteRunReferencePoint & { weight_kg: number } {
    return point != null && point.weight_kg != null && point.weight_kg > 0;
}
