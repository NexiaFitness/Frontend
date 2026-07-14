/**
 * Trainer granular set execution read models (F8).
 */

import type {
    ExercisePerformanceRecord,
    PerformanceSource,
} from "./exercisePerformance";

export type { ExercisePerformanceRecord, PerformanceSource } from "./exercisePerformance";
export type {
    ExercisePerformanceRecordCreate,
    PerformanceMetric,
} from "./exercisePerformance";

export interface ClientSetExecutionRow {
    id: number;
    training_session_id: number;
    session_date: string | null;
    session_name: string | null;
    exercise_id: number;
    exercise_name: string;
    step_key: string;
    set_index: number | null;
    round_index: number | null;
    slot_label: string | null;
    group_kind: string | null;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    prescribed_rpe: number | null;
    performed_at: string;
}

export interface ClientSetExecutionsPage {
    client_id: number;
    total: number;
    items: ClientSetExecutionRow[];
}

export interface SessionExecutedLoadRow {
    training_session_id: number;
    session_date: string | null;
    tonnage_kg: number;
    executions_count: number;
}

export interface ClientExecutedLoadSummary {
    client_id: number;
    tonnage_total_kg: number;
    sessions_count: number;
    rpe_adherence_pct: number | null;
    by_session: SessionExecutedLoadRow[];
}

export interface GetClientSetExecutionsArg {
    clientId: number;
    exerciseId?: number;
    trainingSessionId?: number;
    fromDate?: string;
    toDate?: string;
    skip?: number;
    limit?: number;
}

export interface GetClientExecutedLoadSummaryArg {
    clientId: number;
    fromDate: string;
    toDate: string;
}

export interface SessionExecutionExercise {
    step_key: string;
    exercise_id: number;
    exercise_name: string;
    group_kind: string | null;
    prescribed_rpe: number | null;
    executions: ClientSetExecutionRow[];
}

export interface SessionExecutionSummary {
    training_session_id: number;
    client_id: number;
    session_date: string | null;
    session_name: string | null;
    session_status: string;
    tonnage_kg: number;
    executions_count: number;
    rpe_adherence_pct: number | null;
    has_executions: boolean;
    exercises: SessionExecutionExercise[];
}

export interface ClientTimedBlockResultRow {
    id: number;
    training_session_id: number;
    session_date: string | null;
    session_name: string | null;
    group_id: string | null;
    timed_mode: string;
    total_seconds: number | null;
    rounds_completed: number | null;
    emom_completed_count: number | null;
    emom_failed_count: number | null;
    partial_total: number | null;
}

export interface ClientTimedBlockResultsPage {
    client_id: number;
    total: number;
    items: ClientTimedBlockResultRow[];
}

export interface GetClientTimedBlockResultsArg {
    clientId: number;
    fromDate?: string;
    toDate?: string;
    skip?: number;
    limit?: number;
}

export interface E1rmTrendWeek {
    week_start: string;
    peak_estimated_1rm_kg: number;
}

export interface ClientExerciseLoadProfile {
    client_id: number;
    exercise_id: number;
    exercise_name: string;
    weeks: number;
    e1rm_formula_note: string;
    current_best_weight_kg: number | null;
    current_best_weight_reps: number | null;
    current_best_weight_at: string | null;
    current_best_weight_source: PerformanceSource | null;
    current_best_e1rm_kg: number | null;
    current_best_e1rm_at: string | null;
    current_best_e1rm_source: PerformanceSource | null;
    pr_history: ExercisePerformanceRecord[];
    latest_estimated_1rm_kg: number | null;
    latest_estimated_session_id: number | null;
    latest_estimated_session_date: string | null;
    estimated_trend_weeks: E1rmTrendWeek[];
}

export interface GetClientExerciseLoadProfileArg {
    clientId: number;
    exerciseId: number;
    weeks?: number;
}
