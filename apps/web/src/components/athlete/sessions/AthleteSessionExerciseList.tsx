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
import { buildAthletePreviewGroupRows } from "@nexia/shared/utils/athlete/athleteSessionPreviewUtils";
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
                            buildAthletePreviewGroupRows(group).map((row) => {
                                const hasConflict = row.exerciseIds.some((id) =>
                                    conflictByExerciseId.has(id)
                                );
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
                                                className="size-4 shrink-0 text-warning"
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
                                            <span
                                                className={
                                                    row.hasCompoundLayout
                                                        ? "mt-0.5 block text-sm text-muted-foreground"
                                                        : ATHLETE_SESSION_EXERCISE_SETS
                                                }
                                            >
                                                {row.detail}
                                            </span>
                                        </div>
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
