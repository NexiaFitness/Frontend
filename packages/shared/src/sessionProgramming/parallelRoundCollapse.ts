/**
 * parallelRoundCollapse.ts — Colapsa líneas API expandidas (1 fila/ronda/slot)
 * al layout round-centric de superset, giant_set y for_time.
 *
 * Contexto:
 * - Contrato persistencia (constructor): [slot1 × R rondas, slot2 × R rondas, …]; cada fila
 *   expandida con planned_sets = 1; block.rounds (o row.sets en superset/giant) = R.
 * - Contrato colapsado legacy: 1 fila por slot, planned_sets = R.
 * - For Time: sessionBlockView pasa minSlots=1 solo si un único exercise_id; si no, minSlots=2.
 *
 * Notas de mantenimiento: no añadir atajos por exercise_id aquí sin tests superset/giant.
 *
 * @author Frontend Team
 * @since 2026-10-01
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

function slotLinesAreHomogeneousByExercise<T extends ParallelRoundLineLike>(
    slotLines: T[][]
): boolean {
    return slotLines.every((slot) => {
        if (slot.length === 0) return true;
        const exerciseId = slot[0].exercise_id;
        return slot.every((line) => line.exercise_id === exerciseId);
    });
}

function buildSlotMajorSlotLines<T extends ParallelRoundLineLike>(
    sorted: T[],
    rounds: number,
    slotCount: number
): T[][] {
    const slotLines: T[][] = [];
    for (let slotIdx = 0; slotIdx < slotCount; slotIdx++) {
        slotLines.push(sorted.slice(slotIdx * rounds, (slotIdx + 1) * rounds));
    }
    return slotLines;
}

/** Circuito intercalado: A·R1, B·R1, A·R2, B·R2… */
function buildRoundMajorSlotLines<T extends ParallelRoundLineLike>(
    sorted: T[],
    rounds: number,
    slotCount: number
): T[][] {
    const slotLines: T[][] = Array.from({ length: slotCount }, () => []);
    for (let roundIdx = 0; roundIdx < rounds; roundIdx += 1) {
        for (let slotIdx = 0; slotIdx < slotCount; slotIdx += 1) {
            const line = sorted[roundIdx * slotCount + slotIdx];
            if (line) slotLines[slotIdx].push(line);
        }
    }
    return slotLines;
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
                const slotMajor = buildSlotMajorSlotLines(sorted, rounds, slotCount);
                if (slotLinesAreHomogeneousByExercise(slotMajor)) {
                    return { rounds, slotLines: slotMajor };
                }
                const roundMajor = buildRoundMajorSlotLines(sorted, rounds, slotCount);
                if (slotLinesAreHomogeneousByExercise(roundMajor)) {
                    return { rounds, slotLines: roundMajor };
                }
                return { rounds, slotLines: slotMajor };
            }
        }
    }

    const rounds = Math.max(1, blockRounds ?? sorted[0]?.planned_sets ?? 1);
    return {
        rounds,
        slotLines: sorted.map((line) => [line]),
    };
}
