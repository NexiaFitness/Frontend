/**
 * emomRow.ts — Estado y normalización de filas emom (ventanas V1…Vn con 1+ ejercicios).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    EmomWindow,
} from "../../constructorTypes";
import type { ApiExerciseLine } from "./singleSetRow";
import { isFilledConstructorExercise } from "./supersetRow";

export const MIN_EMOM_WINDOWS = 2;
export const DEFAULT_EMOM_WINDOWS = 2;
export const DEFAULT_EMOM_ROUNDS = 3;
export const DEFAULT_EMOM_INTERVAL_SECONDS = 60;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emomWindowLabel(index: number): string {
    return `V${index + 1}`;
}

export function createEmomExerciseSlot(windowIndex: number, windowId: string): ConstructorExercise {
    return {
        id: `ex-emom-${windowIndex + 1}-${windowId}-${generateId()}`,
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

export function createEmomWindow(windowIndex: number): EmomWindow {
    const id = `emom-win-${generateId()}`;
    return {
        id,
        exercises: [createEmomExerciseSlot(windowIndex, id)],
    };
}

function createInitialWindows(): EmomWindow[] {
    return Array.from({ length: DEFAULT_EMOM_WINDOWS }, (_, i) => createEmomWindow(i));
}

export function computeEmomTotalMinutes(row: ConstructorRow): number {
    const normalized = normalizeEmomRow(row);
    const windowCount = normalized.emomWindows?.length ?? DEFAULT_EMOM_WINDOWS;
    const intervalMin = (normalized.intervalSeconds ?? DEFAULT_EMOM_INTERVAL_SECONDS) / 60;
    const rounds = normalized.rounds ?? DEFAULT_EMOM_ROUNDS;
    return Math.round(windowCount * intervalMin * rounds);
}

export function normalizeEmomRow(row: ConstructorRow): ConstructorRow {
    if (row.setType !== SET_TYPE.EMOM) {
        return row;
    }

    let windows: EmomWindow[] =
        row.emomWindows?.length && row.emomWindows.length > 0
            ? row.emomWindows.map((w) => ({
                  ...w,
                  exercises: [...w.exercises],
              }))
            : [];

    if (windows.length === 0 && row.exercises.length > 0) {
        windows = row.exercises.map((ex, i) => ({
            id: `emom-win-${generateId()}`,
            exercises: [{ ...ex, id: ex.id || `ex-emom-legacy-${i}-${generateId()}` }],
        }));
    }

    if (windows.length === 0) {
        windows = createInitialWindows();
    }

    while (windows.length < MIN_EMOM_WINDOWS) {
        windows.push(createEmomWindow(windows.length));
    }

    windows = windows.map((window, index) => ({
        ...window,
        exercises:
            window.exercises.length > 0
                ? window.exercises
                : [createEmomExerciseSlot(index, window.id)],
    }));

    return {
        ...row,
        emomWindows: windows,
        exercises: [],
        rounds: row.rounds ?? DEFAULT_EMOM_ROUNDS,
        intervalSeconds: row.intervalSeconds ?? DEFAULT_EMOM_INTERVAL_SECONDS,
        timeCap: null,
        repsTipo: row.repsTipo ?? "reps",
    };
}

export function addEmomWindow(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeEmomRow(row);
    return normalizeEmomRow({
        ...normalized,
        emomWindows: [
            ...normalized.emomWindows!,
            createEmomWindow(normalized.emomWindows!.length),
        ],
    });
}

export function removeEmomWindow(row: ConstructorRow): ConstructorRow {
    const normalized = normalizeEmomRow(row);
    if ((normalized.emomWindows?.length ?? 0) <= MIN_EMOM_WINDOWS) {
        return normalized;
    }
    return normalizeEmomRow({
        ...normalized,
        emomWindows: normalized.emomWindows!.slice(0, -1),
    });
}

export function addEmomWindowExercise(
    row: ConstructorRow,
    windowId: string
): ConstructorRow {
    const normalized = normalizeEmomRow(row);
    const windows = normalized.emomWindows!.map((window, index) => {
        if (window.id !== windowId) return window;
        return {
            ...window,
            exercises: [
                ...window.exercises,
                createEmomExerciseSlot(index, window.id),
            ],
        };
    });
    return normalizeEmomRow({ ...normalized, emomWindows: windows });
}

export function removeEmomWindowLastExercise(
    row: ConstructorRow,
    windowId: string
): ConstructorRow {
    const normalized = normalizeEmomRow(row);
    const windows = normalized.emomWindows!.map((window) => {
        if (window.id !== windowId || window.exercises.length <= 1) {
            return window;
        }
        return {
            ...window,
            exercises: window.exercises.slice(0, -1),
        };
    });
    return normalizeEmomRow({ ...normalized, emomWindows: windows });
}

export function emomGroupLabels(rows: ConstructorRow[]): Map<string, string> {
    const map = new Map<string, string>();
    let index = 0;
    for (const row of rows) {
        if (row.setType !== SET_TYPE.EMOM) continue;
        const letter = String.fromCharCode(65 + (index % 26));
        map.set(row.id, `EMOM ${letter}`);
        index += 1;
    }
    return map;
}

export interface EmomApiExerciseLine extends ApiExerciseLine {
    superset_group_id?: number | null;
}

export function hydrateEmomConstructorRow(
    base: ConstructorRow,
    exs: EmomApiExerciseLine[]
): ConstructorRow {
    const sorted = [...exs].sort((a, b) => a.order_in_block - b.order_in_block);
    const hasWindowGroups = sorted.some(
        (ex) => ex.superset_group_id != null && ex.superset_group_id > 0
    );

    let windows: EmomWindow[];

    if (hasWindowGroups) {
        const byGroup = new Map<number, EmomApiExerciseLine[]>();
        for (const ex of sorted) {
            const group = ex.superset_group_id ?? 0;
            const list = byGroup.get(group) ?? [];
            list.push(ex);
            byGroup.set(group, list);
        }
        const groupKeys = [...byGroup.keys()].filter((k) => k > 0).sort((a, b) => a - b);
        windows = groupKeys.map((groupKey) => {
            const id = `emom-win-${generateId()}`;
            return {
                id,
                exercises: (byGroup.get(groupKey) ?? []).map((ex, j) => ({
                    id: `ex-emom-${ex.id}-${j}`,
                    serverExerciseId: ex.id,
                    exerciseId: ex.exercise_id,
                    exerciseName: `Ejercicio #${ex.exercise_id}`,
                    plannedReps: ex.planned_reps,
                    plannedWeight: ex.planned_weight,
                    plannedDuration: ex.planned_duration,
                    effortCharacter:
                        ex.effort_character as ConstructorExercise["effortCharacter"],
                    effortValue: ex.effort_value,
                    notes: ex.notes,
                    repsTipo: "reps" as const,
                })),
            };
        });
    } else {
        windows = sorted.map((ex, i) => {
            const id = `emom-win-${generateId()}`;
            return {
                id,
                exercises: [
                    {
                        id: `ex-emom-${ex.id}-${i}`,
                        serverExerciseId: ex.id,
                        exerciseId: ex.exercise_id,
                        exerciseName: `Ejercicio #${ex.exercise_id}`,
                        plannedReps: ex.planned_reps,
                        plannedWeight: ex.planned_weight,
                        plannedDuration: ex.planned_duration,
                        effortCharacter:
                            ex.effort_character as ConstructorExercise["effortCharacter"],
                        effortValue: ex.effort_value,
                        notes: ex.notes,
                        repsTipo: "reps" as const,
                    },
                ],
            };
        });
    }

    return normalizeEmomRow({
        ...base,
        emomWindows: windows,
        exercises: [],
    });
}

export function getEmomPersistLines(
    row: ConstructorRow
): Array<{
    orderInBlock: number;
    exercise: ConstructorExercise;
    serverExerciseId?: number;
    emomWindowIndex: number;
}> {
    const normalized = normalizeEmomRow(row);
    const lines: Array<{
        orderInBlock: number;
        exercise: ConstructorExercise;
        serverExerciseId?: number;
        emomWindowIndex: number;
    }> = [];
    let order = 1;
    normalized.emomWindows!.forEach((window, windowIndex) => {
        window.exercises
            .filter(isFilledConstructorExercise)
            .forEach((exercise) => {
                lines.push({
                    orderInBlock: order++,
                    exercise,
                    serverExerciseId: exercise.serverExerciseId,
                    emomWindowIndex: windowIndex + 1,
                });
            });
    });
    return lines;
}
