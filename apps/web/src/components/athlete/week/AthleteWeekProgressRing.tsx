/**
 * AthleteWeekProgressRing.tsx — Ring semanal con draw-in al montar (V01).
 */

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    WEEK_STRIP_RING,
    WEEK_STRIP_RING_LABEL_PRIMARY,
    WEEK_STRIP_RING_LABEL_SUCCESS,
    WEEK_STRIP_RING_PROGRESS_PRIMARY,
    WEEK_STRIP_RING_PROGRESS_SUCCESS,
    WEEK_STRIP_RING_TRACK,
} from "./weekStripPresentation";

export interface AthleteWeekProgressRingProps {
    done: number;
    planned: number;
}

export const AthleteWeekProgressRing: React.FC<AthleteWeekProgressRingProps> = ({
    done,
    planned,
}) => {
    const [revealed, setRevealed] = useState(false);
    const radius = 17;
    const circumference = 2 * Math.PI * radius;
    const progress = planned > 0 ? done / planned : 0;
    const dashOffset = circumference * (1 - progress);
    const isComplete = planned > 0 && done >= planned;

    useEffect(() => {
        const frame = requestAnimationFrame(() => setRevealed(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div
            className={WEEK_STRIP_RING}
            role="img"
            aria-label={`${done} de ${planned} sesiones completadas esta semana`}
        >
            <svg className="size-full -rotate-90" viewBox="0 0 44 44" aria-hidden>
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    className={WEEK_STRIP_RING_TRACK}
                    strokeWidth="3.5"
                />
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    className={
                        isComplete
                            ? WEEK_STRIP_RING_PROGRESS_SUCCESS
                            : WEEK_STRIP_RING_PROGRESS_PRIMARY
                    }
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={revealed ? dashOffset : circumference}
                />
            </svg>
            <span
                className={cn(
                    "absolute text-center text-[11px] font-bold leading-none tabular-nums",
                    isComplete
                        ? WEEK_STRIP_RING_LABEL_SUCCESS
                        : WEEK_STRIP_RING_LABEL_PRIMARY
                )}
            >
                {done}/{planned}
            </span>
        </div>
    );
};
