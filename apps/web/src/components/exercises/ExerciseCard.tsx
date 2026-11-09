/**
 * ExerciseCard.tsx — Card de ejercicio (biblioteca / picker)
 *
 * Layout: nombre, badges grupo/tipo, equipo · nivel. Sin aviso de vídeo: solo lo alimentaba el
 * alta local de la biblioteca, retirada en H8-B.
 * appearance="plain" para picker modal legacy; "premium" (default) glass biblioteca.
 */

import React from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    EXERCISES_LIBRARY_CARD,
    EXERCISES_LIBRARY_CARD_BADGE_ROW,
    EXERCISES_LIBRARY_CARD_META,
    EXERCISES_LIBRARY_CARD_MUSCLE_BADGE,
    EXERCISES_LIBRARY_CARD_PLAIN,
    EXERCISES_LIBRARY_CARD_TITLE,
    EXERCISES_LIBRARY_CARD_TYPE_BADGE,
    EXERCISES_LIBRARY_CARD_COMPLEX_TYPE_BADGE,
} from "./exercisesLibraryPresentation";
import {
    ExercisePrimeMoverBadges,
} from "./ExercisePrimeMoverBadges";
import {
    getLevelLabel,
    getGroupColor,
    normalizeLevel,
    getLevelTextClass,
    equipmentDisplayLine,
    tipoLabelFromBackend,
    isComplexExerciseTipo,
    exercisePrimeMoverAriaSuffix,
} from "@/utils/exercises";

export interface ExerciseCardProps {
    exercise: Exercise;
    onSelect?: (exercise: Exercise) => void;
    className?: string;
    appearance?: "premium" | "plain";
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    onSelect,
    className,
    appearance = "premium",
}) => {
    const primaryMuscleForGlow = exercisePrimeMoverAriaSuffix(exercise).split(",")[0]?.trim() || "";
    const colors = getGroupColor(primaryMuscleForGlow || exercise.musculatura_principal || "");
    const levelNorm = normalizeLevel(exercise.nivel || "");
    const levelClass = getLevelTextClass(levelNorm);
    const tipoLabel = tipoLabelFromBackend(exercise.tipo || "");
    const tipoBadgeClass = isComplexExerciseTipo(exercise.tipo || "")
        ? EXERCISES_LIBRARY_CARD_COMPLEX_TYPE_BADGE
        : EXERCISES_LIBRARY_CARD_TYPE_BADGE;
    const equipLine = equipmentDisplayLine(exercise);
    const muscleAria = exercisePrimeMoverAriaSuffix(exercise);
    const ariaLabel = `${exerciseDisplayName(exercise)}${muscleAria ? ` - ${muscleAria}` : ""}`;
    const isPremium = appearance === "premium";

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
                isPremium ? EXERCISES_LIBRARY_CARD : EXERCISES_LIBRARY_CARD_PLAIN,
                colors.glow,
                onSelect ? "cursor-pointer" : "cursor-default",
                "relative",
                className
            )}
        >
            {isPremium && <NexiaGlassAccentRim />}
            <h3 className={EXERCISES_LIBRARY_CARD_TITLE}>{exerciseDisplayName(exercise)}</h3>

            <div className={cn(EXERCISES_LIBRARY_CARD_BADGE_ROW, "flex-wrap")}>
                <ExercisePrimeMoverBadges
                    exercise={exercise}
                    badgeClassName={EXERCISES_LIBRARY_CARD_MUSCLE_BADGE}
                />
                <Badge variant="outline" className={tipoBadgeClass}>
                    {tipoLabel}
                </Badge>
            </div>

            <p className={EXERCISES_LIBRARY_CARD_META}>
                {equipLine ? (
                    <span>
                        {equipLine}
                        {" · "}
                    </span>
                ) : null}
                <span className={cn("font-medium", levelClass)}>{getLevelLabel(exercise.nivel || "")}</span>
            </p>
        </button>
    );
};
