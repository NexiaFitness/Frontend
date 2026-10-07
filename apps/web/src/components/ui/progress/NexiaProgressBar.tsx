/**
 * NexiaProgressBar — Barra % premium canónica (atleta + entrenador + admin).
 *
 * Misma receta que Énfasis del plan / Mis sesiones (glass track + fill gradient + glow).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_PROGRESS_FILL,
    ATHLETE_PROGRESS_TRACK,
    type NexiaProgressTone,
} from "./nexiaProgressPresentation";

export interface NexiaProgressBarProps {
    value: number;
    tone?: NexiaProgressTone;
    className?: string;
    "aria-label"?: string;
    /** Ocultar de árbol de accesibilidad cuando hay un control superpuesto (p. ej. range). */
    "aria-hidden"?: boolean;
}

export const NexiaProgressBar: React.FC<NexiaProgressBarProps> = ({
    value,
    tone = "primary",
    className,
    "aria-label": ariaLabel,
    "aria-hidden": ariaHidden,
}) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <div
            className={cn(ATHLETE_PROGRESS_TRACK, className)}
            role={ariaHidden ? undefined : "progressbar"}
            aria-hidden={ariaHidden}
            aria-valuenow={ariaHidden ? undefined : Math.round(clamped)}
            aria-valuemin={ariaHidden ? undefined : 0}
            aria-valuemax={ariaHidden ? undefined : 100}
            aria-label={ariaHidden ? undefined : ariaLabel}
        >
            <div
                className={ATHLETE_PROGRESS_FILL[tone]}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
};
