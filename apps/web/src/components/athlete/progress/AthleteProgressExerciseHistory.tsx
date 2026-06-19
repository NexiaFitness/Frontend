/**
 * AthleteProgressExerciseHistory.tsx — Historial glass por ejercicio (V11).
 */

import React from "react";
import { History, Trophy } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import {
    ATHLETE_SETTINGS_CARD,
} from "@/components/athlete/account/athleteSettingsPresentation";
import type { ProgressTracking } from "@nexia/shared/types/progress";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { trackingDatesMatch } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import { cn } from "@/lib/utils";
import { ATHLETE_PROGRESS_EMPTY, ATHLETE_PROGRESS_LIST_ROW, ATHLETE_TROPHY_BADGE, ATHLETE_TROPHY_BANNER, ATHLETE_TROPHY_ROW_ACCENT, ATHLETE_TROPHY_ROW_HIGHLIGHT } from "./athleteProgressViewPresentation";

export interface AthleteProgressExerciseHistoryProps {
    rows: ProgressTracking[];
    highlightDate?: string | null;
    highlightRef?: React.Ref<HTMLLIElement>;
    onViewSession: (trackingDate: string) => void;
}

export const AthleteProgressExerciseHistory: React.FC<AthleteProgressExerciseHistoryProps> = ({
    rows,
    highlightDate,
    highlightRef,
    onViewSession,
}) => {
    const hasHighlight =
        highlightDate != null &&
        rows.some((row) => trackingDatesMatch(row.tracking_date, highlightDate));

    return (
        <section className="space-y-3" aria-label="Historial de cargas">
            <AthleteSectionHeading
                title="Historial reciente"
                icon={<History className="size-3.5" aria-hidden />}
            />
            {highlightDate && hasHighlight && (
                <p className={ATHLETE_TROPHY_BANNER}>
                    <Trophy className="size-4 shrink-0" aria-hidden />
                    Marca personal del{" "}
                    {formatAthleteDateLong(highlightDate)} resaltada abajo
                </p>
            )}
            {rows.length === 0 ? (
                <p className={ATHLETE_PROGRESS_EMPTY}>Sin historial registrado.</p>
            ) : (
                <div className={cn(ATHLETE_SETTINGS_CARD, "relative overflow-hidden")}>
                    <NexiaGlassAccentRim />
                    <ul className="relative divide-y divide-border/60">
                        {rows.map((row) => {
                            const isHighlight =
                                highlightDate != null &&
                                trackingDatesMatch(row.tracking_date, highlightDate);
                            return (
                                <li
                                    key={row.id}
                                    id={isHighlight ? "athlete-pr-highlight" : undefined}
                                    ref={isHighlight ? highlightRef : undefined}
                                    className={cn(isHighlight && ATHLETE_TROPHY_ROW_HIGHLIGHT)}
                                >
                                    {isHighlight && (
                                        <span className={ATHLETE_TROPHY_ROW_ACCENT} aria-hidden />
                                    )}
                                    <div
                                        className={cn(
                                            ATHLETE_PROGRESS_LIST_ROW,
                                            "cursor-default hover:bg-transparent",
                                            isHighlight && "pl-5"
                                        )}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-foreground">
                                                    {formatAthleteDateLong(row.tracking_date)}
                                                </p>
                                                {isHighlight && (
                                                    <span className={ATHLETE_TROPHY_BADGE}>
                                                        <Trophy className="size-3" aria-hidden />
                                                        PR
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-caption tabular-nums text-muted-foreground">
                                                {row.max_weight != null && row.max_weight > 0
                                                    ? `${row.max_weight} kg`
                                                    : "Sin carga"}
                                                {row.max_reps != null
                                                    ? ` · ${row.max_reps} reps`
                                                    : ""}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                                            onClick={() => onViewSession(row.tracking_date)}
                                        >
                                            Ver sesión
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
};
