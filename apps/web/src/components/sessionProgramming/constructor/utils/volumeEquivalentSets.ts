/**
 * volumeEquivalentSets.ts — Series equivalentes por tipo (contrato volumen Nexia).
 *
 * El backend suma planned_sets por línea SessionBlockExercise sin lógica por set_type.
 * Este módulo es la única fuente de verdad FE para:
 * - aggregateConstructorForSessionLoadDraft (validate-draft en vivo)
 * - buildExercisePayload (planned_sets al persistir)
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "../../constructorTypes";
import { normalizeSingleSetRow } from "./singleSetRow";
import { normalizeDropsetRow } from "./dropsetRow";
import { isFilledConstructorExercise } from "./supersetRow";

/** Rondas / series equivalentes de UNA línea persistida dentro de una fila constructor. */
export function getPersistLinePlannedSets(
    row: ConstructorRow,
    line: { dropsetSequence?: number; setDataEntry?: unknown }
): number {
    if (row.setType === SET_TYPE.SINGLE_SET) {
        return 1;
    }
    if (row.setType === SET_TYPE.DROPSET) {
        // Solo MAIN aporta volumen; drops son pasos intra-secuencia.
        return line.dropsetSequence === 0 ? Math.max(1, row.sets ?? 1) : 0;
    }
    // superset / giant_set / for_time expandidos: 1 fila = 1 ronda (block.rounds = total).
    if (line.setDataEntry) {
        return 1;
    }
    // Colapsado legacy: 1 fila por slot, planned_sets = rondas del bloque.
    return Math.max(0, getRowVolumeSetsPerExercise(row));
}

/** Series equivalentes por ejercicio de la fila (validate-draft, hints en vivo). */
export function getRowVolumeSetsPerExercise(row: ConstructorRow): number {
    switch (row.setType) {
        case SET_TYPE.SINGLE_SET: {
            const normalized = normalizeSingleSetRow(row);
            if (!normalized.exercises.some(isFilledConstructorExercise)) {
                return 0;
            }
            return normalized.setData?.length ?? normalized.sets ?? 0;
        }
        case SET_TYPE.DROPSET: {
            const normalized = normalizeDropsetRow(row);
            if (!normalized.exercises.some(isFilledConstructorExercise)) {
                return 0;
            }
            return normalized.sets ?? 0;
        }
        case SET_TYPE.SUPERSET:
        case SET_TYPE.GIANT_SET:
            return row.sets ?? 0;
        case SET_TYPE.FOR_TIME:
        case SET_TYPE.EMOM:
        case SET_TYPE.AMRAP:
            return row.rounds ?? row.sets ?? 0;
        default:
            return row.sets ?? 0;
    }
}
