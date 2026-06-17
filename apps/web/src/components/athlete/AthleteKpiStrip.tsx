/**
 * AthleteKpiStrip.tsx — KPIs semanales en cards con affordance clara.
 */

import React from "react";
import { ChevronRight, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteKpiStripData } from "@nexia/shared/utils/athlete/athleteKpiStrip";

export interface AthleteKpiStripProps {
    data: AthleteKpiStripData;
    onAdherenceClick?: () => void;
}

const CARD_BASE =
    "rounded-lg border border-border/80 bg-card/40 px-3 py-3 transition-colors";

export const AthleteKpiStrip: React.FC<AthleteKpiStripProps> = ({
    data,
    onAdherenceClick,
}) => {
    const adherenceInteractive = Boolean(onAdherenceClick);

    const adherenceContent = (
        <>
            <div className="mb-1 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">
                    <Target className="size-3.5 text-success" aria-hidden />
                    Adherencia
                </div>
                {adherenceInteractive && (
                    <ChevronRight
                        className="size-3.5 text-muted-foreground/80"
                        aria-hidden
                    />
                )}
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
                {data.adherencePrimary}
            </p>
            <p className="mt-0.5 text-caption text-muted-foreground">
                {data.adherenceLabel}
            </p>
        </>
    );

    return (
        <div className="grid grid-cols-2 gap-3">
            {adherenceInteractive ? (
                <button
                    type="button"
                    onClick={onAdherenceClick}
                    aria-label="Adherencia semanal. Ver mi progreso"
                    className={cn(
                        CARD_BASE,
                        "group text-left",
                        "hover:border-primary/35 hover:bg-surface-2 active:bg-surface-2",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    )}
                >
                    {adherenceContent}
                </button>
            ) : (
                <div className={CARD_BASE}>{adherenceContent}</div>
            )}

            <div className={CARD_BASE}>
                <div className="mb-1 flex items-center gap-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">
                    <Flame
                        className={
                            data.showFlame
                                ? "size-3.5 text-warning"
                                : "size-3.5 text-muted-foreground"
                        }
                        aria-hidden
                    />
                    Racha
                </div>
                <p
                    className={cn(
                        "flex items-center gap-1 font-bold tabular-nums text-foreground",
                        data.streakMotivational ? "text-lg" : "text-2xl"
                    )}
                >
                    {data.showFlame && (
                        <Flame className="size-5 text-warning" aria-hidden />
                    )}
                    {data.streakPrimary}
                </p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                    {data.streakLabel}
                </p>
            </div>
        </div>
    );
};
