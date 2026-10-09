/**
 * AthleteEmomPrescriptionPanel — Mapa EMOM por intervalos (V04 premium).
 */

import React from "react";
import { AthletePrescriptionTimedExerciseRow } from "@/components/athlete/sessions/AthletePrescriptionTimedExerciseRow";
import {
    ATHLETE_SESSION_EMOM_INTERVAL_HEAD,
    ATHLETE_SESSION_EMOM_KIND_LABEL,
    ATHLETE_SESSION_EMOM_META,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionExerciseGroupView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    buildAthleteEmomPrescriptionView,
    formatAthletePrescriptionExerciseLine,
} from "@nexia/shared/utils/athlete/athleteEmomPrescriptionView";

export interface AthleteEmomPrescriptionPanelProps {
    group: SessionExerciseGroupView;
    conflictByExerciseId: Map<number, unknown>;
    onInfo: (id: number, title: string) => void;
}

export const AthleteEmomPrescriptionPanel: React.FC<AthleteEmomPrescriptionPanelProps> = ({
    group,
    conflictByExerciseId,
    onInfo,
}) => {
    const view = buildAthleteEmomPrescriptionView(group);

    const metaParts: string[] = [];
    if (view.totalDurationLabel) {
        metaParts.push(`Duración total: ${view.totalDurationLabel}`);
    }
    if (view.intervalCadenceLabel) {
        metaParts.push(`Intervalo: ${view.intervalCadenceLabel}`);
    }

    return (
        <div className="space-y-1">
            <p className={ATHLETE_SESSION_EMOM_KIND_LABEL}>{view.headerTitle}</p>
            {metaParts.length > 0 ? (
                <p className={ATHLETE_SESSION_EMOM_META}>{metaParts.join(" | ")}</p>
            ) : null}
            <p className={ATHLETE_SESSION_EMOM_META}>
                Total de intervalos: {view.totalIntervals}
            </p>

            <div className="space-y-3 pt-1">
                {view.intervalGroups.map((intervalGroup) => (
                    <div key={intervalGroup.key}>
                        <p className={ATHLETE_SESSION_EMOM_INTERVAL_HEAD}>
                            {intervalGroup.intervalLabel}
                        </p>
                        <ul className="mt-1 space-y-0">
                            {intervalGroup.exercises.map((exercise) => {
                                const slot = group.slots.find(
                                    (s) => s.exerciseId === exercise.exerciseId
                                );
                                if (!slot) return null;
                                const line = formatAthletePrescriptionExerciseLine(
                                    exercise.name,
                                    slot.sets[0],
                                    { plannedDistanceMeters: slot.plannedDistance }
                                );
                                return (
                                    <AthletePrescriptionTimedExerciseRow
                                        key={`${intervalGroup.key}-${exercise.exerciseId}`}
                                        kind="emom"
                                        group={group}
                                        slot={slot}
                                        exerciseId={exercise.exerciseId}
                                        name={exercise.name}
                                        displayLine={line}
                                        hasConflict={conflictByExerciseId.has(exercise.exerciseId)}
                                        onInfo={onInfo}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
