/**
 * Aplana el constructor a líneas { exercise_id, planned_sets } para POST validate-draft.
 * Usa getConstructorPersistLines (misma fuente que persistencia) + volumeEquivalentSets.
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { SessionLoadDraftExerciseIn } from "@nexia/shared/types/sessionLoad";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { getPersistLinePlannedSets, getRowVolumeSetsPerExercise } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";

export function aggregateConstructorRowsForSessionLoadDraft(
    rows: ConstructorRow[]
): SessionLoadDraftExerciseIn[] {
    const byExercise = new Map<number, number>();

    for (const row of rows) {
        if (getRowVolumeSetsPerExercise(row) <= 0) {
            continue;
        }

        const persistLines = getConstructorPersistLines(row);
        if (persistLines.length === 0) {
            continue;
        }

        for (const line of persistLines) {
            const id = line.exercise.exerciseId;
            if (!id || id <= 0) {
                continue;
            }
            const planned = getPersistLinePlannedSets(row, line);
            if (planned <= 0) {
                continue;
            }
            byExercise.set(id, (byExercise.get(id) ?? 0) + planned);
        }
    }

    return [...byExercise.entries()].map(([exercise_id, planned_sets]) => ({
        exercise_id,
        planned_sets,
    }));
}
