/**
 * AthleteProgressTopExercisesSection.tsx — Top ejercicios con progreso de carga.
 */

import React from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { ATHLETE_SETTINGS_CARD } from "@/components/athlete/account/athleteSettingsPresentation";
import { cn } from "@/lib/utils";
import { ATHLETE_PROGRESS_LIST_ROW } from "./athleteProgressViewPresentation";

export interface AthleteProgressTopExercisesSectionProps {
    rows: TopExerciseRow[];
    onSelectExercise: (row: TopExerciseRow) => void;
}

export const AthleteProgressTopExercisesSection: React.FC<
    AthleteProgressTopExercisesSectionProps
> = ({ rows, onSelectExercise }) => {
    if (rows.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Top ejercicios">
            <AthleteSectionHeading
                title="Progreso por ejercicio"
                icon={<TrendingUp className="size-3.5" aria-hidden />}
            />
            <div className={cn(ATHLETE_SETTINGS_CARD, "relative overflow-hidden")}>
                <NexiaGlassAccentRim />
                <ul className="relative divide-y divide-border/60">
                    {rows.map((row) => (
                        <li key={row.exerciseId}>
                            <button
                                type="button"
                                className={ATHLETE_PROGRESS_LIST_ROW}
                                onClick={() => onSelectExercise(row)}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-foreground">
                                        {row.exerciseName}
                                    </p>
                                    <p className="text-caption text-muted-foreground">
                                        {row.latestWeight != null
                                            ? `${row.latestWeight} kg`
                                            : "Sin carga registrada"}
                                        {row.weightDelta != null && (
                                            <span
                                                className={
                                                    row.weightDelta >= 0
                                                        ? " text-success"
                                                        : " text-warning"
                                                }
                                            >
                                                {" "}
                                                ({row.weightDelta >= 0 ? "+" : ""}
                                                {row.weightDelta} kg · 30d)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <ChevronRight
                                    className="size-5 shrink-0 text-primary/55"
                                    aria-hidden
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
