/**
 * blockRounds.ts — Rondas a nivel de bloque según set_type (contrato persistencia).
 */

import { SET_TYPE, type SetType } from "../types/sessionProgramming";

export interface BlockRoundsRowLike {
    setType: SetType;
    sets?: number | null;
    rounds?: number | null;
}

/** Valor de `SessionBlock.rounds` al crear/actualizar un bloque desde el constructor. */
export function getBlockRoundsFromConstructorRow(row: BlockRoundsRowLike): number | null {
    switch (row.setType) {
        case SET_TYPE.SUPERSET:
        case SET_TYPE.GIANT_SET:
            return row.sets ?? null;
        case SET_TYPE.FOR_TIME:
        case SET_TYPE.AMRAP:
        case SET_TYPE.EMOM:
            return row.rounds ?? null;
        default:
            return row.rounds ?? null;
    }
}

/** Rondas efectivas para la vista read-only (block.rounds con fallback a filas). */
export function getEffectiveBlockRounds(
    blockRounds: number | null | undefined,
    lines: { planned_sets?: number | null }[]
): number | null {
    if (blockRounds != null && blockRounds > 0) {
        return blockRounds;
    }
    const first = lines[0]?.planned_sets;
    return first != null && first > 0 ? first : null;
}

/** `SessionBlock.time_cap` se persiste en segundos; la UI muestra minutos. */
export function timeCapSecondsToMinutes(
    timeCapSeconds: number | null | undefined
): number | null {
    if (timeCapSeconds == null || timeCapSeconds <= 0) {
        return null;
    }
    return Math.round(timeCapSeconds / 60);
}
