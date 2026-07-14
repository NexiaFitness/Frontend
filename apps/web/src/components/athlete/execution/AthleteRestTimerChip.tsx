/**
 * AthleteRestTimerChip.tsx — Countdown compacto durante logging_rest (§5a/§5b.1).
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
}

export const AthleteRestTimerChip: React.FC<AthleteRestTimerChipProps> = ({
    remainingSeconds,
    className,
}) => {
    const urgent = remainingSeconds > 0 && remainingSeconds <= 10;
    const pulse = remainingSeconds > 0 && remainingSeconds <= 3;

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
            aria-label={`Descanso ${formatAthleteRestCountdown(remainingSeconds)}`}
        >
            <Timer className="size-4 shrink-0 opacity-80" aria-hidden />
            <span className="text-xs font-medium text-muted-foreground">Descanso</span>
            <span className="tabular-nums">{formatAthleteRestCountdown(remainingSeconds)}</span>
        </div>
    );
};
