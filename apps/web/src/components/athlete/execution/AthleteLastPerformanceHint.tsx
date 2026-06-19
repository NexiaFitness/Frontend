/**
 * AthleteLastPerformanceHint.tsx — Hint "Última vez" premium (F3c-FE-01).
 */

import React from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_RUN_HINT_APPLY_BTN,
    ATHLETE_RUN_HINT_VALUE,
    ATHLETE_RUN_LOGGER_SECTION_LABEL,
    formatRunLastPerformanceLine,
} from "./athleteRunPresentation";

export interface AthleteLastPerformanceHintProps {
    weightKg: number;
    reps: number | null;
    rpe: number | null;
    performedAtLabel: string;
    onApply: () => void;
    className?: string;
}

export const AthleteLastPerformanceHint: React.FC<AthleteLastPerformanceHintProps> = ({
    weightKg,
    reps,
    rpe,
    performedAtLabel,
    onApply,
    className,
}) => {
    const valueLine = formatRunLastPerformanceLine(weightKg, reps, rpe);

    return (
        <div className={cn("relative", className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                <div className="flex items-center gap-2">
                    <History className="size-4 shrink-0 text-primary/80" aria-hidden />
                    <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>Última vez</p>
                </div>

                <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className={ATHLETE_RUN_HINT_VALUE}>{valueLine}</p>
                        {performedAtLabel ? (
                            <p className="text-xs text-muted-foreground/75">{performedAtLabel}</p>
                        ) : null}
                    </div>
                    <button type="button" className={ATHLETE_RUN_HINT_APPLY_BTN} onClick={onApply}>
                        Usar
                    </button>
                </div>
            </div>
        </div>
    );
};
