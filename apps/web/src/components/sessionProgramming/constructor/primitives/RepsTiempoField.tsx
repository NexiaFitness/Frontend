/**
 * RepsTiempoField.tsx — Input Reps o Tiempo por ejercicio.
 * Contexto: columnas de ejercicio en constructores card.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormCombobox } from "@/components/ui/forms";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, RepsTipo } from "../../constructorTypes";
import {
    getExerciseRepsTipo,
    repsTipoExercisePatch,
} from "../utils/exerciseRepsMode";
import {
    CONSTRUCTOR_FIELD_PAIR_CLASS,
    CONSTRUCTOR_MINI_COMBO_CLASS,
    CONSTRUCTOR_MINI_INPUT_CLASS,
} from "./constructorCardStyles";

const REPS_TIPO_OPTIONS: { value: RepsTipo; label: string }[] = [
    { value: "reps", label: "Reps" },
    { value: "tiempo", label: "Seg" },
];

export interface RepsTiempoFieldProps {
    exercise: ConstructorExercise;
    /** Fallback de modo (single_set a nivel fila) */
    rowRepsTipo?: RepsTipo;
    /** Si se define, el combo cambia el modo de toda la fila (single_set) */
    onRowRepsTipoChange?: (mode: RepsTipo) => void;
    onExerciseChange: (updates: Partial<ConstructorExercise>) => void;
}

export const RepsTiempoField: React.FC<RepsTiempoFieldProps> = ({
    exercise,
    rowRepsTipo = "reps",
    onRowRepsTipoChange,
    onExerciseChange,
}) => {
    const repsTipo = onRowRepsTipoChange
        ? rowRepsTipo
        : getExerciseRepsTipo(exercise, rowRepsTipo);

    const handleRepsTipoChange = (mode: RepsTipo) => {
        if (onRowRepsTipoChange) {
            onRowRepsTipoChange(mode);
            return;
        }
        onExerciseChange(repsTipoExercisePatch(exercise, mode));
    };

    return (
        <div className={CONSTRUCTOR_FIELD_PAIR_CLASS}>
            <FormCombobox
                size="xs"
                value={repsTipo}
                onChange={(v) => handleRepsTipoChange(v as RepsTipo)}
                options={REPS_TIPO_OPTIONS}
                placeholder="Reps"
                aria-label="Modo Reps/Tiempo"
                className={CONSTRUCTOR_MINI_COMBO_CLASS}
            />
            {repsTipo === "reps" ? (
                <input
                    type="text"
                    value={exercise.plannedReps ?? ""}
                    onChange={(e) =>
                        onExerciseChange({
                            plannedReps: e.target.value || null,
                        })
                    }
                    placeholder="—"
                    className={CONSTRUCTOR_MINI_INPUT_CLASS}
                    aria-label="Repeticiones"
                />
            ) : (
                <InlineNumberInput
                    size="xs"
                    min={0}
                    value={exercise.plannedDuration ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        onExerciseChange({
                            plannedDuration: val ? Number(val) : null,
                        });
                    }}
                    placeholder="—"
                    className="w-[44px] shrink-0"
                    aria-label="Segundos"
                />
            )}
        </div>
    );
};
