/**
 * amrapPlannedReps.ts — Reps planificadas en bloques AMRAP.
 *
 * Legacy: se persistía planned_reps = "AMRAP" como marcador del tipo de serie.
 * El set_type ya identifica AMRAP; planned_reps debe guardar las reps por ejercicio/ronda.
 */

export const AMRAP_LEGACY_PLANNED_REPS_SENTINEL = "AMRAP";

export function isAmrapLegacyPlannedRepsSentinel(
    plannedReps: string | null | undefined
): boolean {
    return plannedReps?.trim().toUpperCase() === AMRAP_LEGACY_PLANNED_REPS_SENTINEL;
}

/** Vista read-only: no mostrar el marcador legacy como reps. */
export function displayAmrapPlannedReps(
    plannedReps: string | null | undefined
): string | null {
    if (!plannedReps || isAmrapLegacyPlannedRepsSentinel(plannedReps)) {
        return null;
    }
    return plannedReps;
}

/**
 * Constructor: sustituir marcador legacy por reps editables.
 * Mantiene null/undefined tal cual para permitir borrar el campo libremente;
 * el fallback solo aplica al marcador legacy "AMRAP".
 */
export function hydrateAmrapPlannedReps(
    plannedReps: string | null | undefined,
    fallback = "8"
): string | null {
    if (isAmrapLegacyPlannedRepsSentinel(plannedReps)) {
        return fallback;
    }
    return plannedReps ?? null;
}

/** Pie de card AMRAP (constructor y vista detalle). */
export function amrapFooterHint(timeCapMinutes: number | null | undefined): string {
    if (timeCapMinutes != null && timeCapMinutes > 0) {
        return `Completa el máximo de rondas posibles en ${timeCapMinutes} minutos.`;
    }
    return "Completa el máximo de rondas posibles.";
}
