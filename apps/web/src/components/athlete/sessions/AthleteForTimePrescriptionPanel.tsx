/**
 * AthleteForTimePrescriptionPanel — Mapa FOR TIME (V04 premium).
 */

import React from "react";
import { AthletePrescriptionTimedExerciseRow } from "@/components/athlete/sessions/AthletePrescriptionTimedExerciseRow";
import {
    ATHLETE_SESSION_AMRAP_KIND_LABEL,
    ATHLETE_SESSION_EMOM_INTERVAL_HEAD,
    ATHLETE_SESSION_EMOM_META,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionExerciseGroupView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { buildAthleteForTimePrescriptionView } from "@nexia/shared/utils/athlete/athleteForTimePrescriptionView";

function slotForExercise(
    group: SessionExerciseGroupView,
    exerciseId: number
): SessionExerciseGroupView["slots"][number] | undefined {
    return group.slots.find((s) => s.exerciseId === exerciseId);
}

export interface AthleteForTimePrescriptionPanelProps {
    group: SessionExerciseGroupView;
    conflictByExerciseId: Map<number, unknown>;
    onInfo: (id: number, title: string) => void;
}

export const AthleteForTimePrescriptionPanel: React.FC<AthleteForTimePrescriptionPanelProps> = ({
    group,
    conflictByExerciseId,
    onInfo,
}) => {
    const view = buildAthleteForTimePrescriptionView(group);

    const renderExerciseList = (
        exercises: Array<{ exerciseId: number; name: string; displayLine: string }>
    ) => (
        <ul className="mt-1 space-y-0">
            {exercises.map((exercise) => {
                const slot = slotForExercise(group, exercise.exerciseId);
                if (!slot) return null;
                return (
                    <AthletePrescriptionTimedExerciseRow
                        key={exercise.exerciseId}
                        kind="for_time"
                        group={group}
                        slot={slot}
                        exerciseId={exercise.exerciseId}
                        name={exercise.name}
                        displayLine={exercise.displayLine}
                        hasConflict={conflictByExerciseId.has(exercise.exerciseId)}
                        onInfo={onInfo}
                    />
                );
            })}
        </ul>
    );

    return (
        <div className="space-y-1">
            <p className={ATHLETE_SESSION_AMRAP_KIND_LABEL}>{view.headerTitle}</p>
            {view.timeCapLabel ? (
                <p className={ATHLETE_SESSION_EMOM_META}>
                    Límite de tiempo (Time Cap): {view.timeCapLabel}
                </p>
            ) : null}
            <p className={ATHLETE_SESSION_EMOM_META}>Objetivo: {view.objectiveLine}</p>

            {view.variesByRound ? (
                <div className="space-y-3 pt-1">
                    {view.roundGroups.map((roundGroup) => (
                        <div key={roundGroup.key}>
                            <p className={ATHLETE_SESSION_EMOM_INTERVAL_HEAD}>
                                {roundGroup.roundLabel}
                            </p>
                            {renderExerciseList(roundGroup.exercises)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="pt-1">
                    {view.uniformRepeatsLabel ? (
                        <p className={ATHLETE_SESSION_EMOM_INTERVAL_HEAD}>
                            {view.uniformRepeatsLabel}
                        </p>
                    ) : null}
                    {renderExerciseList(view.flatExercises)}
                </div>
            )}
        </div>
    );
};
