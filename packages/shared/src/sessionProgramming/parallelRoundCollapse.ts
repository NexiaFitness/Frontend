/**
 * parallelRoundCollapse.ts — Colapsa líneas API expandidas (1 fila/ronda/slot)
 * al layout round-centric de superset, giant_set y for_time.
 *
 * Contrato persistencia (constructor):
 * - Orden: [slot1 × R rondas, slot2 × R rondas, …]
 * - Cada fila expandida: planned_sets = 1
 * - block.rounds (o row.sets en superset/giant) = R
 *
 * Contrato colapsado legacy:
 * - 1 fila por slot, planned_sets = R
 */

import type { SessionBlockExercise } from "../types/sessionProgramming";

/** Campos mínimos para inferir layout slot × ronda (constructor y vista). */
export interface ParallelRoundLineLike {
    exercise_id: number;
    order_in_block: number;
    planned_sets?: number | null;
}

export interface RoundSlotLayout<T extends ParallelRoundLineLike = SessionBlockExercise> {
    rounds: number;
    slotLines: T[][];
}

function sortByOrderInBlock(a: ParallelRoundLineLike, b: ParallelRoundLineLike): number {
    return a.order_in_block - b.order_in_block;
}

function maxLinesPerExerciseId(lines: ParallelRoundLineLike[]): number {
    const counts = new Map<number, number>();
    for (const line of lines) {
        counts.set(line.exercise_id, (counts.get(line.exercise_id) ?? 0) + 1);
    }
    const values = [...counts.values()];
    return values.length > 0 ? Math.max(...values) : 1;
}

function roundCandidates(
    lines: ParallelRoundLineLike[],
    blockRounds: number | null | undefined,
    minSlots: number
): number[] {
    const candidates = new Set<number>();

    if (blockRounds != null && blockRounds > 0) {
        candidates.add(blockRounds);
    }

    const maxPerExercise = maxLinesPerExerciseId(lines);
    if (maxPerExercise > 1 && maxPerExercise < lines.length) {
        candidates.add(maxPerExercise);
    }

    const firstPlanned = lines[0]?.planned_sets;
    if (firstPlanned != null && firstPlanned > 0) {
        candidates.add(firstPlanned);
    }

    // Mismo ejercicio en todos los slots (p. ej. A1/A2): N / minSlots rondas.
    if (maxPerExercise === lines.length && lines.length % minSlots === 0) {
        candidates.add(lines.length / minSlots);
    }

    return [...candidates].sort((a, b) => b - a);
}

/**
 * Infiere layout slot × ronda a partir de filas planas del bloque.
 */
export function inferRoundSlotLayout<T extends ParallelRoundLineLike>(
    lines: T[],
    blockRounds: number | null | undefined,
    minSlots: number
): RoundSlotLayout<T> {
    const sorted = [...lines].sort(sortByOrderInBlock);
    const lineCount = sorted.length;

    if (lineCount === 0) {
        return { rounds: 1, slotLines: [] };
    }

    // Colapsado canónico: 1 fila por slot.
    if (lineCount <= minSlots) {
        const rounds = Math.max(1, blockRounds ?? sorted[0]?.planned_sets ?? 1);
        return {
            rounds,
            slotLines: sorted.map((line) => [line]),
        };
    }

    for (const rounds of roundCandidates(sorted, blockRounds, minSlots)) {
        if (rounds > 0 && lineCount % rounds === 0) {
            const slotCount = lineCount / rounds;
            if (slotCount >= minSlots) {
                const slotLines: T[][] = [];
                for (let slotIdx = 0; slotIdx < slotCount; slotIdx++) {
                    slotLines.push(sorted.slice(slotIdx * rounds, (slotIdx + 1) * rounds));
                }
                return { rounds, slotLines };
            }
        }
    }

    const rounds = Math.max(1, blockRounds ?? sorted[0]?.planned_sets ?? 1);
    return {
        rounds,
        slotLines: sorted.map((line) => [line]),
    };
}
