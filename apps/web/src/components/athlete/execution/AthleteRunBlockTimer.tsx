/**
 * AthleteRunBlockTimer.tsx — Cronómetro de bloque premium (V05 Fase C).
 */

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { formatAthleteRestCountdown } from "@/hooks/athlete/useAthleteRunRestFlow";
import {
    ATHLETE_RUN_BLOCK_TIMER_CARD,
    ATHLETE_RUN_BLOCK_TIMER_HINT,
    ATHLETE_RUN_BLOCK_TIMER_LABEL,
    ATHLETE_RUN_BLOCK_TIMER_RING,
    ATHLETE_RUN_BLOCK_TIMER_TIME,
    ATHLETE_RUN_BLOCK_TIMER_TIME_READY,
    ATHLETE_RUN_BLOCK_TIMER_TIME_URGENT,
    ATHLETE_RUN_DOING_ENTER,
    getAthleteBlockTimerHint,
    getAthleteBlockTimerLabel,
} from "./athleteRunPresentation";

const RING_RADIUS = 62;
const RING_STROKE = 4;

export interface AthleteRunBlockTimerProps {
    groupKind: string;
    displaySeconds: number;
    totalSeconds: number | null;
    isCountup: boolean;
    isExpired: boolean;
    isReady?: boolean;
}

export const AthleteRunBlockTimer: React.FC<AthleteRunBlockTimerProps> = ({
    groupKind,
    displaySeconds,
    totalSeconds,
    isCountup,
    isExpired,
    isReady = false,
}) => {
    const urgent =
        !isReady && !isCountup && displaySeconds > 0 && displaySeconds <= 10;
    const total = Math.max(totalSeconds ?? displaySeconds, displaySeconds, 1);
    const progress = isCountup
        ? Math.min(1, displaySeconds / Math.max(totalSeconds ?? 600, 1))
        : displaySeconds / total;
    const circumference = 2 * Math.PI * RING_RADIUS;
    const dashOffset = circumference * (1 - Math.max(0, Math.min(1, progress)));

    const [ringRevealed, setRingRevealed] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setRingRevealed(true));
        return () => cancelAnimationFrame(frame);
    }, [groupKind]);

    return (
        <div className={cn(ATHLETE_RUN_BLOCK_TIMER_CARD, ATHLETE_RUN_DOING_ENTER)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] flex w-full flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <Timer
                        className={cn(
                            "size-4 shrink-0",
                            isReady
                                ? "text-muted-foreground"
                                : urgent || isExpired
                                  ? "text-warning"
                                  : "text-primary"
                        )}
                        aria-hidden
                    />
                    <p
                        className={cn(
                            ATHLETE_RUN_BLOCK_TIMER_LABEL,
                            isReady && "text-muted-foreground"
                        )}
                    >
                        {getAthleteBlockTimerLabel(groupKind, isCountup, isReady)}
                    </p>
                </div>

                <div className={ATHLETE_RUN_BLOCK_TIMER_RING}>
                    <svg
                        className="size-full -rotate-90"
                        viewBox="0 0 140 140"
                        aria-hidden
                    >
                        <circle
                            cx="70"
                            cy="70"
                            r={RING_RADIUS}
                            fill="none"
                            className="stroke-border/35"
                            strokeWidth={RING_STROKE}
                        />
                        {!isCountup && !isReady ? (
                            <circle
                                cx="70"
                                cy="70"
                                r={RING_RADIUS}
                                fill="none"
                                className={cn(
                                    "stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear",
                                    urgent && "stroke-warning"
                                )}
                                strokeWidth={RING_STROKE}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={ringRevealed ? dashOffset : circumference}
                            />
                        ) : null}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className={cn(
                                ATHLETE_RUN_BLOCK_TIMER_TIME,
                                isReady && ATHLETE_RUN_BLOCK_TIMER_TIME_READY,
                                (urgent || isExpired) &&
                                    !isCountup &&
                                    !isReady &&
                                    ATHLETE_RUN_BLOCK_TIMER_TIME_URGENT
                            )}
                        >
                            {formatAthleteRestCountdown(displaySeconds)}
                        </span>
                    </div>
                </div>

                <p className={ATHLETE_RUN_BLOCK_TIMER_HINT}>
                    {getAthleteBlockTimerHint(groupKind, isCountup, isReady)}
                </p>
            </div>
        </div>
    );
};
