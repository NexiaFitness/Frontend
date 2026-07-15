/**
 * ExercisePrimeMoverBadges — hasta 3 chips de prime_mover (DC-11).
 */

import React from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { exercisePrimeMoverLabels } from "@/utils/exercises";
import { getGroupColor, getMuscleLabel } from "@/utils/exercises";

export interface ExercisePrimeMoverBadgesProps {
    exercise: Pick<Exercise, "muscles" | "musculatura_principal">;
    badgeClassName?: string;
    /** Si true, solo el primer chip lleva color de grupo (resto outline neutro). */
    accentFirstOnly?: boolean;
}

export const ExercisePrimeMoverBadges: React.FC<ExercisePrimeMoverBadgesProps> = ({
    exercise,
    badgeClassName,
    accentFirstOnly = false,
}) => {
    const labels = exercisePrimeMoverLabels(exercise);
    if (labels.length === 0) return null;

    return (
        <>
            {labels.map((label, index) => {
                const colors = getGroupColor(label);
                const isFirst = index === 0;
                const useAccent = !accentFirstOnly || isFirst;
                return (
                    <Badge
                        key={`${label}-${index}`}
                        variant="outline"
                        className={cn(
                            badgeClassName,
                            useAccent ? colors.bg : undefined,
                            useAccent ? colors.text : undefined
                        )}
                    >
                        {getMuscleLabel(label)}
                    </Badge>
                );
            })}
        </>
    );
};

export function exercisePrimeMoverAriaSuffix(
    exercise: Pick<Exercise, "muscles" | "musculatura_principal">
): string {
    return exercisePrimeMoverLabels(exercise).map(getMuscleLabel).join(", ");
}
