/**
 * AthleteProgressBar.tsx — Barra % premium reutilizable (portal atleta).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_PROGRESS_FILL,
    ATHLETE_PROGRESS_TRACK,
    type AthleteProgressTone,
} from "./athleteProgressPresentation";

export interface AthleteProgressBarProps {
    value: number;
    tone?: AthleteProgressTone;
    className?: string;
    "aria-label"?: string;
}

export const AthleteProgressBar: React.FC<AthleteProgressBarProps> = ({
    value,
    tone = "primary",
    className,
    "aria-label": ariaLabel,
}) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <div
            className={cn(ATHLETE_PROGRESS_TRACK, className)}
            role="progressbar"
            aria-valuenow={Math.round(clamped)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={ariaLabel}
        >
            <div
                className={ATHLETE_PROGRESS_FILL[tone]}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
};
