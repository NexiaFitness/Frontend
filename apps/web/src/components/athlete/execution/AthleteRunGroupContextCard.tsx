/**
 * AthleteRunGroupContextCard.tsx — Superset/giant/dropset: ejercicios de la ronda (V05).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import { AthleteExerciseSlotRow } from "./AthleteExerciseSlotRow";
import type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";
import {
    ATHLETE_RUN_DOING_ENTER,
    ATHLETE_RUN_FIELD_HINT,
    ATHLETE_RUN_GROUP_SECTION_LABEL,
    ATHLETE_RUN_GROUP_SLOT_LIST,
    ATHLETE_RUN_GROUP_SLOT_LIST_SCROLL,
    ATHLETE_RUN_GROUP_SLOT_SCROLL_THRESHOLD,
    ATHLETE_RUN_HINT_CARD,
} from "./athleteRunPresentation";

export interface GroupContextSlotMeta {
    exerciseId: number;
    videoUrl?: string | null;
    instruction?: string | null;
}

export interface AthleteRunGroupContextCardProps {
    context: AthleteRunGroupContextView;
    slotMeta?: GroupContextSlotMeta[];
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
    /** Hero B.2 ya muestra badge + ronda — ocultar cabecera duplicada en card. */
    suppressHeaderMeta?: boolean;
    className?: string;
}

export const AthleteRunGroupContextCard: React.FC<AthleteRunGroupContextCardProps> = ({
    context,
    slotMeta,
    onViewTechnique,
    suppressHeaderMeta = false,
    className,
}) => {
    const slotListClass =
        context.slots.length > ATHLETE_RUN_GROUP_SLOT_SCROLL_THRESHOLD
            ? ATHLETE_RUN_GROUP_SLOT_LIST_SCROLL
            : ATHLETE_RUN_GROUP_SLOT_LIST;

    return (
        <div className={cn("relative", ATHLETE_RUN_HINT_CARD, ATHLETE_RUN_DOING_ENTER, className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                {!suppressHeaderMeta ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={ATHLETE_RUN_GROUP_SECTION_LABEL}>
                            {context.groupBadgeLabel ?? context.sectionLabel}
                        </p>
                        {context.roundLabel ? (
                            <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                {context.roundLabel}
                            </span>
                        ) : null}
                    </div>
                ) : null}

                {context.explanation ? (
                    <p className={ATHLETE_RUN_FIELD_HINT}>{context.explanation}</p>
                ) : null}

                <ul
                    className={slotListClass}
                    aria-label={`Ejercicios de ${context.sectionLabel}`}
                >
                    {context.slots.map((slot, index) => {
                        const meta = slotMeta?.[index];
                        const techniqueTarget: AthleteExerciseTechniqueTarget | undefined = meta
                            ? {
                                  exerciseId: meta.exerciseId,
                                  exerciseName: slot.exerciseName,
                                  videoUrl: meta.videoUrl,
                                  instruction: meta.instruction,
                              }
                            : undefined;

                        return (
                            <li key={`${slot.slotLabel}-${slot.exerciseName}-${index}`}>
                                <AthleteExerciseSlotRow
                                    slotLabel={slot.slotLabel}
                                    exerciseName={slot.exerciseName}
                                    prescription={slot.prescription}
                                    status={slot.status}
                                    techniqueTarget={techniqueTarget}
                                    onViewTechnique={onViewTechnique}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
