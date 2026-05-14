/**
 * forTimeRow.ts — Estado y normalización de filas for_time (secuencia numerada).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";

export const MIN_FOR_TIME_SLOTS = 2;
export const DEFAULT_FOR_TIME_SLOTS = 3;
export const DEFAULT_FOR_TIME_ROUNDS = 3;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createForTimeExerciseSlot(
    index: number,
    rowId?: string
): ConstructorExercise {
    const id = rowId
        ? `ex-ft-${index + 1}-${rowId}`
        : `ex-ft-${generateId()}`;
    return {
        id,
        exerciseId: 0,
        exerciseName: "",
        plannedReps: "10",
        plannedWeight: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        notes: null,
        repsTipo: "reps",
    };
}

export function normalizeForTimeRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.FOR_TIME) {
        return row;
    }

    const exercises = [...row.exercises];
    const targetLength =
        exercises.length === 0
            ? DEFAULT_FOR_TIME_SLOTS
            : Math.max(MIN_FOR_TIME_SLOTS, exercises.length);

    while (exercises.length < targetLength) {
        exercises.push(createForTimeExerciseSlot(exercises.length, row.id));
    }

    return {
        ...row,
        exercises,
        rounds: row.rounds ?? DEFAULT_FOR_TIME_ROUNDS,
        repsTipo: row.repsTipo ?? "reps",
    };
}

export function addForTimeExerciseSlot(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeForTimeRow(row);
    return {
        ...normalized,
        exercises: [
            ...normalized.exercises,
            createForTimeExerciseSlot(normalized.exercises.length, normalized.id),
        ],
    };
}

export function forTimeGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.FOR_TIME) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `FOR TIME ${letter}`);
        index += 1;
    }
    return map;
}
