/**
 * sessionStructureLoading.ts — Condiciones de carga para estructura de sesión.
 *
 * La vista agrupada resuelve nombres de ejercicio vía catálogo (`GET /exercises`).
 * `isLoading` debe incluir esa resolución para no renderizar placeholders `Ejercicio #id`.
 */

import type { SessionBlockExercise } from "../../types/sessionProgramming";
import type { SessionExercise } from "../../types/trainingSessions";

/** Sesiones por bloques solo traen `exercise_id`; el catálogo es obligatorio. */
export function needsExerciseCatalogForBlocks(blockCount: number): boolean {
    return blockCount > 0;
}

/** Legacy puede incluir `exercise.nombre`; catálogo solo si falta en alguna fila. */
export function needsExerciseCatalogForLegacy(legacyExercises: SessionExercise[]): boolean {
    return legacyExercises.some((ex) => !ex.exercise?.nombre?.trim());
}

export function needsExerciseCatalog(
    blockCount: number,
    legacyExercises: SessionExercise[]
): boolean {
    return needsExerciseCatalogForBlocks(blockCount) || needsExerciseCatalogForLegacy(legacyExercises);
}

/** Por id: el mapa puede conservar entradas de bloques de otra sesion. */
export function areBlockExercisesLoaded(
    blockIds: readonly number[],
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>
): boolean {
    return blockIds.every((id) => blockExercisesByBlock[id] !== undefined);
}

export function isBlockStructureLoading(input: {
    isLoadingBlocks: boolean;
    blockIds: readonly number[];
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>;
    isLoadingBlockTypes: boolean;
    isLoadingExerciseCatalog: boolean;
}): boolean {
    const {
        isLoadingBlocks,
        blockIds,
        blockExercisesByBlock,
        isLoadingBlockTypes,
        isLoadingExerciseCatalog,
    } = input;
    const blockCount = blockIds.length;

    if (isLoadingBlocks) return true;
    if (!areBlockExercisesLoaded(blockIds, blockExercisesByBlock)) return true;
    if (blockCount === 0) return false;

    if (isLoadingBlockTypes) return true;
    if (needsExerciseCatalogForBlocks(blockCount) && isLoadingExerciseCatalog) return true;

    return false;
}

export function isLegacyStructureLoading(input: {
    isLoadingLegacy: boolean;
    legacyExercises: SessionExercise[];
    isLoadingExerciseCatalog: boolean;
}): boolean {
    const { isLoadingLegacy, legacyExercises, isLoadingExerciseCatalog } = input;
    if (isLoadingLegacy) return true;
    if (needsExerciseCatalogForLegacy(legacyExercises) && isLoadingExerciseCatalog) {
        return true;
    }
    return false;
}
