/**
 * AthleteDropsetFunnelCard.tsx — Embudo vertical dropset en fase doing (V05 B.2.1).
 * Un ejercicio, escalones MAIN→DROP, copy educativo. Sin logger — registro al terminar secuencia.
 */

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    ATHLETE_RUN_DROPSET_ACTION_HINT,
    ATHLETE_RUN_DROPSET_ARROW,
    ATHLETE_RUN_DROPSET_CONNECTOR,
    ATHLETE_RUN_DROPSET_DROP_RING,
    ATHLETE_RUN_DROPSET_EDU,
    ATHLETE_RUN_DROPSET_EDU_LINE,
    ATHLETE_RUN_DROPSET_EXERCISE_TITLE,
    ATHLETE_RUN_DROPSET_FUNNEL_CARD,
    ATHLETE_RUN_DROPSET_MAIN_RING,
    ATHLETE_RUN_DROPSET_STEP_CARD,
    ATHLETE_RUN_DROPSET_STEP_LABEL,
    ATHLETE_RUN_DROPSET_STEP_PRESCRIPTION,
    ATHLETE_RUN_TECHNIQUE_BTN,
    formatRunSetLabel,
} from "./athleteRunPresentation";
import {
    hasTechniqueSheetContent,
    resolveTechniqueActionLabel,
    type AthleteExerciseTechniqueTarget,
} from "./athleteExerciseTechniqueUtils";

export interface AthleteDropsetFunnelCardProps {
    slots: AthleteRunRoundSlot[];
    techniqueTarget?: AthleteExerciseTechniqueTarget | null;
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
    className?: string;
}

function dropRingLabel(slotLabel: string, index: number): React.ReactNode {
    if (index === 0) return "MAIN";
    const dropMatch = /^DROP (\d+)$/.exec(slotLabel);
    if (dropMatch) {
        return (
            <>
                <span className="text-[7px] font-semibold uppercase leading-none tracking-wide">
                    Drop
                </span>
                <span className="text-xs font-bold leading-none">{dropMatch[1]}</span>
            </>
        );
    }
    return slotLabel;
}

export const AthleteDropsetFunnelCard: React.FC<AthleteDropsetFunnelCardProps> = ({
    slots,
    techniqueTarget,
    onViewTechnique,
    className,
}) => {
    if (!slots.length) return null;

    const exerciseName = slots[0]?.exerciseName ?? "";
    const showTechnique =
        techniqueTarget &&
        onViewTechnique &&
        (hasTechniqueSheetContent(techniqueTarget) || techniqueTarget.exerciseId > 0);

    return (
        <div className={cn(ATHLETE_RUN_DROPSET_FUNNEL_CARD, className)}>
            <NexiaGlassAccentRim />

            <div className="relative z-[1] space-y-4">
                <div className={ATHLETE_RUN_DROPSET_EDU}>
                    <p className={ATHLETE_RUN_DROPSET_EDU_LINE}>
                        Dropset: serie casi al fallo, baja el peso un 15–25&nbsp;% y sigue sin
                        descansar.
                    </p>
                    <p className={ATHLETE_RUN_DROPSET_EDU_LINE}>
                        Cada bajada es una serie; todo junto cuenta como un dropset.
                    </p>
                </div>

                <div className="flex items-start justify-between gap-3">
                    <h2 className={ATHLETE_RUN_DROPSET_EXERCISE_TITLE}>{exerciseName}</h2>
                    {showTechnique && techniqueTarget ? (
                        <button
                            type="button"
                            className={cn(ATHLETE_RUN_TECHNIQUE_BTN, "shrink-0")}
                            onClick={() => onViewTechnique(techniqueTarget)}
                        >
                            {resolveTechniqueActionLabel(techniqueTarget)}
                        </button>
                    ) : null}
                </div>

                <ol
                    className="space-y-0"
                    aria-label={`Secuencia dropset de ${exerciseName}`}
                >
                    {slots.map((slot, index) => {
                        const isMain = index === 0;
                        const isLast = index === slots.length - 1;
                        const stepTitle = formatRunSetLabel(
                            slot.setLabel || slot.slotLabel
                        );

                        return (
                            <li key={slot.stepKey}>
                                <div className="grid grid-cols-[44px_1fr] gap-3">
                                    <div className="relative flex min-h-[3.25rem] justify-center">
                                        <span
                                            className={
                                                isMain
                                                    ? ATHLETE_RUN_DROPSET_MAIN_RING
                                                    : ATHLETE_RUN_DROPSET_DROP_RING
                                            }
                                        >
                                            {dropRingLabel(slot.slotLabel, index)}
                                        </span>
                                        {!isLast ? (
                                            <span
                                                className={ATHLETE_RUN_DROPSET_CONNECTOR}
                                                aria-hidden
                                            />
                                        ) : null}
                                    </div>

                                    <div className={ATHLETE_RUN_DROPSET_STEP_CARD}>
                                        <p className={ATHLETE_RUN_DROPSET_STEP_LABEL}>
                                            {stepTitle}
                                        </p>
                                        <p className={ATHLETE_RUN_DROPSET_STEP_PRESCRIPTION}>
                                            {slot.plannedLabel || "Según prescripción"}
                                        </p>
                                    </div>
                                </div>

                                {!isLast ? (
                                    <div className={ATHLETE_RUN_DROPSET_ARROW} aria-hidden>
                                        <ChevronDown className="size-4" strokeWidth={2.5} />
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ol>

                <p className={ATHLETE_RUN_DROPSET_ACTION_HINT}>
                    Completa la secuencia sin pausas. Registra al terminar la última bajada.
                </p>
            </div>
        </div>
    );
};
