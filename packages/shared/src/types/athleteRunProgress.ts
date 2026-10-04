/**
 * athleteRunProgress.ts — BE-1 progress + BE-2 not performed (portal atleta FE-3).
 *
 * Propósito: tipos RTK GET progress / registration-meta (FE-3, FE-9).
 * Contexto: athleteApi + hooks atleta.
 * Notas de mantenimiento: alinear con OpenAPI athlete_run_context.
 *
 * @author Frontend Team
 * @since v8.3.0
 */

import type { TimedBlockResultDetail } from "./timedBlockResultDetail";

export type AthleteRunRecordStatus = "registered" | "not_performed";

export type AthleteRunBlockStatus = "pending" | "registered" | "not_performed";

export interface AthleteRunProgressStep {
    step_key: string;
    status: AthleteRunRecordStatus;
    kind: "execution" | "timed";
    session_block_id?: number | null;
    block_exercise_id?: number | null;
    exercise_id?: number | null;
    group_id?: string | null;
    weight_kg?: number | null;
    reps?: number | null;
    rpe?: number | null;
    duration_seconds?: number | null;
    rounds_completed?: number | null;
    partial_reps?: number | null;
    completed_as_planned?: boolean | null;
    failure_reason?: string | null;
    timed_mode?: string | null;
    total_seconds?: number | null;
    emom_completed_count?: number | null;
    emom_failed_count?: number | null;
    detail?: TimedBlockResultDetail | null;
}

export interface AthleteRunProgressBlock {
    session_block_id: number;
    set_type?: string | null;
    status: AthleteRunBlockStatus;
    expected_step_keys: string[];
    registered_step_keys: string[];
    not_performed_step_keys: string[];
    pending_step_keys: string[];
}

export interface AthleteExerciseNoteProgressRow {
    block_exercise_id: number;
    exercise_id: number;
    session_block_id: number;
    athlete_note: string;
}

export interface AthleteRunProgress {
    training_session_id: number;
    steps: AthleteRunProgressStep[];
    blocks: AthleteRunProgressBlock[];
    exercise_notes?: AthleteExerciseNoteProgressRow[];
    pending_count: number;
    first_pending_step_key?: string | null;
    registration_editable?: boolean;
    registration_edit_days?: number;
}

export interface AthleteRunSessionRegistrationMetaRow {
    training_session_id: number;
    session_status: string;
    pending_count: number;
    expected_count: number;
    registered_count: number;
    registration_editable: boolean;
    registration_edit_days: number;
}

export interface AthleteRunSessionRegistrationMetaPage {
    items: AthleteRunSessionRegistrationMetaRow[];
}

export interface GetAthleteSessionsRegistrationMetaArg {
    dateFrom: string;
    dateTo: string;
}

export interface AthleteRunNotPerformedCreate {
    training_session_id: number;
    scope: "step" | "block";
    step_key?: string | null;
    session_block_id?: number | null;
    group_id?: string | null;
    exercise_id?: number | null;
    block_exercise_id?: number | null;
    group_kind?: string | null;
    round_index?: number | null;
    set_index?: number | null;
    slot_label?: string | null;
    set_label?: string | null;
    timed_mode?: string | null;
    source?: string;
}

export interface AthleteRunNotPerformedOut {
    training_session_id: number;
    scope: "step" | "block";
    step_keys: string[];
    status: "not_performed";
}
