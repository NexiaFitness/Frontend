/**
 * hydrateSessionBlocksToConstructorRows.ts — API SessionBlock[] → ConstructorRow[].
 *
 * Contexto: partición legacy (N bloques API → 1 instancia) y multi-ejercicio single_set
 * (1 bloque API → N filas) con blockInstanceId compartido.
 *
 * @author Frontend Team
 * @since v6.7.0
 */

import {
    SET_TYPE,
    type SessionBlock,
    type SessionBlockExerciseHydrationLine,
} from "@nexia/shared/types/sessionProgramming";
import {
    partitionApiBlocksForConstructorHydration,
    resolveCanonicalServerBlockId,
    groupLinesIntoConstructorRowSegments,
} from "@nexia/shared/sessionProgramming/constructorBlockInstance";
import type {
    ConstructorExercise,
    ConstructorRow,
    RepsTipo,
} from "@/components/sessionProgramming/constructorTypes";
import {
    canHydrateDropsetApiLines,
    hydrateDropsetConstructorRow,
    hydrateEmomConstructorRow,
    hydrateForTimeConstructorRow,
    hydrateGiantSetConstructorRow,
    hydrateSingleSetConstructorRow,
    hydrateSupersetConstructorRow,
    isCollapsedSingleSetApiLines,
    normalizeAmrapRow,
    normalizeDropsetRow,
    normalizeEmomRow,
    normalizeForTimeRow,
    normalizeGiantSetRow,
    normalizeSingleSetRow,
    normalizeSupersetRow,
} from "@/components/sessionProgramming/constructor";

function inferRepsTipo(ex: {
    planned_reps: string | null;
    planned_duration: number | null;
}): RepsTipo {
    if (ex.planned_duration != null && !ex.planned_reps?.trim()) return "tiempo";
    return "reps";
}

function mapGenericExercises(
    exs: SessionBlockExerciseHydrationLine[],
): ConstructorExercise[] {
    return exs.map((ex, j) => ({
        id: `ex-${ex.id}-${j}`,
        serverExerciseId: ex.id,
        exerciseId: ex.exercise_id,
        exerciseName: `Ejercicio #${ex.exercise_id}`,
        plannedReps: ex.planned_reps,
        plannedWeight: ex.planned_weight,
        plannedAssistanceKg: ex.planned_assistance_kg ?? null,
        plannedDuration: ex.planned_duration,
        effortCharacter: ex.effort_character as ConstructorExercise["effortCharacter"],
        effortValue: ex.effort_value,
        notes: ex.notes,
    }));
}

function resolveConstructorRowId(
    segment: SessionBlockExerciseHydrationLine[],
    rowIndex: number,
    serverBlockId: number,
): string {
    const key = segment[0]?.constructor_row_key;
    if (key && key.length > 0) {
        return key;
    }
    return `row-${serverBlockId}-${rowIndex}`;
}

function baseRowFromBlock(
    block: SessionBlock,
    rowIndex: number,
    blockInstanceId: string,
    serverBlockId: number,
    exs: SessionBlockExerciseHydrationLine[],
    rowId?: string,
): ConstructorRow {
    const firstEx = exs[0];
    const setType = (block.set_type as ConstructorRow["setType"]) ?? SET_TYPE.SINGLE_SET;

    return {
        id: rowId ?? resolveConstructorRowId(exs, rowIndex, serverBlockId),
        blockInstanceId,
        serverBlockId,
        blockTypeId: block.block_type_id,
        setType,
        sets: exs[0]?.planned_sets ?? null,
        rounds: block.rounds,
        timeCap: block.time_cap,
        intervalSeconds: block.interval_seconds,
        rest: exs[0]?.planned_rest ?? 60,
        repsTipo: firstEx ? inferRepsTipo(firstEx) : "reps",
        exercises: [],
    };
}

