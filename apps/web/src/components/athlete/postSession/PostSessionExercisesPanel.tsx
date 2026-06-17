/**
 * PostSessionExercisesPanel.tsx — Lista de ejercicios post-sesión.
 */

import React from "react";
import { Dumbbell } from "lucide-react";
import type { PostSessionExerciseReport } from "@nexia/shared/types/trainingSessions";

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
            <div className="flex items-center gap-2">
                <Dumbbell className="size-4 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Ejercicios
                </h2>
            </div>
            <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border/80 bg-card/40">
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
