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
}

export const AthletePlanLoadBar: React.FC<AthletePlanLoadBarProps> = ({
    label,
    level,
    tone = "primary",
}) => {
    const width = athleteLoadBarPercent(level);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground/90">{label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {formatAthleteLoadLevel(level)}
                </span>
            </div>
            <AthleteProgressBar
                value={width}
                tone={tone}
                aria-label={`${label} ${formatAthleteLoadLevel(level)} de diez`}
            />
        </div>
    );
};