function hydrateBlockToRows(
    block: SessionBlock,
    exs: SessionBlockExerciseHydrationLine[],
    blockInstanceId: string,
    serverBlockId: number,
    rowIndexSeed: number,
): ConstructorRow[] {
    const setType = (block.set_type as ConstructorRow["setType"]) ?? SET_TYPE.SINGLE_SET;
    const base = baseRowFromBlock(block, rowIndexSeed, blockInstanceId, serverBlockId, exs);

    if (setType === SET_TYPE.SINGLE_SET) {
        const segments = groupLinesIntoConstructorRowSegments(exs);
        if (segments.length > 1) {
            return segments.map((segment, segIndex) => {
                const rowId = resolveConstructorRowId(segment, rowIndexSeed + segIndex, serverBlockId);
                const rowBase = baseRowFromBlock(
                    block,
                    rowIndexSeed + segIndex,
                    blockInstanceId,
                    serverBlockId,
                    segment,
                    rowId,
                );
                if (isCollapsedSingleSetApiLines(segment)) {
                    return hydrateSingleSetConstructorRow(rowBase, segment);
                }
                return { ...rowBase, exercises: mapGenericExercises(segment) };
            });
        }

        if (isCollapsedSingleSetApiLines(exs)) {
            return [hydrateSingleSetConstructorRow(base, exs)];
        }
    }

    if (setType === SET_TYPE.DROPSET && canHydrateDropsetApiLines(exs)) {
        return [hydrateDropsetConstructorRow(base, exs)];
    }
    if (setType === SET_TYPE.SUPERSET && exs.length > 0) {
        return [hydrateSupersetConstructorRow(base, exs)];
    }
    if (setType === SET_TYPE.GIANT_SET && exs.length > 0) {
        return [hydrateGiantSetConstructorRow(base, exs)];
    }
    if (setType === SET_TYPE.FOR_TIME && exs.length > 0) {
        return [hydrateForTimeConstructorRow(base, exs)];
    }
    if (setType === SET_TYPE.EMOM && exs.length > 0) {
        return [hydrateEmomConstructorRow(base, exs)];
    }

    return [{ ...base, exercises: mapGenericExercises(exs) }];
}

function normalizeRow(row: ConstructorRow): ConstructorRow {
    if (row.setType === SET_TYPE.SUPERSET) return normalizeSupersetRow(row);
    if (row.setType === SET_TYPE.SINGLE_SET) return normalizeSingleSetRow(row);
    if (row.setType === SET_TYPE.DROPSET) return normalizeDropsetRow(row);
    if (row.setType === SET_TYPE.GIANT_SET) return normalizeGiantSetRow(row);
    if (row.setType === SET_TYPE.FOR_TIME) return normalizeForTimeRow(row);
    if (row.setType === SET_TYPE.EMOM) return normalizeEmomRow(row);
    if (row.setType === SET_TYPE.AMRAP) return normalizeAmrapRow(row);
    return row;
}

export function hydrateSessionBlocksToConstructorRows(
    sortedBlocks: SessionBlock[],
    exercisesByBlockId: Readonly<Record<number, SessionBlockExerciseHydrationLine[]>>,
): ConstructorRow[] {
    const partitions = partitionApiBlocksForConstructorHydration(sortedBlocks, exercisesByBlockId);
    const rows: ConstructorRow[] = [];
    let rowIndex = 0;

    for (const partition of partitions) {
        const canonicalId = resolveCanonicalServerBlockId(partition.apiBlocks) ?? partition.apiBlocks[0]?.id;

        if (partition.apiBlocks.length > 1) {
            for (const block of partition.apiBlocks) {
                const exs = exercisesByBlockId[block.id] ?? [];
                const hydrated = hydrateBlockToRows(
                    block,
                    exs,
                    partition.blockInstanceId,
                    block.id,
                    rowIndex,
                );
                rows.push(...hydrated);
                rowIndex += hydrated.length;
            }
            continue;
        }

        const block = partition.apiBlocks[0];
        if (!block) continue;
        const serverBlockId = canonicalId ?? block.id;
        const exs = exercisesByBlockId[block.id] ?? [];
        const hydrated = hydrateBlockToRows(
            block,
            exs,
            partition.blockInstanceId,
            serverBlockId,
            rowIndex,
        );
        rows.push(...hydrated);
        rowIndex += hydrated.length;
    }

    return rows.map(normalizeRow);
}
