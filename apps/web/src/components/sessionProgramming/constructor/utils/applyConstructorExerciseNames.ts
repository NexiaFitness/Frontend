/**
 * Resuelve exerciseName en filas del constructor desde el catálogo (id → nombre).
 * Una sola función para hidratación y actualización de caché RTK.
 * Incluye `emomWindows`: el EMOM no guarda líneas en `row.exercises`.
 */

import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";

function resolveExerciseNames(
    exercises: ConstructorExercise[],
    exerciseNameById: ReadonlyMap<number, string>,
): { next: ConstructorExercise[]; changed: boolean } {
    let changed = false;
    const next = exercises.map((exercise) => {
        if (!exercise.exerciseId) {
            return exercise;
        }
        const resolved = exerciseNameById.get(exercise.exerciseId);
        if (!resolved || exercise.exerciseName === resolved) {
            return exercise;
        }
        changed = true;
        return { ...exercise, exerciseName: resolved };
    });
    return { next, changed };
}

export function applyConstructorExerciseCatalogNames(
    rows: ConstructorRow[],
    exerciseNameById: ReadonlyMap<number, string>,
): ConstructorRow[] {
    if (exerciseNameById.size === 0 || rows.length === 0) {
        return rows;
    }

    let changed = false;
    const next = rows.map((row) => {
        const exercisesResolved = resolveExerciseNames(row.exercises, exerciseNameById);
        let emomWindows = row.emomWindows;

        if (row.emomWindows && row.emomWindows.length > 0) {
            let windowsChanged = false;
            const windows = row.emomWindows.map((window) => {
                const windowResolved = resolveExerciseNames(window.exercises, exerciseNameById);
                if (!windowResolved.changed) {
                    return window;
                }
                windowsChanged = true;
                return { ...window, exercises: windowResolved.next };
            });
            if (windowsChanged) {
                emomWindows = windows;
            }
        }

        if (!exercisesResolved.changed && emomWindows === row.emomWindows) {
            return row;
        }

        changed = true;
        return {
            ...row,
            exercises: exercisesResolved.next,
            emomWindows,
        };
    });

    return changed ? next : rows;
}
