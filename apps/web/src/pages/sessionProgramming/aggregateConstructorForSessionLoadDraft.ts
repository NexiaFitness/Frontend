/**
 * Aplana el constructor a líneas { exercise_id, planned_sets } para POST validate-draft.
 * single_set: N series de un movimiento (setData.length), no row.sets × ejercicios.
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { SessionLoadDraftExerciseIn } from "@nexia/shared/types/sessionLoad";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import { normalizeSingleSetRow } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { normalizeDropsetRow } from "@/components/sessionProgramming/constructor/utils/dropsetRow";
import { isFilledConstructorExercise } from "@/components/sessionProgramming/constructor/utils/supersetRow";

export function aggregateConstructorRowsForSessionLoadDraft(
    rows: ConstructorRow[]
): SessionLoadDraftExerciseIn[] {
    const byExercise = new Map<number, number>();
    for (const row of rows) {
        if (row.setType === SET_TYPE.SINGLE_SET) {
            const normalized = normalizeSingleSetRow(row);
            const exercise = normalized.exercises.find(isFilledConstructorExercise);
            if (!exercise) continue;
            const seriesCount = row.setData?.length
                ? normalized.setData!.length
                : (normalized.sets ?? 0);
            byExercise.set(
                exercise.exerciseId,
                (byExercise.get(exercise.exerciseId) ?? 0) + seriesCount
            );
            continue;
        }

        if (row.setType === SET_TYPE.DROPSET) {
            const normalized = normalizeDropsetRow(row);
            const exercise = normalized.exercises.find(isFilledConstructorExercise);
            if (!exercise) continue;
            const seriesCount = normalized.setData?.length ?? (normalized.sets ?? 0) + 1;
            byExercise.set(
                exercise.exerciseId,
                (byExercise.get(exercise.exerciseId) ?? 0) + seriesCount
            );
            continue;
        }

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
