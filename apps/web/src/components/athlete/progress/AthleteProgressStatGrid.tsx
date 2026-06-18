/**
 * AthleteProgressStatGrid.tsx — KPIs hero V10 (adherencia, sesiones, peso).
 */

import React from "react";
import { Activity, Dumbbell, Scale } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { AthletePlanRingMetric } from "@/components/athlete/plan/AthletePlanRingMetric";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { ATHLETE_PROGRESS_STAT_CARD, ATHLETE_TROPHY_TEXT_MUTED } from "./athleteProgressViewPresentation";

export interface AthleteProgressStatGridProps {
    adherencePercent: number | null;
    adherenceDetail: string;
    completedCount: number;
    totalSessions: number;
    latestWeight: number | null;
    weightSubtitle: string;
    personalRecordCount: number;
}

export const AthleteProgressStatGrid: React.FC<AthleteProgressStatGridProps> = ({
    adherencePercent,
    adherenceDetail,
    completedCount,
    totalSessions,
    latestWeight,
    weightSubtitle,
    personalRecordCount,
}) => {
    const sessionPercent =
        totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <article className={ATHLETE_PROGRESS_STAT_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                            Adherencia 30d
                        </p>
                        <p className="text-xs text-muted-foreground">{adherenceDetail}</p>
                    </div>
                    <Activity className="size-4 shrink-0 text-primary/60" aria-hidden />
                </div>
                <div className="relative flex justify-center py-1">
                    <AthletePlanRingMetric
                        label=""
                        value={adherencePercent ?? 0}
                        tone="success"
                        displayValue={
                            adherencePercent != null
                                ? `${Math.round(adherencePercent)}%`
                                : "—"
                        }
                        className="max-w-[5.5rem]"
                    />
                </div>
            </article>

            <article className={ATHLETE_PROGRESS_STAT_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                            Sesiones hechas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {totalSessions > 0
                                ? `${sessionPercent}% del total`
                                : "Sin historial"}
                        </p>
                    </div>
                    <Dumbbell className="size-4 shrink-0 text-primary/60" aria-hidden />
                </div>
                <div className="relative space-y-2">
                    <p className="text-3xl font-bold tabular-nums leading-none text-foreground">
                        {completedCount}
                    </p>
                    {totalSessions > 0 && (
                        <AthleteProgressBar
                            value={sessionPercent}
                            tone="primary"
                            aria-label={`${completedCount} de ${totalSessions} sesiones completadas`}
                        />
                    )}
                </div>
            </article>

            <article className={ATHLETE_PROGRESS_STAT_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                            Peso corporal
                        </p>
                        <p className="text-xs text-muted-foreground">{weightSubtitle}</p>
                    </div>
                    <Scale className="size-4 shrink-0 text-primary/60" aria-hidden />
                </div>
                <div className="relative space-y-1">
                    <p
                        className={cn(
                            "text-3xl font-bold tabular-nums leading-none",
                            latestWeight != null ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {latestWeight != null ? `${latestWeight} kg` : "Sin datos"}
                    </p>
                    {personalRecordCount > 0 && (
                        <p className={`text-caption ${ATHLETE_TROPHY_TEXT_MUTED}`}>
                            {personalRecordCount} PR{personalRecordCount === 1 ? "" : "s"} recientes
                        </p>
                    )}
                </div>
            </article>
        </div>
    );
};
