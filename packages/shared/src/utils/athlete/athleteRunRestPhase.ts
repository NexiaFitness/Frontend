/**
 * athleteRunRestPhase.ts — Transiciones de fase del descanso en run atleta (D-REST-02).
 *
 * Propósito: reglas puras de cuándo mostrar chip, overlay y logger; sin DOM ni timers.
 * Contexto: useAthleteRunRestFlow (web); persistencia Fase 2 reutilizará fases.
 * Notas de mantenimiento: «Empezar descanso» sigue siendo entrada manual (D-REST-01).
 *
 * @author Frontend Team
 * @since 2026-10-08
 */

export type AthleteRunRestPhase = "doing" | "logging_rest" | "rest_overlay";

export interface RestPhaseAfterConfirmInput {
    hasRestTimer: boolean;
    /** Segundos restantes calculados desde deadline (wall clock). */
    remainingSeconds: number;
    /** True si el countdown ya estaba activo (deadline + fase logging_rest/overlay). */
    restCountdownWasActive: boolean;
}

/**
 * Tras guardar serie con éxito: overlay si el descanso ya corría; si no, cerrar o avanzar.
 */
export function restPhaseAfterConfirmSaved(
    input: RestPhaseAfterConfirmInput
): "rest_overlay" | "advance" {
    const { hasRestTimer, remainingSeconds, restCountdownWasActive } = input;
    if (hasRestTimer && restCountdownWasActive && remainingSeconds > 0) {
        return "rest_overlay";
    }
    return "advance";
}

export function shouldShowRestChip(
    phase: AthleteRunRestPhase,
    hasRestTimer: boolean,
    remainingSeconds: number
): boolean {
    return (
        phase === "logging_rest" &&
        hasRestTimer &&
        remainingSeconds > 0
    );
}

export function shouldShowRestOverlay(
    phase: AthleteRunRestPhase,
    remainingSeconds: number
): boolean {
    return phase === "rest_overlay" && remainingSeconds > 0;
}

export function shouldShowRunLogger(
    phase: AthleteRunRestPhase,
    requireStartBeforeLog: boolean
): boolean {
    if (phase === "rest_overlay") return false;
    if (phase === "logging_rest") return true;
    return !requireStartBeforeLog;
}

/** Sticky de confirmación visible durante descanso aunque el paso ya esté guardado (B2 / N1). */
export function shouldAllowRestReconfirmSticky(
    phase: AthleteRunRestPhase,
    hasRestTimer: boolean,
    remainingSeconds: number
): boolean {
    if (!hasRestTimer || remainingSeconds <= 0) return false;
    return phase === "logging_rest" || phase === "rest_overlay";
}
