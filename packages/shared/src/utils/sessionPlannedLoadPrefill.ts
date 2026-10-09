/**
 * sessionPlannedLoadPrefill.ts — Regla D-BLQ-3 del volumen/intensidad planificados.
 *
 * Contexto: el volumen y la intensidad de una sesión se fijan al crearla (foto fija)
 * y se editan a mano. Al editar, si el entrenador cambia la fecha y no ha tocado los
 * sliders, se vuelven a rellenar con el contexto del nuevo día. Sin «recalcular».
 * Ver docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/02_DECISIONES_PRODUCTO.md.
 *
 * Notas de mantenimiento: función pura; extraída de EditSession.tsx (Hito 2).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

/** True cuando hay que volver a rellenar los sliders con el contexto del día. */
export function shouldReapplyPlannedLoadPrefill(
    slidersTouched: boolean,
    originalSessionDate: string | null,
    currentSessionDate: string,
): boolean {
    if (slidersTouched || originalSessionDate == null) return false;
    return currentSessionDate !== originalSessionDate;
}
