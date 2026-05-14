/**
 * RepsTiempoField.tsx — Input Reps o Tiempo según modo de fila.
 * Contexto: columnas de ejercicio en constructores card.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormCombobox } from "@/components/ui/forms";
import type { ConstructorExercise, RepsTipo } from "../../constructorTypes";

const REPS_TIPO_OPTIONS: { value: RepsTipo; label: string }[] = [
    { value: "reps", label: "Reps" },
    { value: "tiempo", label: "Tiempo" },
];

const INPUT_CLS =
    "flex h-8 w-[50px] shrink-0 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]";

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
    <div className="flex items-center gap-1 min-h-8">
        {showModeSelector ? (
            <FormCombobox
                size="sm"
                value={repsTipo}
                onChange={(v) => onRepsTipoChange(v as RepsTipo)}
                options={REPS_TIPO_OPTIONS}
                placeholder="Reps"
                aria-label="Modo Reps/Tiempo"
            />
        ) : (
            <span
                className="flex h-8 w-[58px] shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface px-2 text-[10px] text-muted-foreground"
                aria-hidden
            >
                {repsTipo === "tiempo" ? "Tiempo" : "Reps"}
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
                className={INPUT_CLS}
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
                className={INPUT_CLS}
            />
        )}
    </div>
);
