/**
 * forTimeRow.ts — Estado, normalización, persistencia e hidratación de filas for_time (secuencia numerada).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.2.0 — setData por ejercicio para series independientes por slot
 */

import { markDistinctStepsFromMaster, groupParallelConstructorApiLines, isParallelConstructorExpandedLines } from "@nexia/shared";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorSetData,
} from "../../constructorTypes";
import { isFilledConstructorExercise } from "./supersetRow";
import { createDefaultSetData } from "./singleSetRow";
import type { PersistExerciseLine, ApiExerciseLine } from "./singleSetRow";

export const MIN_FOR_TIME_SLOTS = 2;
export const DEFAULT_FOR_TIME_SLOTS = 3;
export const DEFAULT_FOR_TIME_ROUNDS = 3;

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

function copyLoadFields(source: ConstructorSetData): Partial<ConstructorSetData> {
    const patch: Partial<ConstructorSetData> = {};
    for (const key of LOAD_FIELDS) {
        (patch as Record<string, unknown>)[key] = source[key];
    }
    return patch;
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

/* ------------------------------------------------------------------ */
/*  setData por ejercicio (for_time expansion)                        */
/* ------------------------------------------------------------------ */

function exerciseLoadToSetData(ex: ConstructorExercise): ConstructorSetData {
    return {
        id: `set-${generateId()}`,
        plannedReps: ex.plannedReps,
        plannedWeight: ex.plannedWeight,
        plannedDuration: ex.plannedDuration,
        effortCharacter: ex.effortCharacter,
        effortValue: ex.effortValue,
        rest: null,
        isManuallyEdited: false,
    };
}

function resizeExerciseSetData(
    existing: ConstructorSetData[] | undefined,
    targetSets: number,
    master: ConstructorSetData
): ConstructorSetData[] {
    const next: ConstructorSetData[] = existing ? [...existing] : [];
    while (next.length < targetSets) {
        next.push({
            ...createDefaultSetData(),
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

export function updateForTimeExerciseSetData(
    exercise: ConstructorExercise,
    setDataId: string,
    updates: Partial<ConstructorSetData>
): ConstructorExercise {
    const setData = exercise.setData?.length ? [...exercise.setData] : [];
    const index = setData.findIndex((s) => s.id === setDataId);
    if (index < 0) return exercise;

    const merged: ConstructorSetData = {
        ...setData[index],
        ...updates,
        isManuallyEdited:
            index > 0 ? updates.isManuallyEdited ?? true : setData[index].isManuallyEdited,
    };
    setData[index] = merged;

    if (index === 0) {
        for (let i = 1; i < setData.length; i++) {
            if (!setData[i].isManuallyEdited) {
                setData[i] = {
                    ...setData[i],
                    ...copyLoadFields(merged),
                    isManuallyEdited: false,
                };
            }
        }
    }

    return { ...exercise, setData };
}

export function propagateForTimeSetDataInheritance(
    exercise: ConstructorExercise
): ConstructorExercise {
    const setData = exercise.setData?.length ? [...exercise.setData] : [];
    if (setData.length === 0) return exercise;

    const master = setData[0];
    for (let i = 1; i < setData.length; i++) {
        if (!setData[i].isManuallyEdited) {
            setData[i] = {
                ...setData[i],
                ...copyLoadFields(master),
                isManuallyEdited: false,
            };
        }
    }

    return { ...exercise, setData };
}

/* ------------------------------------------------------------------ */
/*  Normalización                                                     */
/* ------------------------------------------------------------------ */

export function normalizeForTimeRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.FOR_TIME) {
        return row;
    }

    const rounds = row.rounds ?? DEFAULT_FOR_TIME_ROUNDS;
    const exercises: ConstructorExercise[] = [];

    const targetLength =
        row.exercises.length === 0
            ? DEFAULT_FOR_TIME_SLOTS
            : Math.max(MIN_FOR_TIME_SLOTS, row.exercises.length);

    for (let i = 0; i < targetLength; i++) {
        const existing = row.exercises[i];
        if (existing) {
            let setData: ConstructorSetData[];
            if (existing.setData?.length) {
                const master = existing.setData[0];
                setData = resizeExerciseSetData(existing.setData, rounds, master);
            } else {
                const master = exerciseLoadToSetData(existing);
                setData = resizeExerciseSetData(undefined, rounds, master);
            }
            exercises.push({ ...existing, setData });
        } else {
            exercises.push(createForTimeExerciseSlot(i, row.id));
        }
    }

    return {
        ...row,
        exercises,
        rounds,
        timeCap: row.timeCap ?? null,
        repsTipo: row.repsTipo ?? "reps",
    };
}

/* ------------------------------------------------------------------ */
/*  Persistencia (payload)                                            */
/* ------------------------------------------------------------------ */

export function getForTimePersistLines(row: ConstructorRow): PersistExerciseLine[] {
    const normalized = normalizeForTimeRow(row);
    const lines: PersistExerciseLine[] = [];

    for (const exercise of normalized.exercises) {
        if (!isFilledConstructorExercise(exercise)) continue;

        const setData = exercise.setData?.length ? exercise.setData : [];
        if (setData.length === 0) {
            // Legacy fallback: 1 line with planned_sets = row.rounds
            lines.push({
                orderInBlock: lines.length + 1,
                exercise,
                serverExerciseId: exercise.serverExerciseId,
            });
            continue;
        }

        for (const entry of setData) {
            lines.push({
                orderInBlock: lines.length + 1,
                exercise,
                setDataEntry: entry,
                serverExerciseId: entry.serverExerciseId,
            });
        }
    }

    return lines;
}

/* ------------------------------------------------------------------ */
/*  Hidratación desde API                                             */
/* ------------------------------------------------------------------ */

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

function buildParallelSlotFromApiLines(
    slotLines: ApiExerciseLine[],
    slotIndex: number,
    rowId: string,
    createEmptySlot: (index: number, rowId: string) => ConstructorExercise
): ConstructorExercise {
    if (slotLines.length === 0) {
        return createEmptySlot(slotIndex, rowId);
    }

    const first = slotLines[0];
    const exercise: ConstructorExercise = {
        id: `ex-${first.id}-${slotIndex}`,
        serverExerciseId: slotLines.length === 1 ? first.id : undefined,
        exerciseId: first.exercise_id,
        exerciseName: `Ejercicio #${first.exercise_id}`,
        plannedReps: first.planned_reps,
        plannedWeight: first.planned_weight,
        plannedDuration: first.planned_duration,
        effortCharacter: first.effort_character as ConstructorExercise["effortCharacter"],
        effortValue: first.effort_value,
        notes: first.notes,
        repsTipo:
            first.planned_duration != null && !first.planned_reps?.trim() ? "tiempo" : "reps",
    };

    let setData: ConstructorSetData[];
    if (slotLines.length === 1 && (first.planned_sets ?? 1) > 1) {
        const count = first.planned_sets ?? 3;
        const template = setDataFromApiLine(first, false);
        setData = Array.from({ length: count }, (_, idx) => ({
            ...template,
            id: `set-legacy-${idx}-${generateId()}`,
            isManuallyEdited: false,
            serverExerciseId: idx === 0 ? first.id : undefined,
        }));
    } else {
        setData = markDistinctStepsFromMaster(
            slotLines
                .sort((a, b) => a.order_in_block - b.order_in_block)
                .map((ex) => setDataFromApiLine(ex, false))
        );
    }

    return { ...exercise, setData };
}

export function isExpandedForTimeApiLines(exs: ApiExerciseLine[]): boolean {
    return isParallelConstructorExpandedLines(exs, MIN_FOR_TIME_SLOTS);
}

export function hydrateForTimeConstructorRow(
    base: ConstructorRow,
    exs: ApiExerciseLine[]
): ConstructorRow {
    const { rounds, slotLines } = groupParallelConstructorApiLines(
        exs,
        base.rounds,
        MIN_FOR_TIME_SLOTS
    );

    const slots = slotLines.map((lines, index) =>
        buildParallelSlotFromApiLines(lines, index, base.id, createForTimeExerciseSlot)
    );

    return normalizeForTimeRow({
        ...base,
        exercises: slots,
        rounds,
    });
}

/* ------------------------------------------------------------------ */
/*  Slot management                                                   */
/* ------------------------------------------------------------------ */

export function addForTimeExerciseSlot(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeForTimeRow(row);
    const newSlot = createForTimeExerciseSlot(normalized.exercises.length, normalized.id);
    const rounds = normalized.rounds ?? DEFAULT_FOR_TIME_ROUNDS;
    const master = exerciseLoadToSetData(newSlot);
    const setData = resizeExerciseSetData(undefined, rounds, master);

    return {
        ...normalized,
        exercises: [...normalized.exercises, { ...newSlot, setData }],
    };
}

export function removeForTimeExerciseSlot(
    row: ConstructorRow,
    exerciseSlotId: string
): ConstructorRow {
    const normalized = normalizeForTimeRow(row);
    if (normalized.exercises.length <= MIN_FOR_TIME_SLOTS) {
        return normalized;
    }
    return {
        ...normalized,
        exercises: normalized.exercises.filter((ex) => ex.id !== exerciseSlotId),
    };
}

/* ------------------------------------------------------------------ */
/*  Labels                                                            */
/* ------------------------------------------------------------------ */

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
