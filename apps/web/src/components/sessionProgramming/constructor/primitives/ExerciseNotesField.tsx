/**
 * ExerciseNotesField.tsx — Nota del entrenador por ejercicio (constructor).
 *
 * Persiste en SessionBlockExercise.notes → preview atleta plegada.
 */

import React from "react";
import {
    CONSTRUCTOR_EXERCISE_NOTE_INPUT,
    CONSTRUCTOR_EXERCISE_NOTE_LABEL,
} from "../../constructorExerciseNotesPresentation";

export interface ExerciseNotesFieldProps {
    exerciseId: string;
    exerciseName: string;
    notes: string | null;
    onNotesChange: (notes: string | null) => void;
}

export const ExerciseNotesField: React.FC<ExerciseNotesFieldProps> = ({
    exerciseId,
    exerciseName,
    notes,
    onNotesChange,
}) => {
    const fieldId = `constructor-note-${exerciseId}`;
    return (
        <div className="col-span-full mt-1 min-w-0">
            <label className={CONSTRUCTOR_EXERCISE_NOTE_LABEL} htmlFor={fieldId}>
                Nota del entrenador para {exerciseName || "ejercicio"}
            </label>
            <input
                id={fieldId}
                type="text"
                value={notes ?? ""}
                onChange={(e) =>
                    onNotesChange(e.target.value.length > 0 ? e.target.value : null)
                }
                placeholder="Nota para el atleta (opcional)"
                className={CONSTRUCTOR_EXERCISE_NOTE_INPUT}
                autoComplete="off"
            />
        </div>
    );
};
