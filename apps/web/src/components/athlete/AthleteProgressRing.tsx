/**
 * AthleteProgressRing — Anillo de progreso canónico portal atleta (Mi plan, Esta semana, KPIs).
 */

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_PROGRESS_RING,
    ATHLETE_PROGRESS_RING_LABEL_PRIMARY,
    ATHLETE_PROGRESS_RING_LABEL_SUCCESS,
    ATHLETE_PROGRESS_RING_PROGRESS_PRIMARY,
    ATHLETE_PROGRESS_RING_PROGRESS_SUCCESS,
    ATHLETE_PROGRESS_RING_SHELL,
    ATHLETE_PROGRESS_RING_SIZE,
    ATHLETE_PROGRESS_RING_TRACK,
    type AthleteProgressRingSize,
} from "./athleteProgressPresentation";

export interface AthleteProgressRingProps {
    /** Progreso normalizado 0–1. */
    progress: number;
    displayValue: string;
    ariaLabel: string;
    tone?: "primary" | "success";
    completeAtFull?: boolean;
    size?: AthleteProgressRingSize;
    className?: string;
    animateReveal?: boolean;
}

export const AthleteProgressRing: React.FC<AthleteProgressRingProps> = ({
    progress,
    displayValue,
    ariaLabel,
    tone = "primary",
    completeAtFull = true,
    size = "md",
    className,
    animateReveal = true,
}) => {
    const [revealed, setRevealed] = useState(!animateReveal);
    const clamped = Math.min(1, Math.max(0, progress));
    const isComplete = completeAtFull && clamped >= 1;
    const useSuccessStyle = isComplete || tone === "success";
    const radius = 17;
    const circumference = 2 * Math.PI * radius;
    const revealedOffset = revealed ? circumference * (1 - clamped) : circumference;

    useEffect(() => {
        if (!animateReveal) {
            return undefined;
        }
        const frame = requestAnimationFrame(() => setRevealed(true));
        return () => cancelAnimationFrame(frame);
    }, [animateReveal]);

    const progressStrokeClass = useSuccessStyle
        ? ATHLETE_PROGRESS_RING_PROGRESS_SUCCESS
        : ATHLETE_PROGRESS_RING_PROGRESS_PRIMARY;

    const labelClass = useSuccessStyle
        ? ATHLETE_PROGRESS_RING_LABEL_SUCCESS
        : ATHLETE_PROGRESS_RING_LABEL_PRIMARY;

    return (
        <div
            className={cn(ATHLETE_PROGRESS_RING_SHELL[size], className)}
            role="img"
            aria-label={ariaLabel}
        >
            <div className={cn(ATHLETE_PROGRESS_RING, ATHLETE_PROGRESS_RING_SIZE[size])}>
                <svg
                    className="size-full overflow-visible -rotate-90"
                    viewBox="0 0 44 44"
                    overflow="visible"
                    aria-hidden
                >
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        className={ATHLETE_PROGRESS_RING_TRACK}
                        strokeWidth="3.5"
                    />
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        className={progressStrokeClass}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={revealedOffset}
                    />
                </svg>
                <span
                    className={cn(
                        "absolute text-center text-[11px] font-bold leading-none tabular-nums",
                        labelClass
                    )}
                >
                    {displayValue}
                </span>
            </div>
        </div>
    );
};
