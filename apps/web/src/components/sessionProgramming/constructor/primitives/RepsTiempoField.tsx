/**
 * RepsTiempoField.tsx — Input Reps o Tiempo según modo de fila.
 * Contexto: columnas de ejercicio en constructores card.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormCombobox } from "@/components/ui/forms";
import type { ConstructorExercise, RepsTipo } from "../../constructorTypes";
import {
    CONSTRUCTOR_MINI_COMBO_CLASS,
    CONSTRUCTOR_MINI_INPUT_CLASS,
} from "./constructorCardStyles";

const REPS_TIPO_OPTIONS: { value: RepsTipo; label: string }[] = [
    { value: "reps", label: "Reps" },
    { value: "tiempo", label: "Seg" },
];

export interface RepsTiempoFieldProps {
    repsTipo: RepsTipo;
    exercise: ConstructorExercise;
    showModeSelector: boolean;
    onRepsTipoChange: (mode: RepsTipo) => void;
    onExerciseChange: (updates: Partial<ConstructorExercise>) => void;
}

export const RepsTiempoField: React.FC<RepsTiempoFieldProps> = ({
    repsTipo,
    exercise,
    showModeSelector,
    onRepsTipoChange,
    onExerciseChange,
}) => (
    <div className="flex h-8 items-center gap-1">
        {showModeSelector ? (
            <FormCombobox
                size="xs"
                value={repsTipo}
                onChange={(v) => onRepsTipoChange(v as RepsTipo)}
                options={REPS_TIPO_OPTIONS}
                placeholder="Reps"
                aria-label="Modo Reps/Tiempo"
                className={CONSTRUCTOR_MINI_COMBO_CLASS}
            />
        ) : (
            <span
                className={`${CONSTRUCTOR_MINI_INPUT_CLASS} flex items-center justify-center text-muted-foreground`}
                aria-hidden
            >
                {repsTipo === "tiempo" ? "Seg" : "Reps"}
            </span>
        )}
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
            <input
                type="text"
                value={
                    exercise.plannedDuration != null
                        ? exercise.plannedDuration >= 60
                            ? `${Math.floor(exercise.plannedDuration / 60)}:${(exercise.plannedDuration % 60).toString().padStart(2, "0")}`
                            : String(exercise.plannedDuration)
                        : ""
                }
                onChange={(e) => {
                    const v = e.target.value.trim();
                    if (!v) {
                        onExerciseChange({ plannedDuration: null });
                        return;
                    }
                    if (v.includes(":")) {
                        const [m, s] = v.split(":").map(Number);
                        const total = !Number.isNaN(m) && !Number.isNaN(s) ? m * 60 + s : null;
                        onExerciseChange({ plannedDuration: total });
                    } else {
                        const parsed = parseInt(v, 10);
                        onExerciseChange({
                            plannedDuration: Number.isNaN(parsed) ? null : parsed,
                        });
                    }
                }}
                placeholder="—"
                className={CONSTRUCTOR_MINI_INPUT_CLASS}
                aria-label="Duración"
            />
        )}
    </div>
);
