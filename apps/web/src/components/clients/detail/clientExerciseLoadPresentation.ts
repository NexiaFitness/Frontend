/**
 * clientExerciseLoadPresentation — Copy y tokens visuales PR automático (Spec 02 v2).
 */

import type {
    PerformanceMetric,
    PerformanceSource,
} from "@nexia/shared/types/exercisePerformance";

export function performanceSourceLabel(
    source: PerformanceSource | null | undefined,
): string {
    switch (source) {
        case "set_execution_auto":
            return "Sesión";
        case "formal_test":
            return "Evaluación formal";
        case "manual_trainer":
            return "Manual";
        default:
            return "—";
    }
}

export function performanceMetricLabel(metric: PerformanceMetric): string {
    return metric === "best_weight_kg" ? "Peso máximo" : "e1RM";
}

export function prCardClassName(hasValue: boolean): string {
    if (hasValue) {
        return "rounded-lg border border-primary/35 bg-primary/5 p-4 space-y-3";
    }
    return "rounded-lg border border-dashed border-border bg-surface p-4 space-y-3";
}

export const EXERCISE_LOAD_PANEL_SUBTITLE =
    "Réords personnels (PR) desde series en sesión, evaluaciones formales o registro manual.";

export const EXERCISE_LOAD_ESTIMATED_BADGE = "Epley · Sesión";

export const EXERCISE_LOAD_NO_ESTIMATE =
    "Sin series con peso en sesión para estimar 1RM en este periodo.";

export const PR_EMPTY =
    "Sin marcas registradas aún. Se crearán automáticamente al registrar series o evaluaciones.";

export const PR_MANUAL_CTA = "Registrar marca manual";

export const PR_HISTORY_TITLE = "Historial de marcas";

export const PR_HISTORY_EMPTY = "Aún no hay marcas en el historial.";

export const PR_WEIGHT_EMPTY = "Sin PR de peso en este periodo.";

export const PR_E1RM_EMPTY = "Sin PR de e1RM en este periodo.";

export const PR_FORMAL_TEST_LINK = "Ver evaluación formal";

export const PR_SESSION_LINK = "Ver sesión de referencia";
