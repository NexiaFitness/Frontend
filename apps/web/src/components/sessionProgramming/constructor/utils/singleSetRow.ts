/**
 * singleSetRow.ts — Estado, herencia y persistencia de filas single_set.
 * Contexto: N sub-filas setData, 1 ejercicio, N líneas API con planned_sets: 1.
 * @spec docs/tipo-serie/04_single-set-dropset-expansion-fase1.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorSetData,
} from "../../constructorTypes";
import { isFilledConstructorExercise } from "./supersetRow";
import { normalizeDropsetRow } from "./dropsetRow";
import { getEmomPersistLines } from "./emomRow";
import { getSupersetPersistLines } from "./supersetRow";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const LOAD_FIELDS: (keyof ConstructorSetData)[] = [
    "plannedReps",
    "plannedWeight",
    "plannedDuration",
    "effortCharacter",
    "effortValue",
    "rest",
];

export function createDefaultSetData(restFallback = 60): ConstructorSetData {
    return {
        id: `set-${generateId()}`,
        plannedReps: "10",
        plannedWeight: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        rest: restFallback,
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

export function propagateSetDataInheritance(setData: ConstructorSetData[]): ConstructorSetData[] {
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

function resizeSetData(
    setData: ConstructorSetData[],
    targetSets: number,
    restFallback: number
): ConstructorSetData[] {
    const next = [...setData];
    while (next.length < targetSets) {
        const master = next[0] ?? createDefaultSetData(restFallback);
        next.push({
            ...createDefaultSetData(restFallback),
            ...copyLoadFields(master),
            id: `set-${generateId()}`,
            isManuallyEdited: false,
        });
    }
    if (next.length > targetSets) {
        return next.slice(0, targetSets);
    }
    return next;
}

export function normalizeSingleSetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.SINGLE_SET) {
        return row;
    }

    const sets = Math.max(1, row.sets ?? 3);
    const restFallback = row.rest ?? 60;
    let setData = row.setData?.length
        ? resizeSetData(row.setData, sets, restFallback)
        : resizeSetData(
              Array.from({ length: sets }, () => createDefaultSetData(restFallback)),
              sets,
              restFallback
          );

    setData = propagateSetDataInheritance(setData);

    const exercises =
        row.exercises.length > 0
            ? [row.exercises[0]]
            : [];

    return {
        ...row,
        sets,
        rest: restFallback,
        repsTipo: row.repsTipo ?? "reps",
        setData,
        exercises,
    };
}

export function updateSingleSetData(
    row: ConstructorRow,
    setDataId: string,
    updates: Partial<ConstructorSetData>
): ConstructorRow {
    const normalized = normalizeSingleSetRow(row);
    const index = normalized.setData!.findIndex((s) => s.id === setDataId);
    if (index < 0) return normalized;

    const nextSetData = [...normalized.setData!];
    const merged: ConstructorSetData = {
        ...nextSetData[index],
        ...updates,
        isManuallyEdited:
            index > 0
                ? updates.isManuallyEdited ?? true
                : nextSetData[index].isManuallyEdited,
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

export interface PersistExerciseLine {
    orderInBlock: number;
    exercise: ConstructorExercise;
    setDataEntry?: ConstructorSetData;
    serverExerciseId?: number;
    /** Índice dropset: 0 = MAIN, 1+ = DROP n */
    dropsetSequence?: number;
    /** Ventana EMOM (1-based → superset_group_id en API) */
    emomWindowIndex?: number;
}

