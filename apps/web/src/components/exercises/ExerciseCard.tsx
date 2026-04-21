/**
 * ExerciseCard.tsx — Card de ejercicio (biblioteca / picker)
 *
 * Layout alineado con spec Lovable: nombre, badges grupo/tipo, equipo · nivel, video opcional.
 * En modales legacy (picker) pasar className para fondo claro.
 */

import React from "react";
import { Play } from "lucide-react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
    getMuscleLabel,
    getLevelLabel,
    getGroupColor,
    normalizeLevel,
    getLevelTextClass,
    muscleFacetLabel,
    equipmentDisplayLine,
    tipoLabelFromBackend,
} from "@/utils/exercises";

export interface ExerciseCardProps {
    exercise: Exercise;
    videoUrl?: string | null;
    onSelect?: (exercise: Exercise) => void;
    className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    videoUrl = null,
    onSelect,
    className,
}) => {
    const muscleLabel = muscleFacetLabel(exercise);
    const colors = getGroupColor(muscleLabel || exercise.musculatura_principal || "");
    const levelNorm = normalizeLevel(exercise.nivel || "");
    const levelClass = getLevelTextClass(levelNorm);
    const tipoLabel = tipoLabelFromBackend(exercise.tipo || "");
    const equipLine = equipmentDisplayLine(exercise);
    const ariaLabel = `${exerciseDisplayName(exercise)} - ${getMuscleLabel(muscleLabel)}`;

    const handleClick = () => onSelect?.(exercise);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={!onSelect}
            aria-label={onSelect ? ariaLabel : undefined}
            className={cn(
                "flex flex-col rounded-lg bg-card p-5 text-left transition-all hover:bg-surface-2",
                colors.glow,
                onSelect ? "cursor-pointer" : "cursor-default",
                className
            )}
        >
            <h3 className="text-sm font-bold text-foreground line-clamp-2">{exerciseDisplayName(exercise)}</h3>

            <div className="mt-2 flex flex-wrap gap-1.5">
                {muscleLabel && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "border-0 px-1.5 py-0 text-[10px] font-medium leading-tight",
                            colors.bg,
                            colors.text
                        )}
                    >
                        {getMuscleLabel(muscleLabel)}
                    </Badge>
                )}
                <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">
                    {tipoLabel}
                </Badge>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                {equipLine ? (
                    <span>
                        {equipLine}
                        {" · "}
                    </span>
                ) : null}
                <span className={cn("font-medium", levelClass)}>{getLevelLabel(exercise.nivel || "")}</span>
            </p>

            {videoUrl ? (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                    <Play className="h-3 w-3 shrink-0" aria-hidden />
                    <span>Video disponible</span>
                </div>
            ) : null}
        </button>
    );
};
