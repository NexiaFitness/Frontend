/**
 * AdherenceBar — Barra de adherencia (0–100%) · NexiaProgressBar premium.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaProgressBar } from "@/components/ui/progress";
import type { NexiaProgressTone } from "@/components/ui/progress";

export interface AdherenceBarProps {
    /** Porcentaje 0–100 */
    value: number;
    className?: string;
}

function adherenceTone(value: number): NexiaProgressTone {
    if (value >= 75) return "success";
    if (value >= 50) return "warning";
    return "destructive";
}

export const AdherenceBar: React.FC<AdherenceBarProps> = ({ value, className }) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <NexiaProgressBar
            value={clamped}
            tone={adherenceTone(clamped)}
            className={cn("h-1.5 w-20", className)}
            aria-label={`Adherencia ${Math.round(clamped)} por ciento`}
        />
    );
};
