/**
 * Toggle + tabla «Ver series» / «Ver escalones» (mapa V04 fuerza).
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AthletePrescriptionExpandTable } from "@/components/athlete/sessions/AthletePrescriptionExpandTable";
import {
    ATHLETE_SESSION_EXERCISE_NOTES_BODY,
    ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE_PROMINENT,
    ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL,
    ATHLETE_SESSION_SERIES_TOGGLE,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionGroupKind } from "@nexia/shared/sessionProgramming/sessionBlockView";
import type { AthletePreviewSetLine } from "@nexia/shared/utils/athlete/athleteSessionPreviewUtils";
import { strengthPrescriptionToggleLabels } from "@nexia/shared/utils/athlete/athleteStrengthPrescriptionPresentation";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import { cn } from "@/lib/utils";

export const AthletePrescriptionSeriesToggle: React.FC<{
    lines: AthletePreviewSetLine[];
    groupKind: SessionGroupKind;
}> = ({ lines, groupKind }) => {
    const [seriesOpen, setSeriesOpen] = useState(false);
    if (lines.length === 0) return null;
    const first = lines[0];
    const hasVariableReps = lines.some((line) => line.reps !== first.reps);
    const hasAdditionalData = lines.some(
        (line) => line.load || line.effort || line.rest || line.extras
    );
    if (!hasVariableReps && !hasAdditionalData && lines.length <= 1) return null;
    const toggle = strengthPrescriptionToggleLabels(groupKind);
    const tableRows = lines.map((line) => ({
        rowKey: line.label,
        rowLabel: line.displayLabel ?? line.label,
        reps: line.reps,
        load: line.load,
        effort: line.effort,
        rest: line.rest,
    }));

    return (
        <>
            <button
                type="button"
                className={ATHLETE_SESSION_SERIES_TOGGLE}
                aria-expanded={seriesOpen}
                onClick={() => setSeriesOpen((v) => !v)}
            >
                {seriesOpen ? toggle.hide : toggle.show}
            </button>
            {seriesOpen ? (
                <div className={ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL}>
                    <AthletePrescriptionExpandTable
                        rowColumnLabel={toggle.rowColumn}
                        rows={tableRows}
                    />
                    {lines.some((l) => l.extras) ? (
                        <p className="mt-2 text-xs leading-snug text-muted-foreground">
                            {lines
                                .filter((l) => l.extras)
                                .map((l) => `${l.displayLabel ?? l.label}: ${l.extras}`)
                                .join(" · ")}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </>
    );
};

const ExerciseTrainerNotes: React.FC<{ notes: string }> = ({ notes }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="w-full">
            <button
                type="button"
                className={ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE_PROMINENT}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? "Ocultar nota" : "Ver nota del entrenador"}
                {open ? (
                    <ChevronUp className="size-4 shrink-0" aria-hidden />
                ) : (
                    <ChevronDown className="size-4 shrink-0" aria-hidden />
                )}
            </button>
            {open ? (
                <p className={cn(ATHLETE_SESSION_EXERCISE_NOTES_BODY, "text-center")}>{notes}</p>
            ) : null}
        </div>
    );
};

export const AthletePrescriptionTrainerNotes: React.FC<{ notes: string | null | undefined }> = ({
    notes,
}) => {
    if (!hasHumanTrainerNote(notes)) return null;
    return <ExerciseTrainerNotes notes={formatTrainerNoteForAthlete(notes!)} />;
};
