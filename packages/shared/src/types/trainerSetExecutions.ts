/**
 * Trainer granular set execution read models (F8).
 */

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
