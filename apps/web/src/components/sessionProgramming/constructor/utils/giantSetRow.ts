/**
 * giantSetRow.ts — Estado, normalización, persistencia e hidratación de filas giant_set (N slots A1…An).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.2.0 — setData por ejercicio para series independientes por slot
 */

import { markDistinctStepsFromMaster } from "@nexia/shared";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorSetData,
} from "../../constructorTypes";
import { isFilledConstructorExercise } from "./supersetRow";
import { createDefaultSetData } from "./singleSetRow";
import type { PersistExerciseLine, ApiExerciseLine } from "./singleSetRow";

export const MIN_GIANT_SET_SLOTS = 2;
export const DEFAULT_GIANT_SET_SLOTS = 3;

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

/* ------------------------------------------------------------------ */
/*  setData por ejercicio (giant_set expansion)                       */
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

export function updateGiantSetExerciseSetData(
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

export function propagateGiantSetSetDataInheritance(
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

export function normalizeGiantSetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.GIANT_SET) {
        return row;
    }

    const sets = row.sets ?? 3;
    const exercises: ConstructorExercise[] = [];

    const targetLength =
        row.exercises.length === 0
            ? DEFAULT_GIANT_SET_SLOTS
            : Math.max(MIN_GIANT_SET_SLOTS, row.exercises.length);

    for (let i = 0; i < targetLength; i++) {
        const existing = row.exercises[i];
        if (existing) {
            let setData: ConstructorSetData[];
            if (existing.setData?.length) {
                const master = existing.setData[0];
                setData = resizeExerciseSetData(existing.setData, sets, master);
            } else {
                const master = exerciseLoadToSetData(existing);
                setData = resizeExerciseSetData(undefined, sets, master);
            }
            exercises.push({ ...existing, setData });
        } else {
            exercises.push(createGiantSetExerciseSlot(i, row.id));
        }
    }

    return {
        ...row,
        exercises,
        sets,
        rest: row.rest ?? 90,
        repsTipo: row.repsTipo ?? "reps",
    };
}

/* ------------------------------------------------------------------ */
/*  Persistencia (payload)                                            */
/* ------------------------------------------------------------------ */

export function getGiantSetPersistLines(row: ConstructorRow): PersistExerciseLine[] {
    const normalized = normalizeGiantSetRow(row);
    const lines: PersistExerciseLine[] = [];

    for (const exercise of normalized.exercises) {
        if (!isFilledConstructorExercise(exercise)) continue;

        const setData = exercise.setData?.length ? exercise.setData : [];
        if (setData.length === 0) {
            // Legacy fallback: 1 line with planned_sets = row.sets
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

function groupByExerciseId(exs: ApiExerciseLine[]): Record<number, ApiExerciseLine[]> {
    const map: Record<number, ApiExerciseLine[]> = {};
    for (const ex of exs) {
        if (!map[ex.exercise_id]) map[ex.exercise_id] = [];
        map[ex.exercise_id].push(ex);
    }
    return map;
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

export function isExpandedGiantSetApiLines(exs: ApiExerciseLine[]): boolean {
    if (exs.length < 2) return false;
    const byExercise = groupByExerciseId(exs);
    // Expanded if at least one exercise has multiple lines with planned_sets === 1
    for (const group of Object.values(byExercise)) {
        if (group.length >= 2 && group.every((e) => (e.planned_sets ?? 1) === 1)) {
            return true;
        }
    }
    return false;
}

export function hydrateGiantSetConstructorRow(
    base: ConstructorRow,
    exs: ApiExerciseLine[]
): ConstructorRow {
    const byExercise = groupByExerciseId(exs);
    const slots: ConstructorExercise[] = [];

    // Ordenar grupos por order_in_block del primer ejercicio de cada grupo
    const sortedGroups = Object.values(byExercise).sort(
        (a, b) => (a[0]?.order_in_block ?? 0) - (b[0]?.order_in_block ?? 0)
    );

    for (const group of sortedGroups) {
        if (!group || group.length === 0) continue;

        const first = group[0];
        const exercise: ConstructorExercise = {
            id: `ex-${first.id}-${slots.length}`,
            serverExerciseId: group.length === 1 ? first.id : undefined,
            exerciseId: first.exercise_id,
            exerciseName: `Ejercicio #${first.exercise_id}`,
            plannedReps: first.planned_reps,
            plannedWeight: first.planned_weight,
            plannedDuration: first.planned_duration,
            effortCharacter: first.effort_character as ConstructorExercise["effortCharacter"],
            effortValue: first.effort_value,
            notes: first.notes,
            repsTipo:
                first.planned_duration != null && !first.planned_reps?.trim()
                    ? "tiempo"
                    : "reps",
        };

        if (group.length === 1 && (first.planned_sets ?? 1) > 1) {
            // Collapsed legacy: 1 line with planned_sets > 1
            const count = first.planned_sets ?? 3;
            const template = setDataFromApiLine(first, false);
            const setData = Array.from({ length: count }, (_, idx) => ({
                ...template,
                id: `set-legacy-${idx}-${generateId()}`,
                isManuallyEdited: false,
                serverExerciseId: idx === 0 ? first.id : undefined,
            }));
            slots.push({ ...exercise, setData });
        } else {
            // Expanded: N lines with planned_sets === 1
            const setData = markDistinctStepsFromMaster(
                group
                    .sort((a, b) => a.order_in_block - b.order_in_block)
                    .map((ex) => setDataFromApiLine(ex, false))
            );
            slots.push({ ...exercise, setData });
        }
    }

    return normalizeGiantSetRow({
        ...base,
        exercises: slots,
        sets: slots[0]?.setData?.length ?? base.sets ?? 3,
    });
}

/* ------------------------------------------------------------------ */
/*  Slot management                                                   */
/* ------------------------------------------------------------------ */

export function addGiantSetExerciseSlot(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeGiantSetRow(row);
    const newSlot = createGiantSetExerciseSlot(normalized.exercises.length, normalized.id);
    const sets = normalized.sets ?? 3;
    const master = exerciseLoadToSetData(newSlot);
    const setData = resizeExerciseSetData(undefined, sets, master);

    return {
        ...normalized,
        exercises: [...normalized.exercises, { ...newSlot, setData }],
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

/* ------------------------------------------------------------------ */
/*  Labels                                                            */
/* ------------------------------------------------------------------ */

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
