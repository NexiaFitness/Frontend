/**
 * AthleteExercisePerformanceInfoButton — CTX-1 condicional (solo si hay contexto útil).
 */

import React from "react";
import { Info } from "lucide-react";
import { useGetAthleteExerciseLastPerformanceQuery } from "@nexia/shared/api/athleteApi";
import { hasUsefulAthleteLastPerformanceContext } from "@nexia/shared/utils/athlete/athleteLastPerformanceContext";
import { ATHLETE_EXERCISE_INFO_BUTTON } from "@/components/athlete/sessions/athleteSessionsPresentation";

export interface AthleteExercisePerformanceInfoButtonProps {
    exerciseId: number;
    exerciseTitle: string;
    onOpen: (id: number, title: string) => void;
}

export const AthleteExercisePerformanceInfoButton: React.FC<
    AthleteExercisePerformanceInfoButtonProps
> = ({ exerciseId, exerciseTitle, onOpen }) => {
    const { data, isFetching } = useGetAthleteExerciseLastPerformanceQuery(exerciseId);

    if (isFetching || !hasUsefulAthleteLastPerformanceContext(data)) {
        return null;
    }

    return (
        <button
            type="button"
            className={ATHLETE_EXERCISE_INFO_BUTTON}
            aria-label={`Tu rendimiento en ${exerciseTitle}`}
            onClick={() => onOpen(exerciseId, exerciseTitle)}
        >
            <Info className="size-4" aria-hidden />
        </button>
    );
};
