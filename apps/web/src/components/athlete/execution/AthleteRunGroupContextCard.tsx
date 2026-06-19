/**
 * AthleteRunGroupContextCard.tsx — Superset/giant/dropset: ejercicios de la ronda (V05).
 */

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import {
    ATHLETE_RUN_FIELD_HINT,
    ATHLETE_RUN_GROUP_SECTION_LABEL,
    ATHLETE_RUN_HINT_CARD,
} from "./athleteRunPresentation";

export interface AthleteRunGroupContextCardProps {
    context: AthleteRunGroupContextView;
    className?: string;
}

const SLOT_ROW = cn(
    "flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/12 px-3 py-2.5",
    "shadow-[0_0_16px_-6px] shadow-primary/35"
);

const SLOT_LABEL = cn(
    "flex size-7 shrink-0 items-center justify-center rounded-md",
    "bg-primary/20 text-[11px] font-semibold tabular-nums text-primary"
);

export const AthleteRunGroupContextCard: React.FC<AthleteRunGroupContextCardProps> = ({
    context,
    className,
}) => {
    return (
        <div className={cn("relative", ATHLETE_RUN_HINT_CARD, className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
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

                <p className={ATHLETE_RUN_FIELD_HINT}>{context.explanation}</p>

                <ul className="space-y-2" aria-label={`Ejercicios de ${context.sectionLabel}`}>
                    {context.slots.map((slot) => (
                        <li
                            key={`${slot.slotLabel}-${slot.exerciseName}`}
                            className={cn(
                                SLOT_ROW,
                                slot.status === "done" && "border-primary/25 bg-primary/8 opacity-80"
                            )}
                        >
                            <span className={SLOT_LABEL}>
                                {slot.status === "done" ? (
                                    <Check className="size-3.5" aria-hidden />
                                ) : (
                                    slot.slotLabel
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {slot.exerciseName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground/80">
                                    {slot.prescription}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
