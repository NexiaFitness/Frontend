/**
 * exerciseContent.ts — Texto de lectura de un ejercicio: descripción, pasos y consejos.
 *
 * Contexto: copiado de los esquemas del backend `app/schemas/exercise_content.py`.
 * El entrenador y el admin lo leen en GET /exercises/{exercise_id}/content (H5); el
 * atleta, por sesión, en GET /athlete/sessions/{id}/exercise-content (H8-A, SPEC_H8 §7).
 * Notas de mantenimiento: sin atribución por ejercicio desde H8-A (decisión de Nelson,
 * 2026-11-06): la atribución a RepDB vive solo en /creditos.
 *
 * @author Frontend Team
 * @since v5.0.0
 */

export interface ExerciseContentOut {
    locale: "es" | "en" | null;
    in_english: boolean;
    description: string | null;
    steps: string[];
    tips: string[];
}

export interface AthleteExerciseContentItemOut {
    exercise_id: number;
    content: ExerciseContentOut;
}

/** GET /athlete/sessions/{training_session_id}/exercise-content. */
export interface AthleteSessionExerciseContentOut {
    training_session_id: number;
    items: AthleteExerciseContentItemOut[];
}
