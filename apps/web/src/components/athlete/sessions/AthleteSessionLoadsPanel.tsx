/**
 * AthleteSessionLoadsPanel.tsx — Cargas registradas en sesión completada (read-only).
 */

import React from "react";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_SECTION_LABEL,
    ATHLETE_SETTINGS_CARD,
} from "@/components/athlete/account/athleteSettingsPresentation";
import type { SessionLoadRow } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { cn } from "@/lib/utils";

export interface AthleteSessionLoadsPanelProps {
    loads: SessionLoadRow[];
    previousSession?: TrainingSession;
}

export const AthleteSessionLoadsPanel: React.FC<AthleteSessionLoadsPanelProps> = ({
    loads,
    previousSession,
}) => {
    if (loads.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Cargas de la sesión">
            <div className="space-y-1">
                <h2 className={`flex items-center gap-2 ${ATHLETE_SECTION_LABEL}`}>
                    <Scale className="size-3.5" aria-hidden />
                    Cargas registradas
                </h2>
                {previousSession?.session_date && (
                    <p className="text-caption text-muted-foreground">
                        Comparado con{" "}
                        {formatAthleteDateLong(previousSession.session_date)}
                        {previousSession.session_name
                            ? ` · ${previousSession.session_name}`
                            : ""}
                    </p>
                )}
            </div>
            <ul className={cn(ATHLETE_SETTINGS_CARD, "relative divide-y divide-border/60")}>
                <NexiaGlassAccentRim />
                {loads.map((row) => (
                    <li
                        key={row.exerciseId}
                        className="relative flex items-center justify-between gap-3 px-4 py-3.5"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                                {row.exerciseName}
                            </p>
                            <p className="text-caption tabular-nums text-muted-foreground">
                                {row.maxWeight != null && row.maxWeight > 0
                                    ? `${row.maxWeight} kg`
                                    : "Sin carga"}
                                {row.maxReps != null ? ` × ${row.maxReps}` : ""}
                            </p>
                        </div>
                        {row.weightDelta != null && (
                            <span
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
                                    row.weightDelta >= 0
                                        ? "border-success/30 bg-success/10 text-success"
                                        : "border-warning/30 bg-warning/10 text-warning"
                                )}
                            >
                                {row.weightDelta >= 0 ? (
                                    <TrendingUp className="size-3" aria-hidden />
                                ) : (
                                    <TrendingDown className="size-3" aria-hidden />
                                )}
                                {row.weightDelta >= 0 ? "+" : ""}
                                {row.weightDelta} kg
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
};
