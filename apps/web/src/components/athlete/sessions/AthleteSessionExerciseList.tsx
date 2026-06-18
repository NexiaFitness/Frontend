/**
 * AthleteSessionExerciseList.tsx — Lista ejercicios premium en preview (V04).
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";
import {
    ATHLETE_SESSION_EXERCISE_ITEM,
    ATHLETE_SESSION_EXERCISE_ITEM_CAUTION,
    ATHLETE_SESSION_EXERCISE_NAME,
    ATHLETE_SESSION_EXERCISE_SETS,
    ATHLETE_SESSION_PREVIEW_BLOCK,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionBlockView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { getBlockDisplayName } from "@nexia/shared/sessionProgramming/sessionBlockView";
import { formatInjuryPrecautionCount } from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";

export interface AthleteSessionExerciseListProps {
    blocks: SessionBlockView[];
    conflictByExerciseId: Map<number, unknown>;
    conflictCount: number;
    showConflictSummary: boolean;
    mobileConflictSummary: string | null;
    hasDangerConflict: boolean;
    onConsult: () => void;
}

export const AthleteSessionExerciseList: React.FC<AthleteSessionExerciseListProps> = ({
    blocks,
    conflictByExerciseId,
    conflictCount,
    showConflictSummary,
    mobileConflictSummary,
    hasDangerConflict,
    onConsult,
}) => {
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
                            group.slots.map((slot) => {
                                const hasConflict = conflictByExerciseId.has(slot.exerciseId);
                                return (
                                    <li
                                        key={`${group.groupId}-${slot.slotLabel}`}
                                        className={
                                            hasConflict
                                                ? ATHLETE_SESSION_EXERCISE_ITEM_CAUTION
                                                : ATHLETE_SESSION_EXERCISE_ITEM
                                        }
                                    >
                                        {hasConflict && (
                                            <AlertTriangle
                                                className="size-4 shrink-0 text-warning"
                                                aria-label="Precaución por lesión activa"
                                            />
                                        )}
                                        <span className={ATHLETE_SESSION_EXERCISE_NAME}>
                                            {slot.exerciseName}
                                        </span>
                                        <span className={ATHLETE_SESSION_EXERCISE_SETS}>
                                            {slot.sets.length}{" "}
                                            {slot.sets.length === 1 ? "serie" : "series"}
                                        </span>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </section>
            ))}
        </div>
    );
};
