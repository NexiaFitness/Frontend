/**
 * Resuelve exerciseName en filas del constructor desde el catálogo (id → nombre).
 * Una sola función para hidratación y actualización de caché RTK.
 */

import type { ConstructorRow } from "../../constructorTypes";

export function applyConstructorExerciseCatalogNames(
    rows: ConstructorRow[],
    exerciseNameById: ReadonlyMap<number, string>,
): ConstructorRow[] {
    if (exerciseNameById.size === 0 || rows.length === 0) {
        return rows;
    }

    let changed = false;
    const next = rows.map((row) => ({
        ...row,
        exercises: row.exercises.map((exercise) => {
            if (!exercise.exerciseId) {
                return exercise;
            }
            const resolved = exerciseNameById.get(exercise.exerciseId);
            if (!resolved || exercise.exerciseName === resolved) {
                return exercise;
            }
            changed = true;
            return { ...exercise, exerciseName: resolved };
        }),
    }));

    return changed ? next : rows;
}
