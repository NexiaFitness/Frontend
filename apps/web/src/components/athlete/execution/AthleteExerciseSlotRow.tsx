/**
 * AthleteExerciseSlotRow.tsx — Fila ejercicio en card de ronda (V05 B.2+).
 * Corto: layout original (nombre · fila 2 prescripción). Largo: 2 líneas con rx al final de la 2.ª.
 */

import React, { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteRunGroupSlotStatus } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { useAthleteSlotNameFitsOneLine } from "@/hooks/athlete/useAthleteSlotNameFitsOneLine";
import {
    ATHLETE_RUN_SLOT_ROW,
    ATHLETE_RUN_SLOT_ROW_CONTENT,
    ATHLETE_RUN_SLOT_ROW_MUTED,
    ATHLETE_RUN_SLOT_ROW_NAME_COMPACT,
    ATHLETE_RUN_SLOT_ROW_NAME_WRAPPED,
    ATHLETE_RUN_SLOT_ROW_RX_INLINE,
    ATHLETE_RUN_SLOT_ROW_RX_STACKED,
    ATHLETE_RUN_SLOT_ROW_TECHNIQUE,
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
    const contentRef = useRef<HTMLDivElement>(null);
    const isDesktop = useIsAthleteDesktopLayout();
    const fitsOneLine = useAthleteSlotNameFitsOneLine(exerciseName, contentRef, !isDesktop);
    const useCompactLayout = isDesktop || fitsOneLine;

    const showTechnique =
        techniqueTarget &&
        onViewTechnique &&
        (hasTechniqueSheetContent(techniqueTarget) || techniqueTarget.exerciseId > 0);

    const techniqueLabel = showTechnique && techniqueTarget
        ? resolveTechniqueActionLabel(techniqueTarget)
        : null;

    const handleViewTechnique = () => {
        if (techniqueTarget && onViewTechnique) {
            onViewTechnique(techniqueTarget);
        }
    };

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

            <div ref={contentRef} className={ATHLETE_RUN_SLOT_ROW_CONTENT}>
                {useCompactLayout ? (
                    <>
                        <p className={ATHLETE_RUN_SLOT_ROW_NAME_COMPACT}>{exerciseName}</p>
                        <p className={ATHLETE_RUN_SLOT_ROW_RX_STACKED}>{prescription}</p>
                    </>
                ) : (
                    <p className={ATHLETE_RUN_SLOT_ROW_NAME_WRAPPED}>
                        <span className="font-medium">{exerciseName}</span>
                        <span className={ATHLETE_RUN_SLOT_ROW_RX_INLINE}>
                            {" · "}
                            {prescription}
                        </span>
                    </p>
                )}
            </div>

            {showTechnique && techniqueLabel ? (
                <button
                    type="button"
                    className={ATHLETE_RUN_SLOT_ROW_TECHNIQUE}
                    onClick={handleViewTechnique}
                >
                    {techniqueLabel}
                </button>
            ) : null}
        </div>
    );
};
