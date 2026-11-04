/**
 * exerciseContent.ts — Lectura de exercise_content (H5).
 *
 * Copiado de ExerciseContentOut en GET /api/v1/exercises/{exercise_id}/content.
 * El atleta no consume este contrato (H8).
 */

export interface ExerciseContentAttribution {
    label: string;
    url: string;
}

export interface ExerciseContentOut {
    locale: "es" | "en" | null;
    in_english: boolean;
    description: string | null;
    steps: string[];
    tips: string[];
    attribution: ExerciseContentAttribution | null;
}
