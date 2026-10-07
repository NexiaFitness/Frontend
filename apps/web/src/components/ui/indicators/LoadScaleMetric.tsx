/**
 * LoadScaleMetric — Volumen o intensidad 1–10 · NexiaProgressBar premium.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaProgressBar } from "@/components/ui/progress";
import type { NexiaProgressTone } from "@/components/ui/progress";

export type LoadScaleVariant = "volume" | "intensity";

export interface LoadScaleMetricProps {
    variant: LoadScaleVariant;
    value: number;
    label: string;
    className?: string;
    /** Barra y tipografía más compactas (p. ej. SessionCard). */
    compact?: boolean;
}

const VARIANT_VALUE_CLASS: Record<LoadScaleVariant, string> = {
    volume: "text-primary",
    intensity: "text-warning",
};

const VARIANT_TONE: Record<LoadScaleVariant, NexiaProgressTone> = {
    volume: "primary",
    intensity: "warning",
};

function clampScale(value: number): number {
    if (Number.isNaN(value)) return 0;
    return Math.min(10, Math.max(0, value));
}

export const LoadScaleMetric: React.FC<LoadScaleMetricProps> = ({
    variant,
    value,
    label,
    className,
    compact = false,
}) => {
    const clamped = clampScale(value);
    const pct = (clamped / 10) * 100;
    const display = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);

    return (
        <div
            className={cn(
                "min-w-0 py-0.5",
                compact ? "flex-1 basis-[min(100%,7rem)]" : "flex-1 basis-[min(100%,10rem)]",
                className,
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between gap-2",
                    compact ? "mb-1" : "mb-1.5",
                )}
            >
                <span
                    className={cn(
                        "font-semibold uppercase tracking-wider text-muted-foreground",
                        compact ? "text-[9px]" : "text-[10px]",
                    )}
                >
                    {label}
                </span>
                <span
                    className={cn(
                        "shrink-0 font-bold tabular-nums",
                        compact ? "text-xs" : "text-sm",
                        VARIANT_VALUE_CLASS[variant],
                    )}
                >
                    {display}/10
                </span>
            </div>
            <NexiaProgressBar
                value={pct}
                tone={VARIANT_TONE[variant]}
                className={compact ? "h-1.5" : undefined}
                aria-label={`${label}: ${display} de 10`}
            />
        </div>
    );
};
