/**
 * exercisePicker.ts — Aplicar selección del picker a filas del constructor.
 * Contexto: CreateSession y EditSession; soporta slot fijo (superset) o append legacy.
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import { normalizeSingleSetRow } from "./singleSetRow";

function generateExerciseId(): string {
    return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function applyExercisePickerSelection(
    rows: ConstructorRow[],
    rowId: string,
    exercise: { id: number; name: string },
    exerciseSlotId?: string | null
): ConstructorRow[] {
    return rows.map((row) => {
        if (row.id !== rowId) return row;

        const exercisePatch: ConstructorExercise = {
            id: exerciseSlotId ?? generateExerciseId(),
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            plannedReps: "10",
            plannedWeight: null,
            plannedDuration: null,
            effortCharacter: null,
            effortValue: null,
            notes: null,
        };

        if (exerciseSlotId) {
            return {
                ...row,
                exercises: row.exercises.map((ex) =>
                    ex.id === exerciseSlotId
                        ? {
                              ...ex,
                              exerciseId: exercise.id,
                              exerciseName: exercise.name,
                          }
                        : ex
                ),
            };
        }

        if (row.setType === SET_TYPE.SINGLE_SET) {
            const slotId = `ex-single-${generateExerciseId()}`;
            return normalizeSingleSetRow({
                ...row,
                exercises: [
                    {
                        id: slotId,
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        plannedReps: "10",
                        plannedWeight: null,
                        plannedDuration: null,
                        effortCharacter: null,
                        effortValue: null,
                        notes: null,
                    },
                ],
            });
        }

        return {
            ...row,
            exercises: [...row.exercises, { ...exercisePatch, id: generateExerciseId() }],
        };
    });
}
