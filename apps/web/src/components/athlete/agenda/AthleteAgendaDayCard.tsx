/**
 * AthleteAgendaDayCard — Tarjeta premium por día civil (Madrid).
 */

import React, { useMemo } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { madridTodayDateKey } from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { AthleteRunSessionRegistrationMetaRow } from "@nexia/shared/types/athleteRunProgress";
import {
    agendaTrainingStatusShort,
    buildAgendaTrainingRowAriaLabel,
    countTrainingSessionsInDay,
    filterNormalizedAgendaRows,
    formatAgendaSessionCountLabel,
    normalizeAgendaDayRows,
    resolveAgendaTrainingHeadline,
    resolveAgendaTrainingSubline,
    trainingSessionOrdinalLabel,
    type AthleteAgendaFilter,
    type NormalizedAgendaRow,
} from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import { resolveAthleteSessionOpenPath } from "@nexia/shared/utils/athlete/athleteAgendaNavigation";
import { hasAthleteSessionPlannedLoad } from "@nexia/shared/utils/athlete/athleteSessionPlannedLoad";
import {
    ATHLETE_AGENDA_APPOINTMENT_ROW,
    ATHLETE_AGENDA_DAY_CARD,
    ATHLETE_AGENDA_DAY_CARD_TODAY,
    ATHLETE_AGENDA_SECTION_LABEL,
    ATHLETE_AGENDA_TODAY_BADGE,
    ATHLETE_AGENDA_TRAINING_ROW,
} from "@/components/athlete/athleteAgendaPresentation";
import { NEXIA_ROW_CHEVRON } from "@/components/ui/surface/platformPremiumPresentation";
import { AthleteSessionPlannedLoadBars } from "@/components/athlete/AthleteSessionPlannedLoadBars";
import type { AthleteAgendaDayRow } from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import {
    formatCalendarEventClockMadrid,
    resolveCalendarEventDisplayTitle,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";

export interface AthleteAgendaDayCardProps {
    dateKey: string;
    rows: AthleteAgendaDayRow[];
    filter: AthleteAgendaFilter;
    sessionsById: Map<number, TrainingSession>;
    registrationMetaBySessionId: Map<number, AthleteRunSessionRegistrationMetaRow>;
    onOpenTraining: (path: string) => void;
    onOpenAppointment: (event: CalendarEvent) => void;
}

function TrainingRow({
    row,
    sessionIndex,
    totalTraining,
    dateKey,
    onOpenTraining,
    registrationMetaBySessionId,
}: {
    row: Extract<NormalizedAgendaRow, { kind: "training" }>;
    sessionIndex: number;
    totalTraining: number;
    dateKey: string;
    onOpenTraining: (path: string) => void;
    registrationMetaBySessionId: Map<number, AthleteRunSessionRegistrationMetaRow>;
}) {
    const { session, clock } = row;
    const headline = resolveAgendaTrainingHeadline(session);
    const subline = resolveAgendaTrainingSubline(session);
    const ordinal = trainingSessionOrdinalLabel(sessionIndex, totalTraining);
    const statusShort = agendaTrainingStatusShort(session, dateKey);
    const meta = registrationMetaBySessionId.get(session.id);
    const path = resolveAthleteSessionOpenPath(session, meta);

    const hasLoad = hasAthleteSessionPlannedLoad(session);
    const hasMeta = Boolean(clock || session.planned_duration != null || hasLoad);
    if (!headline && !subline && !hasMeta) return null;

    return (
        <li role="presentation">
            <button
                type="button"
                className={ATHLETE_AGENDA_TRAINING_ROW}
                aria-label={buildAgendaTrainingRowAriaLabel(session, dateKey)}
                onClick={() => onOpenTraining(path)}
            >
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        {ordinal ? (
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
                                {ordinal}
                            </p>
                        ) : null}
                        {headline ? (
                            <p className="text-sm font-semibold text-foreground">{headline}</p>
                        ) : null}
                        {subline ? (
                            <p className="text-xs text-muted-foreground">{subline}</p>
                        ) : null}
                    </div>
                    <AthleteSessionPlannedLoadBars session={session} interactive={false} />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {clock ? (
                            <span className="inline-flex items-center gap-1 tabular-nums">
                                <Clock className="size-3.5 text-primary/70" aria-hidden />
                                {clock}
                            </span>
                        ) : null}
                        {session.planned_duration != null ? (
                            <span>{session.planned_duration} min</span>
                        ) : null}
                        {statusShort ? (
                            <span className="font-medium text-primary/80">{statusShort}</span>
                        ) : null}
                    </div>
                    <ChevronRight className={NEXIA_ROW_CHEVRON} aria-hidden />
                </div>
            </button>
        </li>
    );
}

function AppointmentRow({
    row,
    onOpenAppointment,
}: {
    row: Extract<NormalizedAgendaRow, { kind: "appointment" }>;
    onOpenAppointment: (event: CalendarEvent) => void;
}) {
    const { event } = row;
    const clock = formatCalendarEventClockMadrid(event.starts_at, event.has_explicit_time);
    const title = resolveCalendarEventDisplayTitle(event);

    return (
        <li role="presentation">
            <button
                type="button"
                className={ATHLETE_AGENDA_APPOINTMENT_ROW}
                onClick={() => onOpenAppointment(event)}
            >
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-0.5 text-left">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        {event.location ? (
                            <p className="truncate text-xs text-muted-foreground">{event.location}</p>
                        ) : null}
                    </div>
                    {clock ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                            {clock}
                        </span>
                    ) : null}
                </div>
                <div className="flex items-center justify-end">
                    <ChevronRight className={NEXIA_ROW_CHEVRON} aria-hidden />
                </div>
            </button>
        </li>
    );
}

