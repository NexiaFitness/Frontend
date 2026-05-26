/**
 * Etiqueta cualitativa en línea (texto coloreado, sin punto ni pill).
 * Semáforo: extremos bajo/alto → rojo; medio → verde; medio-alto → ámbar.
 */

import React from "react";
import { sliderLevelLabelEs } from "@nexia/shared";
import { cn } from "@/lib/utils";

export type SliderLevelTone = "volume" | "intensity";

/** Muy bajo/Bajo/Alto → rojo; Medio → verde; Medio-alto → ámbar. */
function levelColorClass(level: number): string {
    const n = Math.max(1, Math.min(10, Math.round(level)));
    if (n <= 4) {
        return "text-destructive";
    }
    if (n <= 6) {
        return "text-emerald-500";
    }
    if (n <= 8) {
        return "text-amber-500";
    }
    return "text-destructive";
}

interface Props {
    level: number;
    tone: SliderLevelTone;
    prefix?: string;
    className?: string;
}

export const SliderLevelBadge: React.FC<Props> = ({ level, tone: _tone, prefix, className }) => {
    const label = sliderLevelLabelEs(level);
    const colorClass = levelColorClass(level);

    if (prefix) {
        return (
            <span className={cn("text-xs text-foreground whitespace-nowrap", className)}>
                {prefix}: <span className={cn("font-medium", colorClass)}>{label}</span>
            </span>
        );
    }

    return (
        <span className={cn("text-xs font-medium whitespace-nowrap", colorClass, className)}>
            {label}
        </span>
    );
};
