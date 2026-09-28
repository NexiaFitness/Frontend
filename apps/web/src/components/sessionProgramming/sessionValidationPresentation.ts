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

/** Resumen legible para patrones de movimiento en review. */
export function buildPatternReviewSummary(input: {
    status: string;
    expected: string[];
    missing: string[];
    extra: string[];
}): string | null {
    if (input.expected.length === 0) {
        return "No hay patrones definidos para este día en la estructura semanal.";
    }
    if (input.status === "aligned") {
        return "Los patrones de la sesión coinciden con la estructura semanal de hoy.";
    }
    const parts: string[] = [];
    if (input.missing.length > 0) {
        parts.push(`Faltan: ${input.missing.join(", ")}.`);
    }
    if (input.extra.length > 0) {
        parts.push(`Hay patrones no previstos hoy: ${input.extra.join(", ")}.`);
    }
    return parts.join(" ") || null;
}

export const VOLUME_UNCOVERED_REVIEW_COPY = {
    heading: "Grupos del plan de hoy sin series en esta sesión",
    body:
        "Según los patrones de movimiento programados para este día en la estructura semanal, " +
        "estos grupos musculares no reciben series en la sesión actual. " +
        "Puede ser normal si repartes el volumen en otra sesión de la semana.",
} as const;
