/**
 * blockAuthoringStepGuard.ts — Normaliza blockStep en URL según estado real del wizard D-PAP.
 *
 * Evita QA-NAV-1: recargar en summary/patterns con borrador no hidratado o sin días/patrones.
 */

import type { BlockAuthorMode, BlockAuthorStep } from "./blockAuthoringModel";

export interface BlockAuthorWizardGateState {
    structureReady: boolean;
    activeDayCount: number;
    patternsComplete: boolean;
}

/**
 * Devuelve el paso más avanzado alcanzable; si la URL apunta más allá, retrocede al primero inválido.
 */
export function resolveBlockAuthorStepForWizardState(
    urlStep: BlockAuthorStep,
    mode: BlockAuthorMode,
    state: BlockAuthorWizardGateState,
): BlockAuthorStep {
    if (mode === "edit" && !state.structureReady) {
        if (urlStep === "patterns" || urlStep === "summary") {
            return "qualities";
        }
    }

    if (urlStep === "patterns" && state.activeDayCount === 0) {
        return "days";
    }

    if (urlStep === "summary") {
        if (state.activeDayCount === 0) {
            return "days";
        }
        if (!state.patternsComplete) {
            return "patterns";
        }
    }

    return urlStep;
}
