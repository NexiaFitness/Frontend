/**
 * CaracterField.tsx — Selector RPE / RIR / %RM con valor numérico.
 * Contexto: columna Carácter en constructores card.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormCombobox } from "@/components/ui/forms";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import {
    getCaracterTipoFromEffortCharacter,
    getEffortCharacterForCaracterTipo,
    type CaracterTipo,
} from "@nexia/shared/utils/sessionProgramming";
import { EFFORT_CHARACTER } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorExercise } from "../../constructorTypes";
import {
    CONSTRUCTOR_FIELD_PAIR_CLASS,
    CONSTRUCTOR_MINI_COMBO_CLASS,
} from "./constructorCardStyles";

const CARACTER_TIPO_OPTIONS: { value: CaracterTipo; label: string }[] = [
    { value: "rpe", label: "RPE" },
    { value: "rir", label: "RIR" },
    { value: "pct_rm", label: "%RM" },
];

export interface CaracterFieldProps {
    exercise: ConstructorExercise;
    onExerciseChange: (updates: Partial<ConstructorExercise>) => void;
}

export const CaracterField: React.FC<CaracterFieldProps> = ({
    exercise,
    onExerciseChange,
}) => {
    const caracterTipo = getCaracterTipoFromEffortCharacter(exercise.effortCharacter);

    const handleValueChange = (raw: string, tipo: CaracterTipo) => {
        onExerciseChange({
            effortCharacter:
                exercise.effortCharacter ?? getEffortCharacterForCaracterTipo(tipo),
            effortValue: raw ? Number(raw) : null,
        });
    };

    const max =
        caracterTipo === "rpe" ? 10 : caracterTipo === "rir" ? 5 : 100;
    const min = caracterTipo === "rir" ? 0 : 1;
    const placeholder =
        caracterTipo === "rpe" ? "1-10" : caracterTipo === "rir" ? "0-5" : "0-100";

    const inputWidthClass =
        caracterTipo === "pct_rm" ? "w-16 shrink-0" : "w-[3.25rem] shrink-0";

    return (
        <div className={CONSTRUCTOR_FIELD_PAIR_CLASS}>
            <FormCombobox
                size="xs"
                value={caracterTipo}
                onChange={(v) => {
                    const val = v as CaracterTipo;
                    if (val === "rpe") {
                        onExerciseChange({
                            effortCharacter: EFFORT_CHARACTER.RPE,
                            effortValue: exercise.effortValue,
                            notes: null,
                        });
                    } else if (val === "rir") {
                        onExerciseChange({
                            effortCharacter: EFFORT_CHARACTER.RIR,
                            effortValue: exercise.effortValue,
                            notes: null,
                        });
                    } else {
                        onExerciseChange({
                            effortCharacter: EFFORT_CHARACTER.PCT_RM,
                            effortValue: exercise.effortValue,
                            notes: null,
                        });
                    }
                }}
                options={CARACTER_TIPO_OPTIONS}
                placeholder="RPE"
                aria-label="Carácter"
                className={CONSTRUCTOR_MINI_COMBO_CLASS}
            />
            <InlineNumberInput
                size="xs"
                min={min}
                max={max}
                value={exercise.effortValue ?? ""}
                onChange={(e) => handleValueChange(e.target.value, caracterTipo)}
                placeholder={placeholder}
                className={inputWidthClass}
                aria-label="Valor de carácter"
            />
        </div>
    );
};
