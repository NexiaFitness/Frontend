/**
 * PostSessionCompletionRing.tsx — Anillo de cumplimiento compacto.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface PostSessionCompletionRingProps {
    percent: number;
    strokeClass: string;
    trackClass: string;
    valueClass: string;
    size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
    sm: {
        box: "size-20",
        viewBox: "0 0 80 80",
        cx: 40,
        radius: 32,
        strokeWidth: 5,
        pct: "text-lg",
        label: "text-[9px]",
    },
    md: {
        box: "size-24",
        viewBox: "0 0 96 96",
        cx: 48,
        radius: 38,
        strokeWidth: 5,
        pct: "text-xl",
        label: "text-[10px]",
    },
    lg: {
        box: "size-44",
        viewBox: "0 0 176 176",
        cx: 88,
        radius: 78,
        strokeWidth: 5,
        pct: "text-4xl",
        label: "text-[10px]",
    },
} as const;

export const PostSessionCompletionRing: React.FC<PostSessionCompletionRingProps> = ({
    percent,
    strokeClass,
    trackClass,
    valueClass,
    size = "sm",
}) => {
    const cfg = SIZE_CONFIG[size];
    const circumference = 2 * Math.PI * cfg.radius;
    const progress = Math.min(100, Math.max(0, percent)) / 100;
    const dashOffset = circumference * (1 - progress);

    return (
        <div
            className={cn("relative flex shrink-0 items-center justify-center", cfg.box)}
            role="img"
            aria-label={`Cumplimiento ${percent} por ciento`}
        >
            <svg className="size-full -rotate-90" viewBox={cfg.viewBox} aria-hidden>
                <circle
                    cx={cfg.cx}
                    cy={cfg.cx}
                    r={cfg.radius}
                    fill="none"
                    className={cn(trackClass)}
                    strokeWidth={cfg.strokeWidth}
                />
                <circle
                    cx={cfg.cx}
                    cy={cfg.cx}
                    r={cfg.radius}
                    fill="none"
                    className={cn(
                        strokeClass,
                        "transition-[stroke-dashoffset] duration-700 ease-out"
                    )}
                    strokeWidth={cfg.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="absolute text-center">
                <p className={cn("font-bold tabular-nums leading-none", cfg.pct, valueClass)}>
                    {percent}%
                </p>
                <p
                    className={cn(
                        "mt-0.5 font-medium uppercase tracking-wide text-muted-foreground",
                        cfg.label
                    )}
                >
                    Cumpl.
                </p>
            </div>
        </div>
    );
};
