/**
 * AthleteRunExerciseNoteField.tsx — Nota opcional para el entrenador (D6).
 *
 * Propósito: textarea acordeón en run/log; no bloquea confirmación.
 * Contexto: ExerciseStepView, TimedBlockStepView, log sheet.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ATHLETE_EXERCISE_NOTE_MAX_LENGTH } from "@nexia/shared/utils/athlete/athleteExerciseNoteUtils";

export interface AthleteRunExerciseNoteFieldProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export const AthleteRunExerciseNoteField: React.FC<AthleteRunExerciseNoteFieldProps> = ({
    value,
    onChange,
    disabled = false,
    className,
}) => {
    const [open, setOpen] = useState(value.trim().length > 0);
    const textareaId = useId();

    return (
        <div className={cn("mt-3", className)}>
            <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-primary"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                disabled={disabled}
            >
                Añadir nota para tu entrenador
                <ChevronDown
                    className={cn("size-4 transition-transform", open && "rotate-180")}
                    aria-hidden
                />
            </button>
            {open ? (
                <div className="mt-2 space-y-1">
                    <label htmlFor={textareaId} className="sr-only">
                        Nota para tu entrenador
                    </label>
                    <textarea
                        id={textareaId}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        maxLength={ATHLETE_EXERCISE_NOTE_MAX_LENGTH}
                        rows={3}
                        placeholder="Opcional — cómo te has sentido, molestias, contexto…"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {value.length}/{ATHLETE_EXERCISE_NOTE_MAX_LENGTH}
                    </p>
                </div>
            ) : null}
        </div>
    );
};
