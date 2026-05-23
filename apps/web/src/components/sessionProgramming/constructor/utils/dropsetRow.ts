/**
 * dropsetRow.ts — Estado, herencia y persistencia de filas dropset.
 * Contexto: row.sets = rondas (repetir secuencia); setData = MAIN + drops (botón añadir).
 * Descanso tras secuencia en row.rest.
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { collapseDropsetLines, inferDropsetRounds, markDistinctStepsFromMaster } from "@nexia/shared";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorSetData,
} from "../../constructorTypes";
import type { ApiExerciseLine } from "./singleSetRow";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Rondas por defecto (repeticiones de la secuencia MAIN→drops) */
export const DEFAULT_DROPSET_ROUNDS = 3;

/** Máximo de drops adicionales tras MAIN (MAIN + 3 drops) */
export const MAX_DROPS_AFTER_MAIN = 3;

/** Estado inicial: MAIN + 1 drop */
export const MIN_DROPSET_STEPS = 2;
const DEFAULT_INITIAL_STEPS = MIN_DROPSET_STEPS;

const LOAD_FIELDS: (keyof ConstructorSetData)[] = [
    "plannedReps",
    "plannedWeight",
    "plannedDuration",
    "effortCharacter",
    "effortValue",
];

function createDefaultDropStepData(isMain: boolean): ConstructorSetData {
    return {
        id: `drop-${generateId()}`,
        plannedReps: isMain ? "8" : "8",
        plannedWeight: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        rest: null,
        isManuallyEdited: false,
    };
}

function copyLoadFields(source: ConstructorSetData): Partial<ConstructorSetData> {
    const patch: Partial<ConstructorSetData> = {};
    for (const key of LOAD_FIELDS) {
        (patch as Record<string, unknown>)[key] = source[key];
    }
    return patch;
}

function propagateDropInheritance(setData: ConstructorSetData[]): ConstructorSetData[] {
    if (setData.length === 0) return setData;
    const master = setData[0];
    return setData.map((entry, index) => {
        if (index === 0 || entry.isManuallyEdited) {
            return entry;
        }
        return {
            ...entry,
            ...copyLoadFields(master),
            isManuallyEdited: false,
        };
    });
}

function createInitialSetData(length: number): ConstructorSetData[] {
    return Array.from({ length }, (_, i) => createDefaultDropStepData(i === 0));
}

export function dropStepLabel(index: number): string {
    return index === 0 ? "MAIN" : `DROP ${index}`;
}

export function dropsetGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.DROPSET) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `DROP SET ${letter}`);
        index += 1;
    }
    return map;
}

export function normalizeDropsetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.DROPSET) {
        return row;
    }

    const rounds = Math.max(1, row.sets ?? DEFAULT_DROPSET_ROUNDS);
    const maxSteps = 1 + MAX_DROPS_AFTER_MAIN;
    const restFallback = row.rest ?? 120;

    let setData =
        row.setData?.length && row.setData.length > 0
            ? [...row.setData]
            : createInitialSetData(DEFAULT_INITIAL_STEPS);

    if (setData.length > maxSteps) {
        setData = setData.slice(0, maxSteps);
    }

    const exercises = row.exercises.length > 0 ? [row.exercises[0]] : [];

    return {
        ...row,
        sets: rounds,
        rest: restFallback,
        repsTipo: row.repsTipo ?? "reps",
        setData,
        exercises,
    };
}

export function addDropsetDrop(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeDropsetRow(row);
    const additionalDrops = (normalized.setData?.length ?? 1) - 1;
    if (additionalDrops >= MAX_DROPS_AFTER_MAIN) {
        return normalized;
    }

    const master = normalized.setData![0];
    const nextSetData = [
        ...normalized.setData!,
        {
            ...createDefaultDropStepData(false),
            ...copyLoadFields(master),
            id: `drop-${generateId()}`,
            isManuallyEdited: false,
        },
    ];

    return normalizeDropsetRow({ ...normalized, setData: nextSetData });
}

