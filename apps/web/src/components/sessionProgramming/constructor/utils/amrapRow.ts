/**
 * amrapRow.ts — Estado y normalización de filas amrap (secuencia = 1 ronda).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import { hydrateAmrapPlannedReps } from "@nexia/shared";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";

export const MIN_AMRAP_SLOTS = 2;
export const DEFAULT_AMRAP_SLOTS = 3;
export const DEFAULT_AMRAP_DURATION_SECONDS = 600;
export const DEFAULT_AMRAP_TARGET_ROUNDS = 3;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createAmrapExerciseSlot(index: number, rowId?: string): ConstructorExercise {
    const id = rowId ? `ex-amrap-${index + 1}-${rowId}` : `ex-amrap-${generateId()}`;
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

export interface NormalizeAmrapRowOptions {
    /** Si es true (default), rellena timeCap/rounds con valores por defecto cuando faltan. */
    applyDefaults?: boolean;
}

export function normalizeAmrapRow(
    row: ConstructorRow,
    options: NormalizeAmrapRowOptions = {}
): ConstructorRow {
    if (row.setType !== SET_TYPE.AMRAP) {
        return row;
    }

    const { applyDefaults = true } = options;

    const exercises = [...row.exercises];
    const targetLength =
        exercises.length === 0
            ? DEFAULT_AMRAP_SLOTS
            : Math.max(MIN_AMRAP_SLOTS, exercises.length);

    while (exercises.length < targetLength) {
        exercises.push(createAmrapExerciseSlot(exercises.length, row.id));
    }

    const normalizedExercises = exercises.map((ex) => ({
        ...ex,
        plannedReps: hydrateAmrapPlannedReps(ex.plannedReps),
    }));

    return {
        ...row,
        exercises: normalizedExercises,
        timeCap: applyDefaults ? row.timeCap ?? DEFAULT_AMRAP_DURATION_SECONDS : row.timeCap,
        rounds: applyDefaults ? row.rounds ?? DEFAULT_AMRAP_TARGET_ROUNDS : row.rounds,
        repsTipo: row.repsTipo ?? "reps",
    };
}

/**
 * Garantiza la estructura mínima de un AMRAP (slots y repsTipo) sin imponer
 * valores por defecto de timeCap/rounds. Util en renders controlados donde el
 * padre ya gestiona esos valores.
 */
export function ensureAmrapStructure(row: ConstructorRow): ConstructorRow {
    return normalizeAmrapRow(row, { applyDefaults: false });
}

export function addAmrapExerciseSlot(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeAmrapRow(row);
    return {
        ...normalized,
        exercises: [
            ...normalized.exercises,
            createAmrapExerciseSlot(normalized.exercises.length, normalized.id),
        ],
    };
}

export function amrapGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.AMRAP) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `AMRAP ${letter}`);
        index += 1;
    }
    return map;
}
