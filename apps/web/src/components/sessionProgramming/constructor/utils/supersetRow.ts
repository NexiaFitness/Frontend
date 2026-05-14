/**
 * supersetRow.ts — Estado y normalización de filas superset (2 slots A1/A2).
 * Contexto: CreateSession, EditSession y SupersetBlock comparten estas reglas.
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import { normalizeSingleSetRow } from "./singleSetRow";
import { normalizeDropsetRow } from "./dropsetRow";
import { normalizeGiantSetRow } from "./giantSetRow";
import { normalizeForTimeRow } from "./forTimeRow";

export const SUPERSET_SLOT_COUNT = 2;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSupersetExerciseSlot(
    slot: "a1" | "a2",
    rowId?: string
): ConstructorExercise {
    const id = rowId
        ? `ex-superset-${slot}-${rowId}`
        : `ex-superset-${slot}-${generateId()}`;
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

export function isFilledConstructorExercise(ex: ConstructorExercise): boolean {
    return ex.exerciseId > 0;
}

export function getPersistableExercises(row: ConstructorRow): ConstructorExercise[] {
    if (row.setType === SET_TYPE.SINGLE_SET) {
        const normalized = normalizeSingleSetRow(row);
        return normalized.exercises.filter(isFilledConstructorExercise);
    }
    if (row.setType === SET_TYPE.DROPSET) {
        const normalized = normalizeDropsetRow(row);
        return normalized.exercises.filter(isFilledConstructorExercise);
    }
    return row.exercises.filter(isFilledConstructorExercise);
}

export function normalizeSupersetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.SUPERSET) {
        return row;
    }

    const slots: ConstructorExercise[] = [];
    for (let i = 0; i < SUPERSET_SLOT_COUNT; i++) {
        const existing = row.exercises[i];
        if (existing) {
            slots.push(existing);
        } else {
            slots.push(
                createSupersetExerciseSlot(i === 0 ? "a1" : "a2", row.id)
            );
        }
    }

    return {
        ...row,
        exercises: slots,
        sets: row.sets ?? 3,
        rest: row.rest ?? 90,
        repsTipo: row.repsTipo ?? "reps",
    };
}

export function applyConstructorRowUpdate(
    row: ConstructorRow,
    updates: Partial<ConstructorRow>
): ConstructorRow {
    const next = { ...row, ...updates };
    if (next.setType === SET_TYPE.SUPERSET) {
        return normalizeSupersetRow(next);
    }
    if (next.setType === SET_TYPE.SINGLE_SET) {
        return normalizeSingleSetRow(next);
    }
    if (next.setType === SET_TYPE.DROPSET) {
        return normalizeDropsetRow(next);
    }
    if (next.setType === SET_TYPE.GIANT_SET) {
        return normalizeGiantSetRow(next);
    }
    if (next.setType === SET_TYPE.FOR_TIME) {
        return normalizeForTimeRow(next);
    }
    return next;
}

export function supersetGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.SUPERSET) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `SUPERSET ${letter}`);
        index += 1;
    }
    return map;
}