export function removeDropsetDrop(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeDropsetRow(row);
    const stepCount = normalized.setData?.length ?? MIN_DROPSET_STEPS;
    if (stepCount <= MIN_DROPSET_STEPS) {
        return normalized;
    }
    const nextSetData = normalized.setData!.slice(0, -1);
    return normalizeDropsetRow({ ...normalized, setData: nextSetData });
}

export function updateDropsetData(
    row: ConstructorRow,
    setDataId: string,
    updates: Partial<ConstructorSetData>
): ConstructorRow {
    const normalized = normalizeDropsetRow(row);
    const index = normalized.setData!.findIndex((s) => s.id === setDataId);
    if (index < 0) return normalized;

    const nextSetData = [...normalized.setData!];
    const merged: ConstructorSetData = {
        ...nextSetData[index],
        ...updates,
        isManuallyEdited:
            index > 0 ? (updates.isManuallyEdited ?? true) : nextSetData[index].isManuallyEdited,
    };
    nextSetData[index] = merged;

    if (index === 0) {
        for (let i = 1; i < nextSetData.length; i++) {
            if (!nextSetData[i].isManuallyEdited) {
                nextSetData[i] = {
                    ...nextSetData[i],
                    ...copyLoadFields(merged),
                    isManuallyEdited: false,
                };
            }
        }
    }

    return { ...normalized, setData: nextSetData };
}

export function setDataToExerciseView(
    entry: ConstructorSetData
): Pick<
    ConstructorExercise,
    | "plannedReps"
    | "plannedWeight"
    | "plannedDuration"
    | "effortCharacter"
    | "effortValue"
> {
    return {
        plannedReps: entry.plannedReps,
        plannedWeight: entry.plannedWeight,
        plannedDuration: entry.plannedDuration,
        effortCharacter: entry.effortCharacter,
        effortValue: entry.effortValue,
    };
}

export function hydrateDropsetConstructorRow(
    base: ConstructorRow,
    exs: DropsetApiExerciseLine[]
): ConstructorRow {
    const steps = collapseDropsetLines(exs);
    const first = steps[0];
    if (!first) {
        return normalizeDropsetRow(base);
    }
    const exercise: ConstructorExercise = {
        id: `ex-drop-${first.id}-0`,
        exerciseId: first.exercise_id,
        exerciseName: `Ejercicio #${first.exercise_id}`,
        plannedReps: first.planned_reps,
        plannedWeight: first.planned_weight,
        plannedDuration: first.planned_duration,
        effortCharacter: first.effort_character as ConstructorExercise["effortCharacter"],
        effortValue: first.effort_value,
        notes: first.notes,
    };

    const setData: ConstructorSetData[] = markDistinctStepsFromMaster(
        steps.map((ex) => ({
            id: `drop-${ex.id}-${generateId()}`,
            plannedReps: ex.planned_reps,
            plannedWeight: ex.planned_weight,
            plannedDuration: ex.planned_duration,
            effortCharacter: ex.effort_character as ConstructorSetData["effortCharacter"],
            effortValue: ex.effort_value,
            rest: null,
            isManuallyEdited: false,
            serverExerciseId: ex.id,
        }))
    );

    return normalizeDropsetRow({
        ...base,
        sets: inferDropsetRounds(exs, base.sets ?? base.rounds),
        rest: first.planned_rest ?? base.rest ?? 120,
        exercises: [exercise],
        setData,
    });
}

export interface DropsetApiExerciseLine extends ApiExerciseLine {
    dropset_sequence?: number | null;
}

export function isCollapsedDropsetApiLines(exs: DropsetApiExerciseLine[]): boolean {
    if (exs.length < 2) return false;
    const firstId = exs[0].exercise_id;
    if (!exs.every((e) => e.exercise_id === firstId)) return false;
    const keys = exs.map((e, i) => e.dropset_sequence ?? Math.max(0, e.order_in_block - 1));
    return new Set(keys).size === exs.length;
}

/** Hidrata dropset si hay al menos una línea del mismo ejercicio (colapsada o expandida). */
export function canHydrateDropsetApiLines(exs: DropsetApiExerciseLine[]): boolean {
    if (exs.length === 0) return false;
    const firstId = exs[0].exercise_id;
    return exs.every((e) => e.exercise_id === firstId);
}
