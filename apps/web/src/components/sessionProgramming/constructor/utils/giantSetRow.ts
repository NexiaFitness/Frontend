/**
 * giantSetRow.ts — Estado y normalización de filas giant_set (N slots A1…An).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";

export const MIN_GIANT_SET_SLOTS = 2;
export const DEFAULT_GIANT_SET_SLOTS = 3;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createGiantSetExerciseSlot(
    index: number,
    rowId?: string
): ConstructorExercise {
    const id = rowId
        ? `ex-giant-a${index + 1}-${rowId}`
        : `ex-giant-${generateId()}`;
    return {
        id,
        exerciseId: 0,
        exerciseName: "",
        plannedReps: "8",
        plannedWeight: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        notes: null,
        repsTipo: "reps",
    };
}

export function normalizeGiantSetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.GIANT_SET) {
        return row;
    }

    const exercises = [...row.exercises];
    const targetLength =
        exercises.length === 0
            ? DEFAULT_GIANT_SET_SLOTS
            : Math.max(MIN_GIANT_SET_SLOTS, exercises.length);

    while (exercises.length < targetLength) {
        exercises.push(createGiantSetExerciseSlot(exercises.length, row.id));
    }

    return {
        ...row,
        exercises,
        sets: row.sets ?? 3,
        rest: row.rest ?? 90,
        repsTipo: row.repsTipo ?? "reps",
    };
}

export function addGiantSetExerciseSlot(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeGiantSetRow(row);
    return {
        ...normalized,
        exercises: [
            ...normalized.exercises,
            createGiantSetExerciseSlot(normalized.exercises.length, normalized.id),
        ],
    };
}

export function removeGiantSetExerciseSlot(
    row: ConstructorRow,
    exerciseSlotId: string
): ConstructorRow {
    const normalized = normalizeGiantSetRow(row);
    if (normalized.exercises.length <= MIN_GIANT_SET_SLOTS) {
        return normalized;
    }
    return {
        ...normalized,
        exercises: normalized.exercises.filter((ex) => ex.id !== exerciseSlotId),
    };
}

export function giantSetGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.GIANT_SET) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `GIANT SET ${letter}`);
        index += 1;
    }
    return map;
}
