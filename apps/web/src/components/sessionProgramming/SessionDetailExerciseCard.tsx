/**
 * SessionDetailExerciseCard — Tarjeta de ejercicio en detalle de sesión (training).
 * Rejilla 2×N de series, densidad según número de series, cabecera reutilizable.
 */

import React from "react";
import { Clock } from "lucide-react";
import type { SessionExerciseDisplay } from "@nexia/shared/hooks/sessionProgramming";
import { cn } from "@/lib/utils";
import { SessionExerciseOrderHeader } from "./SessionExerciseOrderHeader";

export interface SessionDetailExerciseCardProps {
    exercise: SessionExerciseDisplay;
}

export const SessionDetailExerciseCard: React.FC<SessionDetailExerciseCardProps> = ({ exercise }) => {
    const sets = Math.max(1, exercise.plannedSets ?? 1);
    const rawReps = exercise.plannedReps;
    const hasCommaList = typeof rawReps === "string" && rawReps.includes(",");
    const repsToShow = hasCommaList
        ? rawReps
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .slice(0, sets)
        : Array.from({ length: sets }, () => String(rawReps ?? 0));
    const normalizedRepsToShow =
        repsToShow.length === sets
            ? repsToShow
            : [
                  ...repsToShow,
                  ...Array.from({ length: sets - repsToShow.length }, () => String(rawReps ?? 0)),
              ];
    const distinctRepValues = new Set(normalizedRepsToShow.map((r) => r.trim()));
    const repSchemeLabel = distinctRepValues.size <= 1 ? "UNIFORMES" : "PROGRESIVAS";

    const density = sets >= 10 ? "compact" : sets >= 7 ? "medium" : "comfortable";
    const seriesGridGap =
        density === "compact" ? "gap-1.5" : density === "medium" ? "gap-2" : "gap-2.5";
    const cellMinH =
        density === "compact"
            ? "min-h-[2.75rem]"
            : density === "medium"
              ? "min-h-[3.5rem]"
              : "min-h-[4.25rem]";
    const cellPadY =
        density === "compact" ? "py-1.5" : density === "medium" ? "py-2" : "py-2.5";
    const repFont =
        density === "compact" ? "text-sm" : density === "medium" ? "text-base" : "text-lg";
    const setLabelClass =
        density === "compact" ? "text-[8px]" : density === "medium" ? "text-[9px]" : "text-[10px]";
    const repsUnitClass =
        density === "compact" ? "text-[8px]" : "text-[9px]";

    return (
        <div
            className={cn(
                "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl",
                "border border-primary/35 bg-[hsl(218_42%_12%)]",
                "shadow-sm transition-all duration-150",
                "hover:border-primary/55 hover:shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
            )}
        >
            <SessionExerciseOrderHeader
                order={exercise.order}
                title={exercise.exerciseName}
                className="items-start pt-4"
                titleClassName="text-white"
                trailing={
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                        <span className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-primary/75">
                            <Clock className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                            <span>{exercise.plannedRest ?? 0}s</span>
                        </span>
                        <span className="max-w-[11rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-primary/60">
                            descanso entre series
                        </span>
                    </div>
                }
            />
            <div className="px-4 pb-3 pt-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/55">
                    {sets} series · {repSchemeLabel}
                </span>
            </div>
            <div className="border-t border-primary/25 px-4 py-3">
                <div className={cn("grid grid-cols-2", seriesGridGap)}>
                    {normalizedRepsToShow.map((reps, i) => (
                        <div
                            key={`${exercise.id}-set-${i + 1}`}
                            className={cn(
                                "flex min-w-0 flex-col items-center justify-center rounded-lg",
                                "border border-primary/20 bg-background",
                                cellMinH,
                                cellPadY,
                                "px-0.5",
                                density === "compact" ? "gap-0" : "gap-0.5"
                            )}
                        >
                            <span
                                className={cn(
                                    "font-semibold uppercase tracking-wide text-primary/65",
                                    setLabelClass
                                )}
                            >
                                S{i + 1}
                            </span>
                            <span
                                className={cn(
                                    "font-bold tabular-nums text-foreground leading-none",
                                    "truncate max-w-full",
                                    repFont
                                )}
                            >
                                {reps}
                            </span>
                            <span className={cn("text-primary/55", repsUnitClass)}>reps</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
