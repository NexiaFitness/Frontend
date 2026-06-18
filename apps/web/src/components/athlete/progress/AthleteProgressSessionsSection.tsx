/**
 * AthleteProgressSessionsSection.tsx — Últimas sesiones completadas.
 */

import React from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { ATHLETE_SETTINGS_CARD } from "@/components/athlete/account/athleteSettingsPresentation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { cn } from "@/lib/utils";
import { ATHLETE_PROGRESS_EMPTY, ATHLETE_PROGRESS_LIST_ROW } from "./athleteProgressViewPresentation";

export interface AthleteProgressSessionsSectionProps {
    sessions: TrainingSession[];
    onSelectSession: (sessionId: number) => void;
}

export const AthleteProgressSessionsSection: React.FC<AthleteProgressSessionsSectionProps> = ({
    sessions,
    onSelectSession,
}) => {
    return (
        <section className="space-y-3" aria-label="Últimas sesiones">
            <AthleteSectionHeading
                title="Últimas sesiones"
                icon={<CalendarDays className="size-3.5" aria-hidden />}
            />
            {sessions.length === 0 ? (
                <p className={ATHLETE_PROGRESS_EMPTY}>
                    Aún no tienes sesiones completadas. Cuando cierres la primera, aparecerá aquí.
                </p>
            ) : (
                <div className={cn(ATHLETE_SETTINGS_CARD, "relative overflow-hidden")}>
                    <NexiaGlassAccentRim />
                    <ul className="relative divide-y divide-border/60">
                        {sessions.map((session) => (
                            <li key={session.id}>
                                <button
                                    type="button"
                                    className={ATHLETE_PROGRESS_LIST_ROW}
                                    onClick={() => onSelectSession(session.id)}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-foreground">
                                            {session.session_name}
                                        </p>
                                        {session.session_date && (
                                            <p className="text-caption text-muted-foreground">
                                                {formatAthleteDateLong(session.session_date)}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight
                                        className="size-5 shrink-0 text-primary/55"
                                        aria-hidden
                                    />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};
