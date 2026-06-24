/**
 * Athlete run load suggestion v2 — types (SUGERENCIA_CARGA.md §5).
 */

export type AthleteRunSuggestionInputMode =
    | "weight_reps"
    | "reps_only"
    | "duration"
    | "rounds_only"
    | "timed_score";

export type AthleteRunSuggestionAction = "increase" | "maintain" | "decrease" | "none";

export type AthleteRunSuggestionConfidence = "none" | "low" | "medium" | "high";

export type AthleteRunSuggestionMetric = "weight_kg" | "reps" | "rounds" | "total_seconds";

export interface AthleteRunLookupKey {
    exercise_id: number;
    step_key: string;
    set_index?: number | null;
    round_index?: number | null;
    slot_label?: string | null;
    group_kind?: string | null;
}

export interface AthleteRunSuggestionReference {
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    rounds_completed: number | null;
    total_seconds: number | null;
    performed_at: string;
    source: string;
    basis_label?: string | null;
}

export interface AthleteRunSuggestionContext {
    lookup_key: AthleteRunLookupKey;
    input_mode: AthleteRunSuggestionInputMode;

    prescribed_reps: number | null;
    prescribed_reps_max: number | null;
    prescribed_rpe: number | null;
    prescribed_rir: number | null;

    reference: AthleteRunSuggestionReference | null;
    exposure_count: number;
    load_step_kg?: number;
    is_novice_profile?: boolean;

    /** Dropset escalón: MAIN | DROP 1… */
    slot_label?: string | null;
    group_kind?: string | null;
}

export interface AthleteRunSuggestion {
    metric: AthleteRunSuggestionMetric;
    suggested_value: number;
    reference_value: number;
    delta: number;
    action: AthleteRunSuggestionAction;
    confidence: AthleteRunSuggestionConfidence;
    exposure_count: number;
    explanation: string;
    basis_label: string;
    show_card: boolean;
}

export function shouldShowRunSuggestion(
    suggestion: AthleteRunSuggestion | null | undefined
): suggestion is AthleteRunSuggestion {
    return suggestion != null && suggestion.show_card === true;
}
