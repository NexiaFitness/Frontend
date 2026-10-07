/**
 * AthleteSessionExerciseList.tsx — Lista ejercicios preview FE-1 (reps/kg/RIR/notas).
 *
 * Presentacional: filas de `buildAthletePreviewGroupRows`. Notas plegadas.
 */

import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { AthleteExercisePerformanceInfoSheet } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoSheet";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";
import {
    ATHLETE_SESSION_EXERCISE_DETAIL,
    ATHLETE_SESSION_EXERCISE_ITEM,
    ATHLETE_SESSION_EXERCISE_ITEM_CAUTION,
    ATHLETE_SESSION_EXERCISE_NAME,
    ATHLETE_SESSION_EXERCISE_NOTES_BODY,
    ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE,
    ATHLETE_SESSION_EXERCISE_SECONDARY,
    ATHLETE_EXERCISE_INFO_BUTTON,
    ATHLETE_SESSION_PREVIEW_BLOCK,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionBlockView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { getBlockDisplayName } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { buildAthletePreviewGroupRows } from "@nexia/shared/utils/athlete/athleteSessionPreviewUtils";
import { formatInjuryPrecautionCount } from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";

export interface AthleteSessionExerciseListProps {
    blocks: SessionBlockView[];
    conflictByExerciseId: Map<number, unknown>;
    conflictCount: number;
    showConflictSummary: boolean;
    mobileConflictSummary: string | null;
    hasDangerConflict: boolean;
    onConsult: () => void;
}

const AthletePreviewNotes: React.FC<{ notes: string }> = ({ notes }) => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                type="button"
                className={ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="inline-flex items-center gap-1">
                    {open ? "Ocultar nota" : "Ver nota del entrenador"}
                    {open ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                    ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                    )}
                </span>
            </button>
            {open ? <p className={ATHLETE_SESSION_EXERCISE_NOTES_BODY}>{notes}</p> : null}
        </div>
    );
};

export const AthleteSessionExerciseList: React.FC<AthleteSessionExerciseListProps> = ({
    blocks,
    conflictByExerciseId,
    conflictCount,
    showConflictSummary,
    mobileConflictSummary,
    hasDangerConflict,
    onConsult,
}) => {
    const [infoExercise, setInfoExercise] = useState<{
        id: number;
        title: string;
    } | null>(null);

    return (
        <div className="space-y-3">
            {blocks.map((block, blockIndex) => (
                <section key={block.blockId} className={ATHLETE_SESSION_PREVIEW_BLOCK}>
                    {blockIndex === 0 && <NexiaGlassAccentRim />}

                    <div className="relative flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                            {getBlockDisplayName(block.blockTypeName)}
                        </p>
                        {blockIndex === 0 && showConflictSummary && conflictCount > 0 && (
                            <span className="text-caption font-medium text-warning">
                                {formatInjuryPrecautionCount(conflictCount)}
                            </span>
                        )}
                    </div>

                    {blockIndex === 0 && showConflictSummary && mobileConflictSummary && (
                        <AthleteInjuryCallout
                            message={mobileConflictSummary}
                            isDanger={hasDangerConflict}
                            onConsult={onConsult}
                        />
                    )}

                    <ul className="relative space-y-2">
                        {block.groups.flatMap((group) =>
                            buildAthletePreviewGroupRows(group).map((row) => {
                                const hasConflict = row.exerciseIds.some((id) =>
                                    conflictByExerciseId.has(id)
                                );
                                const infoExerciseId =
                                    row.exerciseIds.length === 1 ? row.exerciseIds[0] : null;

                                return (
                                    <li
                                        key={row.key}
                                        className={
                                            hasConflict
                                                ? ATHLETE_SESSION_EXERCISE_ITEM_CAUTION
                                                : ATHLETE_SESSION_EXERCISE_ITEM
                                        }
                                    >
                                        {hasConflict && (
                                            <AlertTriangle
                                                className="mt-0.5 size-4 shrink-0 text-warning"
                                                aria-label="Precaución por lesión activa"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={
                                                    row.hasCompoundLayout
                                                        ? "block text-xs font-semibold uppercase tracking-wide text-primary/85"
                                                        : ATHLETE_SESSION_EXERCISE_NAME
                                                }
                                            >
                                                {row.title}
                                            </span>
                                            <p className={ATHLETE_SESSION_EXERCISE_DETAIL}>
                                                {row.detail}
                                            </p>
                                            {row.secondaryDetail ? (
                                                <p className={ATHLETE_SESSION_EXERCISE_SECONDARY}>
                                                    {row.secondaryDetail}
                                                </p>
                                            ) : null}
                                            {hasHumanTrainerNote(row.notes) ? (
                                                <AthletePreviewNotes
                                                    notes={formatTrainerNoteForAthlete(row.notes!)}
                                                />
                                            ) : null}
                                        </div>
                                        {infoExerciseId != null ? (
                                            <button
                                                type="button"
                                                className={ATHLETE_EXERCISE_INFO_BUTTON}
                                                aria-label={`Información de rendimiento: ${row.title}`}
                                                onClick={() =>
                                                    setInfoExercise({
                                                        id: infoExerciseId,
                                                        title: row.title,
                                                    })
                                                }
                                            >
                                                <Info className="size-4" aria-hidden />
                                            </button>
                                        ) : null}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </section>
            ))}
            <AthleteExercisePerformanceInfoSheet
                isOpen={infoExercise != null}
                exerciseId={infoExercise?.id ?? null}
                exerciseTitle={infoExercise?.title ?? ""}
                onClose={() => setInfoExercise(null)}
            />
        </div>
    );
};
