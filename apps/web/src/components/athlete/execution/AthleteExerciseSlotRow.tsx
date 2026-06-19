/**
 * AthleteExerciseSlotRow.tsx — Fila ejercicio en card de ronda / single (V05 B.2+).
 */

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteRunGroupSlotStatus } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import {
    ATHLETE_RUN_SLOT_ROW,
    ATHLETE_RUN_SLOT_ROW_MUTED,
    ATHLETE_RUN_TECHNIQUE_BTN,
} from "./athleteRunPresentation";
import {
    hasTechniqueSheetContent,
    resolveTechniqueActionLabel,
    type AthleteExerciseTechniqueTarget,
} from "./athleteExerciseTechniqueUtils";

export interface AthleteExerciseSlotRowProps {
    slotLabel?: string;
    exerciseName: string;
    prescription: string;
    status?: AthleteRunGroupSlotStatus;
    muted?: boolean;
    techniqueTarget?: AthleteExerciseTechniqueTarget | null;
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
}

const SLOT_LABEL = cn(
    "flex size-7 shrink-0 items-center justify-center rounded-md",
    "bg-primary/20 text-[11px] font-semibold tabular-nums text-primary"
);

export const AthleteExerciseSlotRow: React.FC<AthleteExerciseSlotRowProps> = ({
    slotLabel,
    exerciseName,
    prescription,
    status = "upcoming",
    muted = false,
    techniqueTarget,
    onViewTechnique,
}) => {
    const showTechnique =
        techniqueTarget &&
        onViewTechnique &&
        (hasTechniqueSheetContent(techniqueTarget) || techniqueTarget.exerciseId > 0);

    return (
        <div
            className={cn(
                ATHLETE_RUN_SLOT_ROW,
                muted && ATHLETE_RUN_SLOT_ROW_MUTED,
                status === "done" && "border-primary/25 bg-primary/8 opacity-80"
            )}
        >
            {slotLabel ? (
                <span className={SLOT_LABEL}>
                    {status === "done" ? (
                        <Check className="size-3.5" aria-hidden />
                    ) : (
                        slotLabel
                    )}
                </span>
            ) : null}

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{exerciseName}</p>
                <p className="truncate text-xs text-muted-foreground/80">{prescription}</p>
            </div>

            {showTechnique && techniqueTarget ? (
                <button
                    type="button"
                    className={ATHLETE_RUN_TECHNIQUE_BTN}
                    onClick={() => onViewTechnique(techniqueTarget)}
                >
                    {resolveTechniqueActionLabel(techniqueTarget)}
                </button>
            ) : null}
        </div>
    );
};
