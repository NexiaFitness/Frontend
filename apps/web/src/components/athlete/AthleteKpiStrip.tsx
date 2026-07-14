/**
 * AthleteKpiStrip.tsx — KPIs semanales glass (V01 insight).
 */

import React from "react";
import { ChevronRight, Flame, Target } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { AthleteKpiStripData } from "@nexia/shared/utils/athlete/athleteKpiStrip";
import {
    ATHLETE_DASHBOARD_KPI_CARD,
    ATHLETE_DASHBOARD_KPI_CARD_INTERACTIVE,
    ATHLETE_DASHBOARD_KPI_HINT,
    ATHLETE_DASHBOARD_KPI_LABEL,
    ATHLETE_DASHBOARD_KPI_VALUE,
} from "@/components/athlete/dashboard/athleteDashboardPresentation";

export interface AthleteKpiStripProps {
    data: AthleteKpiStripData;
    onAdherenceClick?: () => void;
}

export const AthleteKpiStrip: React.FC<AthleteKpiStripProps> = ({
    data,
    onAdherenceClick,
}) => {
    const adherenceInteractive = Boolean(onAdherenceClick);

    const adherenceContent = (
        <>
            <NexiaGlassAccentRim />
            <div className="relative mb-1 flex items-center justify-between gap-1">
                <div className={ATHLETE_DASHBOARD_KPI_LABEL}>
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
            <p className={cn(ATHLETE_DASHBOARD_KPI_VALUE, "relative")}>
                {data.adherencePrimary}
            </p>
            <p className={cn(ATHLETE_DASHBOARD_KPI_HINT, "relative")}>
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
                    className={ATHLETE_DASHBOARD_KPI_CARD_INTERACTIVE}
                >
                    {adherenceContent}
                </button>
            ) : (
                <div className={ATHLETE_DASHBOARD_KPI_CARD}>{adherenceContent}</div>
            )}

            <div className={ATHLETE_DASHBOARD_KPI_CARD}>
                <NexiaGlassAccentRim />
                <div className={cn(ATHLETE_DASHBOARD_KPI_LABEL, "relative mb-1")}>
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
                        "relative flex items-center gap-1 font-bold tabular-nums text-foreground",
                        data.streakMotivational ? "text-lg" : ATHLETE_DASHBOARD_KPI_VALUE
                    )}
                >
                    {data.showFlame && (
                        <Flame className="size-5 text-warning" aria-hidden />
                    )}
                    {data.streakPrimary}
                </p>
                <p className={cn(ATHLETE_DASHBOARD_KPI_HINT, "relative")}>
                    {data.streakLabel}
                </p>
            </div>
        </div>
    );
};
