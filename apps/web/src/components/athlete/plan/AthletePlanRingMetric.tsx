/**
 * AthletePlanRingMetric.tsx — Anillo circular KPI (adherencia, coherencia).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ATHLETE_PLAN_RING } from "./athletePlanPresentation";

export interface AthletePlanRingMetricProps {
    label: string;
    value: number;
    max?: number;
    displayValue?: string;
    tone?: "primary" | "success";
    className?: string;
}

export const AthletePlanRingMetric: React.FC<AthletePlanRingMetricProps> = ({
    label,
    value,
    max = 100,
    displayValue,
    tone = "primary",
    className,
}) => {
    const safeMax = max > 0 ? max : 100;
    const clamped = Math.min(Math.max(value, 0), safeMax);
    const progress = clamped / safeMax;
    const radius = 17;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);
    const strokeClass = tone === "success" ? "stroke-success" : "stroke-primary";
    const textClass = tone === "success" ? "text-success" : "text-primary";

    return (
        <div className={cn("flex min-w-0 flex-1 flex-col items-center gap-2", className)}>
            <div
                className={ATHLETE_PLAN_RING}
                role="img"
                aria-label={`${label}: ${displayValue ?? `${Math.round(clamped)}%`}`}
            >
                <svg className="size-full -rotate-90" viewBox="0 0 44 44" aria-hidden>
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        className="stroke-muted/40"
                        strokeWidth="3.5"
                    />
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        className={cn(strokeClass, "transition-[stroke-dashoffset] duration-700 ease-out")}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                <span
                    className={cn(
                        "absolute text-center text-[11px] font-bold leading-none tabular-nums",
                        textClass
                    )}
                >
                    {displayValue ?? `${Math.round(clamped)}%`}
                </span>
            </div>
            <p className="text-center text-[11px] font-medium text-muted-foreground">{label}</p>
        </div>
    );
};
