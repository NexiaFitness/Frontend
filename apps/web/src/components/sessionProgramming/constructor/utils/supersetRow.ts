/**
 * supersetRow.ts — Estado y normalización de filas superset (2 slots A1/A2).
 * Contexto: CreateSession, EditSession y SupersetBlock comparten estas reglas.
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.1.0 — setData por ejercicio para series independientes A1/A2
 */

import {
    markDistinctStepsFromMaster,
    groupParallelConstructorApiLines,
    isParallelConstructorExpandedLines,
} from "@nexia/shared";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorSetData,
} from "../../constructorTypes";
import { createDefaultSetData } from "./singleSetRow";
import { normalizeSingleSetRow } from "./singleSetRow";
import { normalizeDropsetRow } from "./dropsetRow";
import { normalizeGiantSetRow } from "./giantSetRow";
import { normalizeForTimeRow } from "./forTimeRow";
import { normalizeEmomRow } from "./emomRow";
import { normalizeAmrapRow } from "./amrapRow";
import type { PersistExerciseLine } from "./singleSetRow";

export const SUPERSET_SLOT_COUNT = 2;

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

/* ------------------------------------------------------------------ */
/*  setData por ejercicio (superset expansion)                        */
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

export function updateSupersetExerciseSetData(
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

/* ------------------------------------------------------------------ */
/*  Normalización                                                     */
/* ------------------------------------------------------------------ */

export function normalizeSupersetRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.SUPERSET) {
        return row;
    }

    const sets = row.sets ?? 3;
    const slots: ConstructorExercise[] = [];

    for (let i = 0; i < SUPERSET_SLOT_COUNT; i++) {
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
            slots.push({ ...existing, setData });
        } else {
            slots.push(createSupersetExerciseSlot(i === 0 ? "a1" : "a2", row.id));
        }
    }

    return {
        ...row,
        exercises: slots,
        sets,
        rest: row.rest ?? 90,
        repsTipo: row.repsTipo ?? "reps",
    };
}

/* ------------------------------------------------------------------ */
/*  Persistencia (payload)                                            */
/* ------------------------------------------------------------------ */

export function getSupersetPersistLines(row: ConstructorRow): PersistExerciseLine[] {
    const normalized = normalizeSupersetRow(row);
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

interface ApiExerciseLine {
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

export function isExpandedSupersetApiLines(exs: ApiExerciseLine[]): boolean {
    return isParallelConstructorExpandedLines(exs, SUPERSET_SLOT_COUNT);
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

function buildSupersetSlotFromApiLines(
    slotLines: ApiExerciseLine[],
    slotIndex: number,
    baseId: string,
    slotKey: "a1" | "a2"
): ConstructorExercise {
    if (slotLines.length === 0) {
        return createSupersetExerciseSlot(slotKey, baseId);
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

export function hydrateSupersetConstructorRow(
    base: ConstructorRow,
    exs: ApiExerciseLine[]
): ConstructorRow {
    const { rounds, slotLines } = groupParallelConstructorApiLines(
        exs,
        base.rounds,
        SUPERSET_SLOT_COUNT
    );

    const slots: ConstructorExercise[] = [];
    for (let i = 0; i < SUPERSET_SLOT_COUNT; i++) {
        slots.push(
            buildSupersetSlotFromApiLines(
                slotLines[i] ?? [],
                i,
                base.id,
                i === 0 ? "a1" : "a2"
            )
        );
    }

    return normalizeSupersetRow({
        ...base,
        exercises: slots,
        sets: rounds,
    });
}

/* ------------------------------------------------------------------ */
/*  Updates generales                                                 */
/* ------------------------------------------------------------------ */

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
    if (next.setType === SET_TYPE.EMOM) {
        return normalizeEmomRow(next);
    }
    if (next.setType === SET_TYPE.AMRAP) {
        const isTypeChange = row.setType !== SET_TYPE.AMRAP;
        return normalizeAmrapRow(next, { applyDefaults: isTypeChange });
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
