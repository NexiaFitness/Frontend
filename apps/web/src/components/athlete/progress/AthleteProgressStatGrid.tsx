/**
 * AthleteProgressStatGrid.tsx — KPIs de Mi progreso (adherencia, sesiones, marcas).
 * Contexto: omite tarjetas sin datos; el peso vive en la sección Cuerpo.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { Activity, Dumbbell, Trophy } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteProgressRing } from "@/components/athlete/AthleteProgressRing";
import type { AdherenceSnapshot } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import {
    ATHLETE_PROGRESS_STAT_CARD,
    ATHLETE_PROGRESS_STAT_GRID,
    ATHLETE_PROGRESS_STAT_VALUE,
    ATHLETE_PROGRESS_STAT_VALUE_SUFFIX,
    ATHLETE_TROPHY_TEXT_MUTED,
} from "./athleteProgressViewPresentation";

export interface AthleteProgressStatGridProps {
    windowLabel: string;
    adherence: AdherenceSnapshot | null;
    completedInPeriod: number | null;
    lifetimeCompleted: number;
    personalRecordCount: number | null;
}

export const AthleteProgressStatGrid: React.FC<AthleteProgressStatGridProps> = ({
    windowLabel,
    adherence,
    completedInPeriod,
    lifetimeCompleted,
    personalRecordCount,
}) => {
    const showAdherence = adherence != null && adherence.planned > 0;
    const showSessions = completedInPeriod != null && lifetimeCompleted >= 1;
    const showMarks = personalRecordCount != null && personalRecordCount >= 1;

    if (!showAdherence && !showSessions && !showMarks) return null;

    return (
        <div className={ATHLETE_PROGRESS_STAT_GRID}>
            {showAdherence && adherence && (
                <article className={ATHLETE_PROGRESS_STAT_CARD}>
                    <NexiaGlassAccentRim />
                    <div className="relative flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                                Adherencia
                            </p>
                            <p className="text-xs text-muted-foreground">{windowLabel}</p>
                        </div>
                        <Activity className="size-4 shrink-0 text-primary/60" aria-hidden />
                    </div>
                    <div className="relative flex flex-col items-center gap-2 py-0.5">
                        <AthleteProgressRing
                            progress={(adherence.percent ?? 0) / 100}
                            displayValue={
                                adherence.percent != null
                                    ? `${Math.round(adherence.percent)}%`
                                    : "—"
                            }
                            ariaLabel={`Adherencia ${windowLabel}: ${adherence.completed} de ${adherence.planned} sesiones`}
                            tone="success"
                            size="md"
                        />
                        <p className="text-center text-[11px] leading-snug text-muted-foreground">
                            {adherence.completed}/{adherence.planned} sesiones
                        </p>
                    </div>
                </article>
            )}

            {showSessions && completedInPeriod != null && (
                <article className={ATHLETE_PROGRESS_STAT_CARD}>
                    <NexiaGlassAccentRim />
                    <div className="relative flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                                Sesiones hechas
                            </p>
                            <p className="text-xs text-muted-foreground">{windowLabel}</p>
                        </div>
                        <Dumbbell className="size-4 shrink-0 text-primary/60" aria-hidden />
                    </div>
                    <div className="relative space-y-1 pt-0.5">
                        <p className={ATHLETE_PROGRESS_STAT_VALUE}>
                            {completedInPeriod}
                        </p>
                        <p className={`text-caption ${ATHLETE_PROGRESS_STAT_VALUE_SUFFIX}`}>
                            {lifetimeCompleted} en total
                        </p>
                    </div>
                </article>
            )}

            {showMarks && personalRecordCount != null && (
                <article className={ATHLETE_PROGRESS_STAT_CARD}>
                    <NexiaGlassAccentRim />
                    <div className="relative flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
                                Marcas
                            </p>
                            <p className="text-xs text-muted-foreground">{windowLabel}</p>
                        </div>
                        <Trophy className="size-4 shrink-0 text-warning" aria-hidden />
                    </div>
                    <div className="relative pt-0.5">
                        <p className={ATHLETE_PROGRESS_STAT_VALUE}>{personalRecordCount}</p>
                        <p className={`text-caption ${ATHLETE_TROPHY_TEXT_MUTED}`}>
                            {personalRecordCount === 1
                                ? "marca personal"
                                : "marcas personales"}
                        </p>
                    </div>
                </article>
            )}
        </div>
    );
};
