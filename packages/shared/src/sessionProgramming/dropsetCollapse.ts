/**
 * dropsetCollapse.ts — Colapsa líneas API expandidas por ronda a pasos únicos (MAIN + DROP n).
 *
 * El backend o saves legacy pueden devolver N×rondas filas con el mismo dropset_sequence;
 * la UI del constructor y la vista read-only esperan 1 fila por paso.
 */

import type { SessionBlockExercise } from "../types/sessionProgramming";

export interface DropsetLineLike {
    dropset_sequence?: number | null;
    order_in_block: number;
    planned_sets?: number | null;
}

export function dropsetStepKey(line: DropsetLineLike, orderFallback: number): number {
    if (line.dropset_sequence != null && line.dropset_sequence >= 0) {
        return line.dropset_sequence;
    }
    return orderFallback;
}

/** Una fila representativa por paso (primer encuentro por dropset_sequence). */
export function collapseDropsetLines<T extends DropsetLineLike>(lines: T[]): T[] {
    const sorted = [...lines].sort((a, b) => {
        const seqA = a.dropset_sequence ?? a.order_in_block;
        const seqB = b.dropset_sequence ?? b.order_in_block;
        return seqA - seqB;
    });

    const byStep = new Map<number, T>();
    for (const line of sorted) {
        const key = dropsetStepKey(line, Math.max(0, line.order_in_block - 1));
        if (!byStep.has(key)) {
            byStep.set(key, line);
        }
    }

    return [...byStep.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, line]) => line);
}

export function collapseDropsetBlockLines(
    lines: SessionBlockExercise[]
): SessionBlockExercise[] {
    return collapseDropsetLines(lines);
}

/** Rondas: planned_sets del MAIN único, o conteo de filas MAIN si están expandidas por ronda. */
export function inferDropsetRounds(
    lines: DropsetLineLike[],
    blockRounds: number | null | undefined
): number {
    const mainLines = lines.filter((l) => (l.dropset_sequence ?? 0) === 0);
    if (mainLines.length > 1) {
        return mainLines.length;
    }
    const main = mainLines[0] ?? lines[0];
    return Math.max(1, main?.planned_sets ?? blockRounds ?? 1);
}
