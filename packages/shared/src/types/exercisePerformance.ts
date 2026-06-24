/**
 * Spec 02 — exercise performance (PR) types.
 */

export type PerformanceSource =
    | "set_execution_auto"
    | "formal_test"
    | "manual_trainer";

export type PerformanceMetric = "best_weight_kg" | "best_e1rm_kg";

export interface ExercisePerformanceRecord {
    id: number;
    client_id: number;
    exercise_id: number;
    metric: PerformanceMetric;
    value_kg: number;
    reps: number | null;
    e1rm_kg: number | null;
    source: PerformanceSource;
    set_execution_id: number | null;
    physical_test_result_id: number | null;
    training_session_id: number | null;
    achieved_at: string;
    notes: string | null;
}

export interface ExercisePerformanceRecordCreate {
    metric: PerformanceMetric;
    value_kg: number;
    reps?: number | null;
    achieved_at?: string | null;
    notes?: string | null;
}

export interface ListExercisePerformanceRecordsArg {
    clientId: number;
    exerciseId: number;
    metric?: PerformanceMetric;
    skip?: number;
    limit?: number;
}

export interface CreateExercisePerformanceRecordArg {
    clientId: number;
    exerciseId: number;
    body: ExercisePerformanceRecordCreate;
}
