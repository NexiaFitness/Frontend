/**
 * AthleteProgressChartTooltip.tsx — Tooltip glass para gráficos atleta.
 */

import React from "react";

export interface AthleteProgressChartTooltipProps {
    active?: boolean;
    label?: string;
    valueLabel: string;
    value: string;
}

export const AthleteProgressChartTooltip: React.FC<AthleteProgressChartTooltipProps> = ({
    active,
    label,
    valueLabel,
    value,
}) => {
    if (!active) return null;

    return (
        <div className="rounded-lg border border-border/60 bg-card/95 px-3 py-2 shadow-[0_12px_32px_-12px] shadow-black/50 backdrop-blur-md">
            {label && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                    {label}
                </p>
            )}
            <p className="text-sm font-semibold tabular-nums text-foreground">
                {value}
            </p>
            <p className="text-[10px] text-muted-foreground">{valueLabel}</p>
        </div>
    );
};
