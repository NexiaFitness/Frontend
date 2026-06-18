/**
 * athleteSessionFeedbackNavigation.ts — Rutas y query focus del formulario V07.
 * Contexto: deep link desde AthleteInjuryConsultSheet → scroll a dolor/molestias.
 * @author Frontend Team
 * @since F3b
 */

/** Query param y rutas del formulario V07 (focus desde consulta lesión). */

export const ATHLETE_FEEDBACK_FOCUS_PAIN = "pain";
/** @deprecated Usar ATHLETE_FEEDBACK_FOCUS_PAIN — se acepta en URL por compatibilidad. */
export const ATHLETE_FEEDBACK_FOCUS_NOTES = "notes";

export function athleteSessionFeedbackPath(
    sessionId: number,
    options?: { focusPain?: boolean }
): string {
    const base = `/dashboard/sessions/${sessionId}/feedback`;
    if (options?.focusPain) {
        return `${base}?focus=${ATHLETE_FEEDBACK_FOCUS_PAIN}`;
    }
    return base;
}

/** Despliega «Más detalles» (consulta lesión u origen legacy). */
export function feedbackFormExpandsDetails(searchParams: URLSearchParams): boolean {
    const focus = searchParams.get("focus");
    return focus === ATHLETE_FEEDBACK_FOCUS_PAIN || focus === ATHLETE_FEEDBACK_FOCUS_NOTES;
}

/** Campo al que hacer scroll — dolor/molestias desde consulta lesión. */
export function feedbackFormFocusesPain(searchParams: URLSearchParams): boolean {
    const focus = searchParams.get("focus");
    return focus === ATHLETE_FEEDBACK_FOCUS_PAIN || focus === ATHLETE_FEEDBACK_FOCUS_NOTES;
}
