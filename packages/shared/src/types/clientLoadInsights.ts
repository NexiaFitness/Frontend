/**
 * Client load insights for trainer portal (F3c-TR-01, F3d-BE-05).
 */

export type ClientLoadSignalType =
    | "plateau"
    | "rpe_too_easy"
    | "rpe_too_hard"
    | "intra_session_fatigue"
    | "e1rm_progression";

export type ClientLoadSignalSeverity = "info" | "warning";

export type ClientLoadDataSource = "set_executions" | "legacy" | "mixed";

export interface ClientLoadSignal {
    signal_type: ClientLoadSignalType;
    exercise_id: number;
    exercise_name: string;
    severity: ClientLoadSignalSeverity;
    message: string;
    mismatch_count?: number | null;
    plateau_sessions?: number | null;
    prescribed_rpe?: number | null;
    actual_rpe_avg?: number | null;
}

export interface ClientRecentExerciseLoad {
    exercise_id: number;
    exercise_name: string;
    weight_kg: number;
    reps: number | null;
    rpe: number | null;
    performed_at: string;
    source: string;
}

export interface ClientLoadInsights {
    client_id: number;
    completed_sessions_count: number;
    has_sufficient_data: boolean;
    signals: ClientLoadSignal[];
    recent_loads: ClientRecentExerciseLoad[];
    data_source?: ClientLoadDataSource;
    executions_count_30d?: number;
}
