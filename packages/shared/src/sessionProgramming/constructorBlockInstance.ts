/**
 * constructorBlockInstance.ts — Instancias de bloque del constructor vs bloques API.
 *
 * Contexto: varias filas ConstructorRow comparten una instancia lógica (blockInstanceId)
 * y se persisten como un solo SessionBlock. Incluye detección de sesiones legacy
 * (varios bloques API del mismo tipo con un solo ejercicio cada uno).
 *
 * @author Frontend Team
 * @since v6.7.0
 */

import type { SessionBlock, SessionBlockExerciseHydrationLine, SetType } from "../types/sessionProgramming";
import { SET_TYPE } from "../types/sessionProgramming";

export type ConstructorRowInstanceKey = {
    blockInstanceId?: string;
    blockTypeId: number;
    setType: SetType;
};

/** Genera un id de instancia de bloque (estable en la sesión de edición). */
export function createBlockInstanceId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `binst-${crypto.randomUUID()}`;
    }
    return `binst-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Clave estable de instancia (evita reagrupar en cada render si falta blockInstanceId). */
export function resolveBlockInstanceId(row: { id: string; blockInstanceId?: string }): string {
    if (row.blockInstanceId && row.blockInstanceId.length > 0) {
        return row.blockInstanceId;
    }
    return `legacy-row-${row.id}`;
}

/** Asigna blockInstanceId si falta (filas antiguas en memoria o tests). */
export function ensureBlockInstanceId<T extends { id: string; blockInstanceId?: string }>(
    row: T,
): T & { blockInstanceId: string } {
    if (row.blockInstanceId && row.blockInstanceId.length > 0) {
        return row as T & { blockInstanceId: string };
    }
    return { ...row, blockInstanceId: resolveBlockInstanceId(row) };
}

/**
 * Agrupa filas conservando el orden de aparición de cada blockInstanceId.
 */
export function groupConstructorRowsByBlockInstance<
    T extends ConstructorRowInstanceKey & { id: string },
>(rows: T[]): Array<{ blockInstanceId: string; rows: T[] }> {
    const order: string[] = [];
    const map = new Map<string, T[]>();

    for (const row of rows) {
        const withId = ensureBlockInstanceId(row);
        const key = withId.blockInstanceId;
        if (!map.has(key)) {
            order.push(key);
            map.set(key, []);
        }
        map.get(key)!.push(withId);
    }

    return order.map((blockInstanceId) => ({
        blockInstanceId,
        rows: map.get(blockInstanceId)!,
    }));
}

export function isCollapsedSingleSetApiLines(exs: SessionBlockExerciseHydrationLine[]): boolean {
    if (exs.length === 0) return false;
    const firstId = exs[0].exercise_id;
    if (!exs.every((e) => e.exercise_id === firstId)) return false;
    if (exs.length > 1) {
        return exs.every((e) => (e.planned_sets ?? 1) === 1);
    }
    return (exs[0].planned_sets ?? 1) > 1;
}

function distinctExerciseCount(exs: SessionBlockExerciseHydrationLine[]): number {
    return new Set(exs.map((e) => e.exercise_id)).size;
}

/**
 * Bloque API «partido» por error de persistencia: single_set, un solo ejercicio distinto,
 * líneas colapsadas por series (o legacy planned_sets>1 en una línea).
 */
export function isLegacySplitSingletonExerciseBlock(
    block: SessionBlock,
    exercises: SessionBlockExerciseHydrationLine[],
): boolean {
    const setType = block.set_type ?? SET_TYPE.SINGLE_SET;
    if (setType !== SET_TYPE.SINGLE_SET) {
        return false;
    }
    if (exercises.length === 0) {
        return false;
    }
    if (distinctExerciseCount(exercises) !== 1) {
        return false;
    }
    if (isCollapsedSingleSetApiLines(exercises)) {
        return true;
    }
    return exercises.length === 1 && (exercises[0].planned_sets ?? 1) === 1;
}

export interface ApiBlockHydrationPartition {
    blockInstanceId: string;
    /** Bloques API fusionados en una instancia (1 en el modelo correcto; N en legacy). */
    apiBlocks: SessionBlock[];
}

/**
 * Particiona bloques API ordenados en instancias lógicas del constructor.
 * Fusiona runs consecutivos legacy (mismo block_type_id + single_set singleton).
 */
export function partitionApiBlocksForConstructorHydration(
    sortedBlocks: SessionBlock[],
    exercisesByBlockId: Readonly<Record<number, SessionBlockExerciseHydrationLine[]>>,
): ApiBlockHydrationPartition[] {
    if (sortedBlocks.length === 0) {
        return [];
    }

    const partitions: ApiBlockHydrationPartition[] = [];
    let run: SessionBlock[] = [];

    const flushRun = () => {
        if (run.length === 0) return;
        const persistedInstanceId = run[0]?.constructor_block_instance_id;
        partitions.push({
            blockInstanceId:
                persistedInstanceId && persistedInstanceId.length > 0
                    ? persistedInstanceId
                    : createBlockInstanceId(),
            apiBlocks: [...run],
        });
        run = [];
    };

    const canExtendRun = (block: SessionBlock): boolean => {
        if (run.length === 0) return true;
        const prev = run[run.length - 1];
        if (
            prev.constructor_block_instance_id &&
            block.constructor_block_instance_id &&
            prev.constructor_block_instance_id === block.constructor_block_instance_id
        ) {
            return true;
        }
        if (prev.block_type_id !== block.block_type_id) return false;
        const prevSet = prev.set_type ?? SET_TYPE.SINGLE_SET;
        const nextSet = block.set_type ?? SET_TYPE.SINGLE_SET;
        if (prevSet !== nextSet) return false;
        if (prevSet !== SET_TYPE.SINGLE_SET) return false;
        const prevEx = exercisesByBlockId[prev.id] ?? [];
        const nextEx = exercisesByBlockId[block.id] ?? [];
        return (
            isLegacySplitSingletonExerciseBlock(prev, prevEx) &&
            isLegacySplitSingletonExerciseBlock(block, nextEx)
        );
    };

    for (const block of sortedBlocks) {
        if (run.length > 0 && !canExtendRun(block)) {
            flushRun();
        }
        run.push(block);
    }
    flushRun();

    return partitions;
}

/**
 * Agrupa líneas API en segmentos = una fila del constructor.
 * Prioridad: constructor_row_key persistente; si no, heurística por exercise_id.
 */
export function groupLinesIntoConstructorRowSegments(
    lines: SessionBlockExerciseHydrationLine[],
): SessionBlockExerciseHydrationLine[][] {
    const sorted = [...lines].sort((a, b) => a.order_in_block - b.order_in_block);
    if (sorted.length === 0) {
        return [];
    }

    const hasRowKeys = sorted.some(
        (line) => line.constructor_row_key != null && line.constructor_row_key.length > 0,
    );
    if (hasRowKeys) {
        const order: string[] = [];
        const map = new Map<string, SessionBlockExerciseHydrationLine[]>();
        for (const line of sorted) {
            const key =
                line.constructor_row_key && line.constructor_row_key.length > 0
                    ? line.constructor_row_key
                    : `orphan-line-${line.id}`;
            if (!map.has(key)) {
                order.push(key);
                map.set(key, []);
            }
            map.get(key)!.push(line);
        }
        return order.map((key) => map.get(key)!);
    }

    return splitCollapsedSingleSetLinesIntoSegments(sorted);
}

/**
 * Divide líneas API single_set colapsadas (planned_sets=1) en segmentos por ejercicio
 * (cada segmento = una fila del constructor).
 */
export function splitCollapsedSingleSetLinesIntoSegments(
    lines: SessionBlockExerciseHydrationLine[],
): SessionBlockExerciseHydrationLine[][] {
    const sorted = [...lines].sort((a, b) => a.order_in_block - b.order_in_block);
    if (sorted.length === 0) {
        return [];
    }

    if (sorted.length === 1 && (sorted[0].planned_sets ?? 1) > 1) {
        return [sorted];
    }

    const segments: SessionBlockExerciseHydrationLine[][] = [];
    let current: SessionBlockExerciseHydrationLine[] = [];
    let currentExerciseId: number | null = null;

    for (const line of sorted) {
        const plannedSets = line.planned_sets ?? 1;
        if (plannedSets !== 1) {
            if (current.length > 0) {
                segments.push(current);
                current = [];
                currentExerciseId = null;
            }
            segments.push([line]);
            continue;
        }

        if (currentExerciseId === null || line.exercise_id === currentExerciseId) {
            current.push(line);
            currentExerciseId = line.exercise_id;
        } else {
            segments.push(current);
            current = [line];
            currentExerciseId = line.exercise_id;
        }
    }

    if (current.length > 0) {
        segments.push(current);
    }

    return segments;
}

/** Id de bloque API canónico al fusionar filas legacy (menor order_in_session / id). */
export function resolveCanonicalServerBlockId(
    apiBlocks: SessionBlock[],
): number | undefined {
    if (apiBlocks.length === 0) return undefined;
    const sorted = [...apiBlocks].sort(
        (a, b) =>
            a.order_in_session - b.order_in_session || a.id - b.id,
    );
    return sorted[0]?.id;
}