export function getConstructorPersistLines(row: ConstructorRow): PersistExerciseLine[] {
    if (row.setType === SET_TYPE.SINGLE_SET) {
        const normalized = normalizeSingleSetRow(row);
        const exercise = normalized.exercises.find(isFilledConstructorExercise);
        if (!exercise || !normalized.setData?.length) {
            return [];
        }
        return normalized.setData.map((entry, index) => ({
            orderInBlock: index + 1,
            exercise,
            setDataEntry: entry,
            serverExerciseId: entry.serverExerciseId,
        }));
    }

    if (row.setType === SET_TYPE.DROPSET) {
        const normalized = normalizeDropsetRow(row);
        const exercise = normalized.exercises.find(isFilledConstructorExercise);
        if (!exercise || !normalized.setData?.length) {
            return [];
        }
        return normalized.setData.map((entry, index) => ({
            orderInBlock: index + 1,
            exercise,
            setDataEntry: entry,
            serverExerciseId: entry.serverExerciseId,
            dropsetSequence: index,
        }));
    }

    if (row.setType === SET_TYPE.SUPERSET) {
        return getSupersetPersistLines(row);
    }

    if (row.setType === SET_TYPE.EMOM) {
        return getEmomPersistLines(row);
    }

    return row.exercises
        .filter(isFilledConstructorExercise)
        .map((exercise, index) => ({
            orderInBlock: index + 1,
            exercise,
            serverExerciseId: exercise.serverExerciseId,
        }));
}

export interface ApiExerciseLine {
    id: number;
    exercise_id: number;
    planned_reps: string | null;
    planned_weight: number | null;
    planned_rest: number | null;
    planned_sets: number | null;
    planned_duration: number | null;
    effort_character: unknown;
    effort_value: number | null;
    notes: string | null;
    order_in_block: number;
}

export function isCollapsedSingleSetApiLines(exs: ApiExerciseLine[]): boolean {
    if (exs.length === 0) return false;
    const firstId = exs[0].exercise_id;
    if (!exs.every((e) => e.exercise_id === firstId)) return false;
    if (exs.length > 1) {
        return exs.every((e) => (e.planned_sets ?? 1) === 1);
    }
    return (exs[0].planned_sets ?? 1) > 1;
}

function setDataFromApiLine(
    ex: ApiExerciseLine,
    isManuallyEdited: boolean
): ConstructorSetData {
    return {
        id: `set-${ex.id}-${generateId()}`,
        plannedReps: ex.planned_reps,
        plannedWeight: ex.planned_weight,
        plannedDuration: ex.planned_duration,
        effortCharacter: ex.effort_character as ConstructorSetData["effortCharacter"],
        effortValue: ex.effort_value,
        rest: ex.planned_rest,
        isManuallyEdited,
        serverExerciseId: ex.id,
    };
}

export function hydrateSingleSetConstructorRow(
    base: ConstructorRow,
    exs: ApiExerciseLine[]
): ConstructorRow {
    const first = exs[0];
    const exercise: ConstructorExercise = {
        id: `ex-${first.id}-0`,
        serverExerciseId: exs.length === 1 ? first.id : undefined,
        exerciseId: first.exercise_id,
        exerciseName: `Ejercicio #${first.exercise_id}`,
        plannedReps: first.planned_reps,
        plannedWeight: first.planned_weight,
        plannedDuration: first.planned_duration,
        effortCharacter: first.effort_character as ConstructorExercise["effortCharacter"],
        effortValue: first.effort_value,
        notes: first.notes,
    };

    if (exs.length === 1 && (first.planned_sets ?? 1) > 1) {
        const count = first.planned_sets ?? 3;
        const template = setDataFromApiLine(first, false);
        const setData = Array.from({ length: count }, (_, i) => ({
            ...template,
            id: `set-legacy-${i}-${generateId()}`,
            isManuallyEdited: false,
            serverExerciseId: i === 0 ? first.id : undefined,
        }));
        return normalizeSingleSetRow({
            ...base,
            sets: count,
            rest: first.planned_rest ?? base.rest,
            exercises: [exercise],
            setData,
        });
    }

    const setData = exs
        .sort((a, b) => a.order_in_block - b.order_in_block)
        .map((ex) => setDataFromApiLine(ex, false));

    return normalizeSingleSetRow({
        ...base,
        sets: setData.length,
        rest: setData[0]?.rest ?? base.rest,
        exercises: [exercise],
        setData,
    });
}
