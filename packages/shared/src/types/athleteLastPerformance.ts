/**
 * Athlete last performance (F3c-BE-04).
 */

export interface AthleteLastPerformance {
    exercise_id: number;
    client_id: number;
    performed_at: string | null;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    source: "session_blocks" | "legacy" | "progress_tracking" | null;
}

export function hasAthleteLastPerformance(
    data: AthleteLastPerformance | undefined
): data is AthleteLastPerformance & { weight_kg: number } {
    return data != null && data.weight_kg != null && data.weight_kg > 0;
}
