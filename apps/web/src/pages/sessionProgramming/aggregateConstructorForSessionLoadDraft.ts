/**
 * Aplana el constructor a líneas { exercise_id, planned_sets } para POST validate-draft.
 * Misma regla que al persistir: cada ejercicio en un bloque recibe `row.sets` como planned_sets.
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { SessionLoadDraftExerciseIn } from "@nexia/shared/types/sessionLoad";

export function aggregateConstructorRowsForSessionLoadDraft(
    rows: ConstructorRow[]
): SessionLoadDraftExerciseIn[] {
    const byExercise = new Map<number, number>();
    for (const row of rows) {
        const sets = row.sets ?? 0;
        for (const ex of row.exercises) {
            const id = ex.exerciseId;
            if (!id || id <= 0) continue;
            byExercise.set(id, (byExercise.get(id) ?? 0) + sets);
        }
    }
    return [...byExercise.entries()].map(([exercise_id, planned_sets]) => ({
        exercise_id,
        planned_sets,
    }));
}
