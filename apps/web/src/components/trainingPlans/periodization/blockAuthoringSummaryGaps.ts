/**
 * blockAuthoringSummaryGaps.ts — Qué falta en el Resumen (veredicto incompleto).
 *
 * Contexto: decisión Nelson — Alert solo si falta algo (días, patrones,
 * structure_coverage). Si completo, el botón primary es el veredicto.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import { allActiveDaysHavePatterns } from "./blockAuthoringPatternsUtils";

export interface BlockAuthoringSummaryGapInput {
    activeDays: readonly number[];
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    /** Hueco de cobertura / fechas (structure_coverage o dateStructureGap). */
    structureCoverageMessage?: string | null;
}

/** Lista de carencias legibles para el Alert del Resumen. */
export function buildBlockAuthoringSummaryGaps(
    input: BlockAuthoringSummaryGapInput,
): string[] {
    const gaps: string[] = [];
    if (input.activeDays.length === 0) {
        gaps.push("días de entrenamiento");
    } else if (
        !allActiveDaysHavePatterns(input.weeklyStructure, input.activeDays)
    ) {
        gaps.push("patrones en todos los días activos");
    }
    const coverage = input.structureCoverageMessage?.trim();
    if (coverage) {
        gaps.push(coverage);
    }
    return gaps;
}
