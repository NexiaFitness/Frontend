/**
 * guidedRunStepActions.ts — CTA del paso guiado (última serie y descanso).
 *
 * Propósito: el último paso, una vez persistido, ofrece solo «Finalizar sesión».
 * Un paso intermedio puede seguir mostrando el guardado durante el descanso.
 * Contexto: useAthleteSessionRun ya supera el límite de líneas del contrato.
 *
 * @author Frontend Team
 * @since 2026-11-10
 */

import {
    shouldAllowRestReconfirmSticky,
    type AthleteRunRestPhase,
} from "@nexia/shared/utils/athlete/athleteRunRestPhase";

export function guidedRunConfirmLabel(
    isTimedBlock: boolean,
    isTimedCompletion: boolean,
    isGroupRound: boolean,
    isDropsetRound: boolean
): string {
    if (isTimedBlock) {
        return isTimedCompletion ? "Bloque completado" : "Ronda completada";
    }
    if (isGroupRound) {
        return isDropsetRound ? "Dropset completado" : "Ronda completada";
    }
    return "Guardar";
}

export interface GuidedStepRestSlice {
    phase: AthleteRunRestPhase;
    hasRestTimer: boolean;
    remainingSeconds: number;
}

/** Guardar visible. En el último paso ya persistido el cierre es solo «Finalizar sesión». */
export function shouldShowGuidedStepActions(
    hasCurrentStep: boolean,
    isCurrentStepSaved: boolean,
    isLastStep: boolean,
    rest: GuidedStepRestSlice
): boolean {
    if (!hasCurrentStep) return false;
    if (!isCurrentStepSaved) return true;
    if (isLastStep) return false;
    return shouldAllowRestReconfirmSticky(
        rest.phase,
        rest.hasRestTimer,
        rest.remainingSeconds
    );
}
