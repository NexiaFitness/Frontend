/**
 * ValidatedExercisePickerField — ExercisePickerField con ancla de validación submit.
 */

import React from "react";
import { ConstructorFieldAnchor, useConstructorFieldValidation } from "./ConstructorFieldAnchor";
import { ExercisePickerField } from "./ExercisePickerField";

export interface ValidatedExercisePickerFieldProps {
    rowId: string;
    exerciseSlotId: string;
    exerciseName: string;
    onPick: () => void;
    onClear?: () => void;
    readOnly?: boolean;
    className?: string;
}

export function ValidatedExercisePickerField({
    rowId,
    exerciseSlotId,
    exerciseName,
    onPick,
    onClear,
    readOnly = false,
    className,
}: ValidatedExercisePickerFieldProps): React.ReactElement {
    const exerciseValidation = useConstructorFieldValidation(rowId, "exercise", exerciseSlotId);

    return (
        <ConstructorFieldAnchor rowId={rowId} field="exercise" exerciseSlotId={exerciseSlotId}>
            <ExercisePickerField
                exerciseName={exerciseName}
                readOnly={readOnly}
                hasError={Boolean(exerciseValidation.error)}
                className={className}
                onPick={() => {
                    exerciseValidation.clearOnEdit();
                    onPick();
                }}
                onClear={
                    onClear
                        ? () => {
                              exerciseValidation.clearOnEdit();
                              onClear();
                          }
                        : undefined
                }
            />
        </ConstructorFieldAnchor>
    );
}
