/**
 * sessionValidationPresentation.ts — Copy coach-facing para validación de sesión.
 * Contrato: doc 23 · no mostrar detail crudo del backend al entrenador.
 */

export type BlockResolutionReason =
    | "missing_session_date"
    | "missing_plan"
    | "no_block_for_date"
    | string;

export interface NotApplicableCopy {
    title: string;
    body: string;
}

const NOT_APPLICABLE_BY_REASON: Record<string, NotApplicableCopy> = {
    missing_session_date: {
        title: "Sin fecha de sesión",
        body: "Asigna una fecha a la sesión para compararla con la estructura del bloque.",
    },
    missing_plan: {
        title: "Sesión sin plan vinculado",
        body: "La alineación con el bloque de fase aplica a sesiones dentro de un plan activo.",
    },
    no_block_for_date: {
        title: "Fuera de un bloque de fase",
        body: "Esta fecha no cae dentro de ningún bloque activo del plan. Puedes continuar; no hay estructura semanal que comparar.",
    },
};

export function getNotApplicableCopy(
    reason: BlockResolutionReason | null | undefined
): NotApplicableCopy {
    if (reason && NOT_APPLICABLE_BY_REASON[reason]) {
        return NOT_APPLICABLE_BY_REASON[reason];
    }
    return {
        title: "Alineación no disponible",
        body: "No hay datos suficientes para comparar esta sesión con un bloque de fase.",
    };
}
