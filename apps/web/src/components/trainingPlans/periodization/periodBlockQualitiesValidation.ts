/**
 * periodBlockQualitiesValidation.ts — Validación del paso «Cualidades físicas».
 *
 * Lógica pura reutilizable (constructor, edición de bloque, tests).
 * Los mensajes se muestran vía toast en el componente de paso.
 */

/** Máximo de cualidades distintas por bloque de periodización. */
export const MAX_PERIOD_BLOCK_QUALITIES = 4;

export type QualitiesStepValidationSeverity = "error" | "warning";

export interface QualitiesStepValidationInput {
    qualitiesCount: number;
    qualitiesSum: number;
    overlapDetected?: boolean;
    outsidePlanBounds?: boolean;
}

export interface QualitiesStepValidationResult {
    ok: boolean;
    message?: string;
    severity?: QualitiesStepValidationSeverity;
}

export function validateCanAddQuality(
    currentCount: number,
): QualitiesStepValidationResult {
    if (currentCount >= MAX_PERIOD_BLOCK_QUALITIES) {
        return {
            ok: false,
            severity: "warning",
            message: `Solo puedes asignar hasta ${MAX_PERIOD_BLOCK_QUALITIES} cualidades físicas por bloque.`,
        };
    }
    return { ok: true };
}

export function validateQualitiesStepAdvance(
    input: QualitiesStepValidationInput,
): QualitiesStepValidationResult {
    const { qualitiesCount, qualitiesSum, overlapDetected, outsidePlanBounds } =
        input;

    if (qualitiesCount > MAX_PERIOD_BLOCK_QUALITIES) {
        return {
            ok: false,
            severity: "error",
            message: `El bloque no puede tener más de ${MAX_PERIOD_BLOCK_QUALITIES} cualidades. Tienes ${qualitiesCount}; quita alguna para continuar.`,
        };
    }

    if (qualitiesCount === 0) {
        return {
            ok: false,
            severity: "error",
            message: "Añade al menos una cualidad física para continuar.",
        };
    }

    if (outsidePlanBounds) {
        return {
            ok: false,
            severity: "warning",
            message:
                "El rango excede la vigencia del plan. Ajusta las fechas en el calendario.",
        };
    }

    if (overlapDetected) {
        return {
            ok: false,
            severity: "warning",
            message:
                "El rango se solapa con otro bloque. Ajusta las fechas en el calendario.",
        };
    }

    if (qualitiesSum > 100) {
        return {
            ok: false,
            severity: "error",
            message: `La suma no puede superar el 100 %. Ahora tienes ${qualitiesSum} %.`,
        };
    }

    if (qualitiesSum < 100) {
        return {
            ok: false,
            severity: "error",
            message: `La suma debe ser exactamente 100 %. Ahora tienes ${qualitiesSum} %.`,
        };
    }

    return { ok: true };
}

export function qualitiesSumBadgeClass(sum: number): string {
    if (sum === 100) return "bg-success/20 text-success";
    return "bg-destructive/20 text-destructive";
}
