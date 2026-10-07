/**
 * AthletePlanLoadBar.tsx — Barra vol/int 1–10 legible.
 */

import React from "react";
import {
    athleteLoadBarPercent,
    formatAthleteLoadLevel,
} from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";

export interface AthletePlanLoadBarProps {
    label: string;
    level: number;
    tone?: "primary" | "warning";
    variant?: "plan" | "compact";
    /** Compact: hide numeric level (agenda VOL/INT). */
    showValue?: boolean;
}

export const AthletePlanLoadBar: React.FC<AthletePlanLoadBarProps> = ({
    label,
    level,
    tone = "primary",
    variant = "plan",
    showValue = true,
}) => {
    const width = athleteLoadBarPercent(level);
    const levelLabel = formatAthleteLoadLevel(level);
    const isCompact = variant === "compact";

    return (
        <div className={isCompact ? "w-full shrink-0 space-y-1" : "space-y-1.5"}>
            <div
                className={
                    isCompact
                        ? "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        : "flex items-center justify-between gap-2 text-sm"
                }
            >
                <span className={isCompact ? undefined : "text-foreground/90"}>{label}</span>
                {!isCompact && showValue ? (
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                        {levelLabel}
                    </span>
                ) : null}
            </div>
            <AthleteProgressBar
                value={width}
                tone={tone}
                className={isCompact ? "h-1.5" : undefined}
                aria-label={`${label} ${levelLabel} de diez`}
            />
        </div>
    );
};
