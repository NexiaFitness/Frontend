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

    return (
        <div className="flex items-center gap-1 min-h-8">
            <FormCombobox
                size="sm"
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
            />
            {caracterTipo === "rpe" ? (
                <InlineNumberInput
                    size="xs"
                    min={1}
                    max={10}
                    value={exercise.effortValue ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        onExerciseChange({
                            effortCharacter:
                                exercise.effortCharacter ??
                                getEffortCharacterForCaracterTipo("rpe"),
                            effortValue: val ? Number(val) : null,
                        });
                    }}
                    placeholder="1-10"
                    className="w-[50px] shrink-0"
                />
            ) : caracterTipo === "rir" ? (
                <InlineNumberInput
                    size="xs"
                    min={0}
                    max={5}
                    value={exercise.effortValue ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        onExerciseChange({
                            effortCharacter:
                                exercise.effortCharacter ??
                                getEffortCharacterForCaracterTipo("rir"),
                            effortValue: val ? Number(val) : null,
                        });
                    }}
                    placeholder="0-5"
                    className="w-[50px] shrink-0"
                />
            ) : (
                <InlineNumberInput
                    size="xs"
                    min={1}
                    max={100}
                    value={exercise.effortValue ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        onExerciseChange({
                            effortCharacter:
                                exercise.effortCharacter ??
                                getEffortCharacterForCaracterTipo("pct_rm"),
                            effortValue: val ? Number(val) : null,
                        });
                    }}
                    placeholder="0-100"
                    className="w-[50px] shrink-0"
                />
            )}
        </div>
    );
};
