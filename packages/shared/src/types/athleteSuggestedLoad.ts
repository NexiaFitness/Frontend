/**
 * Athlete suggested load (F3d-BE-04).
 */

export type AthleteSuggestedLoadConfidence = "none" | "low" | "medium" | "high";

export interface AthleteSuggestedLoadBasis {
    performed_at: string;
    weight_kg: number;
    reps: number | null;
    rpe: number | null;
}

export interface AthleteSuggestedLoad {
    exercise_id: number;
    client_id: number;
    suggested_weight_kg: number | null;
    confidence: AthleteSuggestedLoadConfidence;
    exposure_count: number;
    explanation: string;
    basis: AthleteSuggestedLoadBasis | null;
}

export function hasActionableSuggestedLoad(
    data: AthleteSuggestedLoad | undefined
): data is AthleteSuggestedLoad & { suggested_weight_kg: number } {
    return (
        data != null &&
        data.suggested_weight_kg != null &&
        data.suggested_weight_kg > 0 &&
        data.confidence !== "none"
    );
}

export function shouldShowSuggestedLoad(
    data: AthleteSuggestedLoad | undefined
): data is AthleteSuggestedLoad & { suggested_weight_kg: number } {
    return (
        hasActionableSuggestedLoad(data) &&
        (data.confidence === "medium" || data.confidence === "high")
    );
}
