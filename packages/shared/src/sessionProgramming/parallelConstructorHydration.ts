/**
 * parallelConstructorHydration.ts — Agrupa líneas API en slots para hidratar el constructor
 * (superset, giant_set, for_time). Usa inferRoundSlotLayout; no agrupa por exercise_id.
 */

import { getEffectiveBlockRounds } from "./blockRounds";
import {
    inferRoundSlotLayout,
    type ParallelRoundLineLike,
} from "./parallelRoundCollapse";

export interface ParallelConstructorApiLine extends ParallelRoundLineLike {
    id: number;
}

/** Agrupa líneas planas del bloque en slots × rondas (contrato parallelRoundCollapse). */
export function groupParallelConstructorApiLines<T extends ParallelConstructorApiLine>(
    lines: T[],
    blockRounds: number | null | undefined,
    minSlots: number
): { rounds: number; slotLines: T[][] } {
    const effectiveRounds = getEffectiveBlockRounds(blockRounds, lines);
    return inferRoundSlotLayout(lines, effectiveRounds, minSlots);
}

/** true si hay más de una fila por slot o más filas que slots mínimos (formato expandido/legacy). */
export function isParallelConstructorExpandedLines(
    lines: ParallelConstructorApiLine[],
    minSlots: number
): boolean {
    if (lines.length <= minSlots) {
        return false;
    }
    const effectiveRounds = getEffectiveBlockRounds(null, lines);
    const layout = inferRoundSlotLayout(lines, effectiveRounds, minSlots);
    if (layout.slotLines.some((slot) => slot.length > 1)) {
        return true;
    }
    return lines.length > minSlots;
}
