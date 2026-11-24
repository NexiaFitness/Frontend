/**
 * sessionStructureLoading.ts — Condiciones de carga para estructura de sesión.
 *
 * La vista agrupada resuelve nombres de ejercicio por ids (`GET /exercises/lookup`).
 * `isLoading` debe incluir esa resolución para no renderizar placeholders `Ejercicio #id`.
 */

import type { SessionBlockExercise } from "../../types/sessionProgramming";
import type { SessionExercise } from "../../types/trainingSessions";

/** Sesiones por bloques solo traen `exercise_id`; los nombres se piden aparte. */
export function needsExerciseNamesForBlocks(blockCount: number): boolean {
    return blockCount > 0;
}

/** Legacy puede incluir `exercise.nombre`; solo se piden los ids que no lo traen. */
export function legacyExerciseIdsWithoutName(legacyExercises: SessionExercise[]): number[] {
    return legacyExercises
        .filter((ex) => !ex.exercise?.nombre?.trim())
        .map((ex) => ex.exercise_id);
}

/** Por id: el mapa puede conservar entradas de bloques de otra sesion. */
export function areBlockExercisesLoaded(
    blockIds: readonly number[],
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>
): boolean {
    return blockIds.every((id) => blockExercisesByBlock[id] !== undefined);
}

/** Ids de ejercicio de los bloques actuales (ignora entradas de otra sesión). */
export function blockExerciseIds(
    blockIds: readonly number[],
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>
): number[] {
    return blockIds.flatMap((id) => (blockExercisesByBlock[id] ?? []).map((ex) => ex.exercise_id));
}

export function isBlockStructureLoading(input: {
    isLoadingBlocks: boolean;
    blockIds: readonly number[];
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>;
    isLoadingBlockTypes: boolean;
    isLoadingExerciseNames: boolean;
}): boolean {
    const {
        isLoadingBlocks,
        blockIds,
        blockExercisesByBlock,
        isLoadingBlockTypes,
        isLoadingExerciseNames,
    } = input;
    const blockCount = blockIds.length;

    if (isLoadingBlocks) return true;
    if (!areBlockExercisesLoaded(blockIds, blockExercisesByBlock)) return true;
    if (blockCount === 0) return false;

    if (isLoadingBlockTypes) return true;
    if (needsExerciseNamesForBlocks(blockCount) && isLoadingExerciseNames) return true;

    return false;
}

export function isLegacyStructureLoading(input: {
    isLoadingLegacy: boolean;
    legacyExercises: SessionExercise[];
    isLoadingExerciseNames: boolean;
}): boolean {
    const { isLoadingLegacy, legacyExercises, isLoadingExerciseNames } = input;
    if (isLoadingLegacy) return true;
    if (legacyExerciseIdsWithoutName(legacyExercises).length > 0 && isLoadingExerciseNames) {
        return true;
    }
    return false;
}
