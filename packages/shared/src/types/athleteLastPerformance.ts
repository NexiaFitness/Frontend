/** GET /athlete/exercises/{id}/last-performance (CTX-1 extends F3c-BE-04). */

export type AthleteOneRmKind = "recorded" | "estimated";

export interface AthleteLastPerformance {
    exercise_id: number;
    client_id: number;
    applies_one_rm: boolean;
    one_rm_kg: number | null;
    one_rm_kind: AthleteOneRmKind | null;
    performed_at: string | null;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    source: string | null;
}
