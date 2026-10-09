/**
 * AthleteAmrapPrescriptionPanel — Mapa AMRAP / time cap (V04 premium).
 */

import React from "react";
import {
    ATHLETE_SESSION_AMRAP_KIND_LABEL,
    ATHLETE_SESSION_EMOM_META,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import { AthletePrescriptionTimedExerciseRow } from "@/components/athlete/sessions/AthletePrescriptionTimedExerciseRow";
import type { SessionExerciseGroupView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { buildAthleteAmrapPrescriptionView } from "@nexia/shared/utils/athlete/athleteAmrapPrescriptionView";

export interface AthleteAmrapPrescriptionPanelProps {
    group: SessionExerciseGroupView;
    conflictByExerciseId: Map<number, unknown>;
    onInfo: (id: number, title: string) => void;
}

export const AthleteAmrapPrescriptionPanel: React.FC<AthleteAmrapPrescriptionPanelProps> = ({
    group,
    conflictByExerciseId,
    onInfo,
}) => {
    const view = buildAthleteAmrapPrescriptionView(group);

    return (
        <div className="space-y-1">
            <p className={ATHLETE_SESSION_AMRAP_KIND_LABEL}>{view.headerTitle}</p>
            {view.totalDurationLabel ? (
                <p className={ATHLETE_SESSION_EMOM_META}>
                    Duración total: {view.totalDurationLabel}
                </p>
            ) : null}
            <p className={ATHLETE_SESSION_EMOM_META}>Objetivo: {view.objectiveLine}</p>
            {view.targetRoundsLabel ? (
                <p className={ATHLETE_SESSION_EMOM_META}>{view.targetRoundsLabel}</p>
            ) : null}

            <div className="pt-1">
                <ul className="mt-2.5 space-y-0">
                    {view.exercises.map((exercise) => {
                        const slot = group.slots.find((s) => s.exerciseId === exercise.exerciseId);
                        if (!slot) return null;
                        return (
                            <AthletePrescriptionTimedExerciseRow
                                key={exercise.exerciseId}
                                kind="amrap"
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
            </div>
        </div>
    );
};
