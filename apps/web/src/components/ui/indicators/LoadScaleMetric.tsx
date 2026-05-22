/**
 * LoadScaleMetric — Volumen o intensidad en escala 1–10 con barra de progreso.
 *
 * Patrón DESIGN.md / PeriodizationPanel:
 * - Volumen: primary (track surface-2, fill bg-primary)
 * - Intensidad: warning (fill bg-warning)
 */

import React from "react";
import { cn } from "@/lib/utils";

export type LoadScaleVariant = "volume" | "intensity";

export interface LoadScaleMetricProps {
    variant: LoadScaleVariant;
    value: number;
    label: string;
    className?: string;
    /** Barra y tipografía más compactas (p. ej. SessionCard). */
    compact?: boolean;
}

const VARIANT_STYLES: Record<
    LoadScaleVariant,
    {
        value: string;
        fill: string;
    }
> = {
    volume: {
        value: "text-primary",
        fill: "bg-primary",
    },
    intensity: {
        value: "text-warning",
        fill: "bg-warning",
    },
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
    const styles = VARIANT_STYLES[variant];
    const display = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);

    return (
        <div
            className={cn(
                "min-w-0 py-0.5",
                compact ? "flex-1 basis-[min(100%,7rem)]" : "flex-1 basis-[min(100%,10rem)]",
                className
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between gap-2",
                    compact ? "mb-1" : "mb-1.5"
                )}
            >
                <span
                    className={cn(
                        "font-semibold uppercase tracking-wider text-muted-foreground",
                        compact ? "text-[9px]" : "text-[10px]"
                    )}
                >
                    {label}
                </span>
                <span
                    className={cn(
                        "shrink-0 font-bold tabular-nums",
                        compact ? "text-xs" : "text-sm",
                        styles.value
                    )}
                >
                    {display}/10
                </span>
            </div>
            <div
                className={cn(
                    "w-full overflow-hidden rounded-full bg-surface-2",
                    compact ? "h-1" : "h-1.5"
                )}
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label={`${label}: ${display} de 10`}
            >
                <div
                    className={cn("h-full rounded-full transition-all duration-300", styles.fill)}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};
