/**
 * ExercisePickerField.tsx — Campo de ejercicio con punto de estado (Lovable).
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExercisePickerFieldProps {
    exerciseName: string;
    onPick: () => void;
    onClear?: () => void;
    /** Mismo aspecto que picker relleno pero sin interacción (filas DROP del dropset). */
    readOnly?: boolean;
    className?: string;
}

export const ExercisePickerField: React.FC<ExercisePickerFieldProps> = ({
    exerciseName,
    onPick,
    onClear,
    readOnly = false,
    className,
}) => {
    const filled = exerciseName.trim().length > 0;

    const content = (
        <>
            {filled ? (
                <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]"
                    aria-hidden
                />
            ) : (
                <Search className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
            )}
            <span className="flex-1 truncate">{filled ? exerciseName : "Buscar ejercicio…"}</span>
            {filled && onClear && !readOnly ? (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onClear();
                        }
                    }}
                    className="shrink-0 text-[10px] text-muted-foreground hover:text-destructive"
                >
                    Quitar
                </span>
            ) : (
                <span className="invisible shrink-0 text-[10px]" aria-hidden>
                    Quitar
                </span>
            )}
        </>
    );

    const fieldClass = cn(
        "flex h-8 w-full min-w-0 items-center gap-2 rounded-md border bg-surface px-2.5 text-left text-xs",
        filled
            ? "border-emerald-500/35 text-foreground"
            : "border-border/60 text-muted-foreground",
        !readOnly &&
            "transition-colors hover:border-primary/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]",
        readOnly && "cursor-default opacity-95",
        className
    );

    if (readOnly) {
        return (
            <div className={fieldClass} aria-label={filled ? exerciseName : undefined}>
                {content}
            </div>
        );
    }

    return (
        <button type="button" onClick={onPick} className={fieldClass}>
            {content}
        </button>
    );
};
