/**
 * PostSessionExercisesPanel.tsx — Lista de ejercicios post-sesión.
 */

import React from "react";
import { Dumbbell } from "lucide-react";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import type { PostSessionExerciseReport } from "@nexia/shared/types/trainingSessions";
import {
    POST_SESSION_EXERCISES_LIST,
} from "./postSessionPresentation";

export interface PostSessionExercisesPanelProps {
    exercises: PostSessionExerciseReport[];
}

export const PostSessionExercisesPanel: React.FC<PostSessionExercisesPanelProps> = ({
    exercises,
}) => {
    if (exercises.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <AthleteSectionHeading
                title="Ejercicios"
                icon={<Dumbbell className="size-4 text-primary/80" aria-hidden />}
            />
            <ul className={`divide-y divide-border/50 ${POST_SESSION_EXERCISES_LIST}`}>
                {exercises.map((ex) => (
                    <li
                        key={ex.block_exercise_id}
                        className="flex items-center justify-between px-4 py-3.5 text-sm"
                    >
                        <span className="font-medium text-foreground">{ex.exercise_name}</span>
                        <span className="tabular-nums text-muted-foreground">
                            {ex.actual_sets}/{ex.planned_sets} series
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
