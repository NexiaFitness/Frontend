/**
 * AthleteRestTimerChip.tsx — Countdown compacto durante logging_rest (§5a/§5b.1).
 * Toda la pastilla salta el descanso (D-REST-01); no abre overlay.
 */

import React from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAthleteRestCountdown } from "@/hooks/athlete/useAthleteRunRestFlow";
import {
    ATHLETE_RUN_REST_CHIP,
    ATHLETE_RUN_REST_CHIP_PULSE,
    ATHLETE_RUN_REST_CHIP_URGENT,
} from "./athleteRunPresentation";

export interface AthleteRestTimerChipProps {
    remainingSeconds: number;
    className?: string;
    onSkip?: () => void;
}

export const AthleteRestTimerChip: React.FC<AthleteRestTimerChipProps> = ({
    remainingSeconds,
    className,
    onSkip,
}) => {
    const urgent = remainingSeconds > 0 && remainingSeconds <= 10;
    const pulse = remainingSeconds > 0 && remainingSeconds <= 3;
    const label = formatAthleteRestCountdown(remainingSeconds);

    if (!onSkip) {
        return (
            <div
                className={cn(
                    ATHLETE_RUN_REST_CHIP,
                    urgent && ATHLETE_RUN_REST_CHIP_URGENT,
                    pulse && ATHLETE_RUN_REST_CHIP_PULSE,
                    className
                )}
                role="timer"
                aria-live="polite"
                aria-label={`Descanso ${label}`}
            >
                <Timer className="size-5 shrink-0 opacity-80" aria-hidden />
                <span className="text-sm font-medium text-muted-foreground">Descanso</span>
                <span className="text-base tabular-nums">{label}</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            className={cn(
                ATHLETE_RUN_REST_CHIP,
                "min-h-touch-athlete cursor-pointer transition-opacity hover:opacity-90",
                urgent && ATHLETE_RUN_REST_CHIP_URGENT,
                pulse && ATHLETE_RUN_REST_CHIP_PULSE,
                className
            )}
            role="timer"
            aria-live="polite"
            aria-label={`Descanso ${label}. Tocar para saltar.`}
            onClick={onSkip}
        >
            <Timer className="size-5 shrink-0 opacity-80" aria-hidden />
            <span className="text-sm font-medium text-muted-foreground">Descanso</span>
            <span className="text-base font-semibold tabular-nums">{label}</span>
            <span className="ml-1 text-xs font-medium text-primary underline-offset-2">
                Saltar
            </span>
        </button>
    );
};
