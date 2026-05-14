/**
 * dropsetRow.ts — Estado, herencia y persistencia de filas dropset.
 * Contexto: MAIN + N drops; sets = N (drops tras MAIN); descanso tras secuencia en row.rest.
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

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

/** Número de drops tras MAIN (UI «Series»). setData.length = dropCount + 1 */
export const DEFAULT_DROP_COUNT = 3;

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

function resizeDropSteps(
    setData: ConstructorSetData[],
    targetLength: number
): ConstructorSetData[] {
    const next = [...setData];
    while (next.length < targetLength) {
        const master = next[0] ?? createDefaultDropStepData(true);
        next.push({
            ...createDefaultDropStepData(false),
            ...copyLoadFields(master),
            id: `drop-${generateId()}`,
            isManuallyEdited: false,
        });
    }
    if (next.length > targetLength) {
        return next.slice(0, targetLength);
    }
    return next;
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

    const dropCount = Math.max(1, row.sets ?? DEFAULT_DROP_COUNT);
    const targetLength = dropCount + 1;
    const restFallback = row.rest ?? 120;

    let setData = row.setData?.length
        ? resizeDropSteps(row.setData, targetLength)
        : resizeDropSteps(
              Array.from({ length: targetLength }, (_, i) =>
                  createDefaultDropStepData(i === 0)
              ),
              targetLength
          );

    setData = propagateDropInheritance(setData);

    const exercises = row.exercises.length > 0 ? [row.exercises[0]] : [];

    return {
        ...row,
        sets: dropCount,
        rest: restFallback,
        repsTipo: row.repsTipo ?? "reps",
        setData,
        exercises,
    };
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
    exs: ApiExerciseLine[]
): ConstructorRow {
    const sorted = [...exs].sort((a, b) => a.order_in_block - b.order_in_block);
    const first = sorted[0];
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

    const setData: ConstructorSetData[] = sorted.map((ex) => ({
        id: `drop-${ex.id}-${generateId()}`,
        plannedReps: ex.planned_reps,
        plannedWeight: ex.planned_weight,
        plannedDuration: ex.planned_duration,
        effortCharacter: ex.effort_character as ConstructorSetData["effortCharacter"],
        effortValue: ex.effort_value,
        rest: null,
        isManuallyEdited: false,
        serverExerciseId: ex.id,
    }));

    const dropCount = Math.max(1, setData.length - 1);

    return normalizeDropsetRow({
        ...base,
        sets: dropCount,
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
    return exs.every((e) => (e.planned_sets ?? 1) === 1);
}
