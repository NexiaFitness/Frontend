/**
 * Fila de ejercicio en mapas EMOM / AMRAP / FOR TIME: línea compacta + prescripción + nota.
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { AthleteExercisePerformanceInfoButton } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoButton";
import { AthletePrescriptionTimedDetail } from "@/components/athlete/sessions/AthletePrescriptionTimedDetail";
import { AthletePrescriptionTrainerNotes } from "@/components/athlete/sessions/AthletePrescriptionSetLinesTable";
import {
    ATHLETE_SESSION_EMOM_EXERCISE_LINE,
    ATHLETE_SESSION_EXERCISE_ACTIONS_DIVIDER,
    ATHLETE_SESSION_EXERCISE_ROW_BODY,
    ATHLETE_SESSION_EXERCISE_ROW_EXPAND,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION,
    ATHLETE_SESSION_EXERCISE_ROW_HEAD,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import type { SessionExerciseSlotView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import type { AthleteTimedPrescriptionKind } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import { buildAthleteTimedPrescriptionExpandView } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import { hasHumanTrainerNote } from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import type { SessionExerciseGroupView } from "@nexia/shared/sessionProgramming/sessionBlockView";

export interface AthletePrescriptionTimedExerciseRowProps {
    kind: AthleteTimedPrescriptionKind;
    group: SessionExerciseGroupView;
    slot: SessionExerciseSlotView;
    exerciseId: number;
    name: string;
    displayLine: string;
    hasConflict: boolean;
    onInfo: (id: number, title: string) => void;
}

export const AthletePrescriptionTimedExerciseRow: React.FC<
    AthletePrescriptionTimedExerciseRowProps
> = ({ kind, group, slot, exerciseId, name, displayLine, hasConflict, onInfo }) => {
    const expand = buildAthleteTimedPrescriptionExpandView({
        kind,
        group,
        slot,
        displayLine,
    });
    const showTrainerNote = hasHumanTrainerNote(slot.notes);

    return (
        <li
            className={
                hasConflict ? ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION : ATHLETE_SESSION_EXERCISE_ROW_FLAT
            }
        >
            {hasConflict ? (
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-label="Precaución por lesión activa"
                />
            ) : (
                <span className="size-4 shrink-0" aria-hidden />
            )}
            <div className={ATHLETE_SESSION_EXERCISE_ROW_BODY}>
                <div className={ATHLETE_SESSION_EXERCISE_ROW_HEAD}>
                    <span className={`block min-w-0 flex-1 ${ATHLETE_SESSION_EMOM_EXERCISE_LINE}`}>
                        {displayLine}
                    </span>
                    <AthleteExercisePerformanceInfoButton
                        exerciseId={exerciseId}
                        exerciseTitle={name}
                        onOpen={onInfo}
                    />
                </div>
                <div className={ATHLETE_SESSION_EXERCISE_ROW_EXPAND}>
                    <AthletePrescriptionTimedDetail expand={expand} />
                    {showTrainerNote ? (
                        <>
                            <NexiaPremiumDivider
                                tone="glow"
                                className={ATHLETE_SESSION_EXERCISE_ACTIONS_DIVIDER}
                            />
                            <AthletePrescriptionTrainerNotes notes={slot.notes} />
                        </>
                    ) : null}
                </div>
            </div>
        </li>
    );
};
