/**
 * structureCoveragePresentation.ts — Copy y helpers cobertura estructura semanal.
 *
 * Diseño: DESIGN_PREMIUM.md §2 (presentation layer), §3 (warning), §4.4 (una acción).
 * Uso: badge + CTA en PeriodBlockCard — sin banner apilado.
 *
 * @author Frontend Team
 * @since v9.1.0
 * @updated 2026-10-02 — Parte 3: copy CTA card; sin banner hub / hint overview / copy atleta.
 */

import type { StructureCoverage } from "@nexia/shared/types/trainingAnalytics";

export const STRUCTURE_COVERAGE_COPY = {
    phaseBadge: "Estructura incompleta",
    completeStructureCta: "Completar estructura",
} as const;

export function structureCoverageIncomplete(
    coverage: StructureCoverage | null | undefined,
): boolean {
    return coverage != null && coverage.complete === false;
}

/** Primer ordinal a abrir en weekly-structure (semana faltante o día sin patrones). */
export function firstStructureCoverageWeekOrdinal(
    coverage: StructureCoverage | null | undefined,
): number | null {
    if (!coverage || coverage.complete) return null;
    const missing = coverage.missing_week_ordinals[0];
    if (missing != null) return missing;
    const dayGap = coverage.days_without_patterns[0];
    return dayGap?.week ?? null;
}

export function formatStructureCoverageDetail(
    coverage: StructureCoverage,
): string {
    const parts: string[] = [];
    if (coverage.missing_week_ordinals.length > 0) {
        parts.push(
            `Semanas sin configurar: ${coverage.missing_week_ordinals.join(", ")}`,
        );
    }
    if (coverage.days_without_patterns.length > 0) {
        const dayBits = coverage.days_without_patterns
            .slice(0, 5)
            .map((d) => `S${d.week} D${d.dow}`);
        const suffix =
            coverage.days_without_patterns.length > 5
                ? ` (+${coverage.days_without_patterns.length - 5} más)`
                : "";
        parts.push(`Días sin patrones: ${dayBits.join(", ")}${suffix}`);
    }
    return parts.join(" · ");
}
