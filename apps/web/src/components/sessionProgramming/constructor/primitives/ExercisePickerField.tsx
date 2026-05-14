/**
 * ExercisePickerField.tsx — Campo de selección de ejercicio (abre picker externo).
 * Contexto: SupersetBlock y futuros constructores por tipo.
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
    className?: string;
}

export const ExercisePickerField: React.FC<ExercisePickerFieldProps> = ({
    exerciseName,
    onPick,
    onClear,
    className,
}) => {
    const filled = exerciseName.trim().length > 0;

    return (
        <button
            type="button"
            onClick={onPick}
            className={cn(
                "flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-border/60 bg-surface px-2.5 text-left text-xs transition-colors",
                "hover:border-primary/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                filled ? "text-foreground" : "text-muted-foreground",
                className
            )}
        >
            <Search className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="flex-1 truncate">{filled ? exerciseName : "Buscar ejercicio…"}</span>
            {filled && onClear ? (
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
            ) : null}
        </button>
    );
};
