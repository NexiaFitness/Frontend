/**
 * PostSessionExercisesPanel.tsx — Lista de ejercicios y bloques timed post-sesión.
 * Contexto: V06 resumen atleta. B-26: timed muestra resultado + objetivo (sin % series).
 * @author Frontend Team
 * @since v6.1.0
 * @updated v6.1.6 — timed_blocks opción C
 */

import React from "react";
import { Dumbbell, Timer } from "lucide-react";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import type {
    PostSessionExerciseReport,
    PostSessionTimedBlockReport,
} from "@nexia/shared/types/trainingSessions";
import {
    POST_SESSION_EXERCISES_LIST,
} from "./postSessionPresentation";

export interface PostSessionExercisesPanelProps {
    exercises: PostSessionExerciseReport[];
    timedBlocks?: PostSessionTimedBlockReport[];
}

export const PostSessionExercisesPanel: React.FC<PostSessionExercisesPanelProps> = ({
    exercises,
    timedBlocks = [],
}) => {
    if (exercises.length === 0 && timedBlocks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-5">
            {timedBlocks.length > 0 ? (
                <div className="space-y-3">
                    <AthleteSectionHeading
                        title="Bloques por tiempo"
                        icon={
                            <Timer
                                className="size-4 text-primary/80"
                                aria-hidden
                            />
                        }
                    />
                    <ul
                        className={`divide-y divide-border/50 ${POST_SESSION_EXERCISES_LIST}`}
                    >
                        {timedBlocks.map((block) => (
                            <li
                                key={block.session_block_id}
                                className="space-y-1 px-4 py-3.5 text-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-medium text-foreground">
                                        {block.mode_label}
                                    </span>
                                    <span className="shrink-0 text-right tabular-nums text-foreground">
                                        {block.result_label}
                                    </span>
                                </div>
                                {block.objective_label ? (
                                    <p className="text-xs text-muted-foreground">
                                        {block.objective_label}
                                    </p>
                                ) : null}
                                {block.exercise_names.length > 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        {block.exercise_names.join(" · ")}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {exercises.length > 0 ? (
                <div className="space-y-3">
                    <AthleteSectionHeading
                        title="Ejercicios"
                        icon={
                            <Dumbbell
                                className="size-4 text-primary/80"
                                aria-hidden
                            />
                        }
                    />
                    <ul
                        className={`divide-y divide-border/50 ${POST_SESSION_EXERCISES_LIST}`}
                    >
                        {exercises.map((ex) => (
                            <li
                                key={ex.block_exercise_id}
                                className="flex items-center justify-between px-4 py-3.5 text-sm"
                            >
                                <span className="font-medium text-foreground">
                                    {ex.exercise_name}
                                </span>
                                <span className="tabular-nums text-muted-foreground">
                                    {ex.actual_sets}/{ex.planned_sets} series
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
};
