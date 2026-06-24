/**
 * clientTestingPresentation — Copy Spec 01 evaluaciones físicas v2.
 */

import type { TestCategory } from "@nexia/shared/types/testing";

/** Categorías con fuerza al final (E-01). */
export const TEST_CATEGORY_ORDER: TestCategory[] = [
    "mobility",
    "power",
    "speed",
    "aerobic",
    "anaerobic",
    "strength",
];

export const TESTING_TAB_TITLE = "Evaluaciones físicas";

export const TESTING_TAB_SUBTITLE =
    "Protocolos planificados: movilidad, potencia, velocidad y resistencia.";

export const TESTING_CTA_REGISTER = "Registrar evaluación";

export const TESTING_STRENGTH_PILL_TITLE =
    "Para marcas de gym y PRs, usa Rendimiento gym.";

export const TESTING_EMPTY_TITLE = (categoryLabel: string) =>
    `Sin evaluaciones en ${categoryLabel.toLowerCase()}`;

export const TESTING_EMPTY_DESCRIPTION =
    "Registra una evaluación para ver progresión y perfil.";

export const TESTING_UPCOMING_TITLE = "Evaluaciones pendientes de retest";

export const TESTING_UPCOMING_CTA = "Registrar retest";

export const TESTING_BILATERAL_TITLE = "Comparación bilateral (movilidad)";

export const TESTING_BILATERAL_ASYMMETRY_BADGE = "Asimetría";

export const TESTING_ASYMMETRY_THRESHOLD_PCT = 15;

export const TESTING_AI_INSIGHT_CTA = "Generar insight";

export const TESTING_AI_INSIGHT_REGENERATE = "Regenerar insight";

export const TESTING_AI_INSIGHT_STALE_PROMPT =
    "Hay evaluaciones nuevas desde el último insight.";

export const TESTING_AI_INSIGHT_UPDATE = "Actualizar insight";

export const TESTING_AI_INSIGHT_LOADING = "Preparando insight…";

export const TESTING_AI_INSIGHT_GENERATING = "Actualizando insight…";

export const TESTING_AI_INSIGHT_ERROR = "No se pudo generar el insight.";

export const TESTING_AI_INSIGHT_TITLE = "Insight del entrenador";

export const TESTING_AI_SOURCE_LABEL: Record<
    "llm" | "cache" | "deterministic",
    string
> = {
    llm: "Generado con IA",
    cache: "Desde caché",
    deterministic: "Análisis automático",
};

export function formatTestingDate(value: string): string {
    return new Date(value).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function asymmetryPercent(
    left: number | null | undefined,
    right: number | null | undefined,
): number | null {
    if (left == null || right == null) return null;
    const max = Math.max(Math.abs(left), Math.abs(right));
    if (max === 0) return 0;
    return (Math.abs(left - right) / max) * 100;
}
