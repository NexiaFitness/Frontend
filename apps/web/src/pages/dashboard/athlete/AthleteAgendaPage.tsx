/**
 * AthleteAgendaPage.tsx — Agenda unificada solo lectura (AG-2).
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import React, { useCallback } from "react";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    formatCalendarEventClockMadrid,
    madridTodayDateKey,
    resolveCalendarEventDisplayTitle,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { AthleteSessionLoadIndicator } from "@/components/athlete/AthleteSessionLoadIndicator";
import { Alert } from "@/components/ui/feedback";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import {
    ATHLETE_AGENDA_DAY_CARD,
    ATHLETE_AGENDA_DAY_CARD_TODAY,
    ATHLETE_AGENDA_PAGE,
    ATHLETE_AGENDA_TODAY_BADGE,
} from "@/components/athlete/athleteAgendaPresentation";
import { useAthleteCalendarEvents } from "@/hooks/athlete/useAthleteCalendarEvents";
import { cn } from "@/lib/utils";

export const AthleteAgendaPage: React.FC = () => {
    const { clientId, isLoading: profileLoading, isError: profileError } = useAthleteContext();
    const {
        groupedDays,
        loadModelForDate,
        isLoading,
        isError,
        refetchEvents,
        refetchSessions,
    } = useAthleteCalendarEvents(clientId);

    const handleRefresh = useCallback(async () => {
        await Promise.all([refetchEvents(), refetchSessions()]);
    }, [refetchEvents, refetchSessions]);

    if (profileLoading || isLoading) {
        return <AthletePageLoading variant="sessions-list" />;
    }

    if (profileError || !clientId) {
        return (
            <div className={cn(ATHLETE_PAGE, "px-4 pt-4")}>
                <Alert
                    variant="error"
                    title="No pudimos cargar tu perfil"
                    description="Comprueba tu conexión e inténtalo de nuevo."
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cn(ATHLETE_PAGE, "px-4 pt-4")}>
                <Alert
                    variant="error"
                    title="No pudimos cargar tu agenda"
                    description="Comprueba tu conexión e inténtalo de nuevo."
                />
            </div>
        );
    }

    const todayKey = madridTodayDateKey();

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div
                className={cn(ATHLETE_PAGE, ATHLETE_AGENDA_PAGE)}
                data-testid="athlete-agenda-page"
            >
                <header className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Mi agenda
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Citas y entrenos programados · horario de Madrid
                    </p>
                </header>

                {groupedDays.length === 0 ? (
                    <AthleteEmptyState
                        variant="plan"
                        title="Sin eventos próximos"
                        description="Cuando tu entrenador agende citas o fije hora en tus sesiones, aparecerán aquí."
                    />
                ) : (
                    <div className="space-y-5">
                        {groupedDays.map(({ dateKey, events }) => {
                            const dayLoad = loadModelForDate(dateKey);
                            const isToday = dateKey === todayKey;
                            return (
                                <section
                                    key={dateKey}
                                    className={cn(
                                        ATHLETE_AGENDA_DAY_CARD,
                                        isToday && ATHLETE_AGENDA_DAY_CARD_TODAY
                                    )}
                                    aria-label={formatAthleteDateLong(dateKey)}
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h2 className="text-sm font-semibold text-foreground">
                                            {formatAthleteDateLong(dateKey)}
                                            {isToday ? (
                                                <span className={ATHLETE_AGENDA_TODAY_BADGE}>
                                                    Hoy
                                                </span>
                                            ) : null}
                                        </h2>
                                        {dayLoad.sessionCount > 0 ? (
                                            <AthleteSessionLoadIndicator
                                                model={dayLoad}
                                                autoShowHelpOnce={isToday}
                                            />
                                        ) : null}
                                    </div>
                                    <ul className="space-y-3">
                                        {events.map((event) => {
                                            const clock = formatCalendarEventClockMadrid(
                                                event.starts_at,
                                                event.has_explicit_time
                                            );
                                            return (
                                                <li
                                                    key={event.id}
                                                    className="flex items-start justify-between gap-3 text-sm"
                                                >
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p className="font-medium text-foreground">
                                                            {resolveCalendarEventDisplayTitle(event)}
                                                        </p>
                                                        {event.location ? (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {event.location}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {clock ? (
                                                            <span className="tabular-nums text-muted-foreground">
                                                                {clock}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                Todo el día
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
};