export const AthleteAgendaDayCard: React.FC<AthleteAgendaDayCardProps> = ({
    dateKey,
    rows,
    filter,
    sessionsById,
    registrationMetaBySessionId,
    onOpenTraining,
    onOpenAppointment,
}) => {
    const todayKey = madridTodayDateKey();
    const isToday = dateKey === todayKey;

    const normalized = useMemo(
        () => filterNormalizedAgendaRows(normalizeAgendaDayRows(rows, sessionsById), filter),
        [rows, sessionsById, filter]
    );

    if (normalized.length === 0) return null;

    const trainingCount = countTrainingSessionsInDay(
        normalizeAgendaDayRows(rows, sessionsById)
    );
    const sessionCountLabel = formatAgendaSessionCountLabel(trainingCount);

    let trainingIndex = 0;

    return (
        <section
            className={cn(ATHLETE_AGENDA_DAY_CARD, isToday && ATHLETE_AGENDA_DAY_CARD_TODAY)}
            aria-label={formatAthleteDateLong(dateKey)}
        >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                    {formatAthleteDateLong(dateKey)}
                    {isToday ? <span className={ATHLETE_AGENDA_TODAY_BADGE}>Hoy</span> : null}
                </h2>
                {sessionCountLabel ? (
                    <p className={ATHLETE_AGENDA_SECTION_LABEL}>{sessionCountLabel}</p>
                ) : null}
            </div>
            <ul className="space-y-2">
                {normalized.map((row) => {
                    if (row.kind === "training") {
                        const index = trainingIndex;
                        trainingIndex += 1;
                        return (
                            <TrainingRow
                                key={`ts-${row.session.id}-${row.linkedEventId ?? "o"}`}
                                row={row}
                                sessionIndex={index}
                                totalTraining={trainingCount}
                                dateKey={dateKey}
                                onOpenTraining={onOpenTraining}
                                registrationMetaBySessionId={registrationMetaBySessionId}
                            />
                        );
                    }
                    return (
                        <AppointmentRow
                            key={`ap-${row.event.id}`}
                            row={row}
                            onOpenAppointment={onOpenAppointment}
                        />
                    );
                })}
            </ul>
        </section>
    );
};
