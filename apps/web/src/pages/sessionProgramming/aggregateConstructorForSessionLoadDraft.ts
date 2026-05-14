/**
 * Aplana el constructor a líneas { exercise_id, planned_sets } para POST validate-draft.
 * Usa volumeEquivalentSets (contrato único con persistencia).
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { SessionLoadDraftExerciseIn } from "@nexia/shared/types/sessionLoad";
import { getRowVolumeSetsPerExercise } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";
import { isFilledConstructorExercise } from "@/components/sessionProgramming/constructor/utils/supersetRow";

export function aggregateConstructorRowsForSessionLoadDraft(
    rows: ConstructorRow[]
): SessionLoadDraftExerciseIn[] {
    const byExercise = new Map<number, number>();
    for (const row of rows) {
        const setsPerExercise = getRowVolumeSetsPerExercise(row);
        if (setsPerExercise <= 0) continue;

        for (const ex of row.exercises) {
            const id = ex.exerciseId;
            if (!id || id <= 0 || !isFilledConstructorExercise(ex)) continue;
            byExercise.set(id, (byExercise.get(id) ?? 0) + setsPerExercise);
        }
    }
    return [...byExercise.entries()].map(([exercise_id, planned_sets]) => ({
        exercise_id,
        planned_sets,
    }));
}
