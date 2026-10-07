/**
 * AthleteAgendaPage.tsx — Agenda unificada atleta (AGENDA_ATLETA_SPEC).
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useGetAthleteSessionsRegistrationMetaQuery } from "@nexia/shared/api/athleteApi";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { Alert } from "@/components/ui/feedback";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { ATHLETE_AGENDA_PAGE, ATHLETE_AGENDA_WEEK_HEADING } from "@/components/athlete/athleteAgendaPresentation";
import { useAthleteCalendarEvents } from "@/hooks/athlete/useAthleteCalendarEvents";
import { cn } from "@/lib/utils";
import { AthleteAgendaPageHeader } from "@/components/athlete/agenda/AthleteAgendaPageHeader";
import { AthleteAgendaFilterChips } from "@/components/athlete/agenda/AthleteAgendaFilterChips";
import { AthleteAgendaDayCard } from "@/components/athlete/agenda/AthleteAgendaDayCard";
import { AthleteAppointmentDetailSheet } from "@/components/athlete/agenda/AthleteAppointmentDetailSheet";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import type { AthleteAgendaFilter } from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import {
    filterAgendaDaysFromMonday,
    filterAgendaWeekSectionsForView,
    groupAgendaDaysByWeek,
} from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import { athleteCalendarDateWindow } from "@nexia/shared/utils/athlete/athleteCalendarUtils";

const AGENDA_SCROLL_KEY = "nexia_athlete_agenda_scroll_y";

export const AthleteAgendaPage: React.FC = () => {
    const navigate = useNavigate();
    const { clientId, isLoading: profileLoading, isError: profileError } = useAthleteContext();
    const [filter, setFilter] = useState<AthleteAgendaFilter>("all");
    const [appointmentSheet, setAppointmentSheet] = useState<CalendarEvent | null>(null);

    const {
        groupedDays,
        sessionsById,
        isLoading,
        isError,
        refetchEvents,
        refetchSessions,
    } = useAthleteCalendarEvents(clientId);

    const calendarWindow = useMemo(() => athleteCalendarDateWindow(), []);

    const { data: registrationMetaPage } = useGetAthleteSessionsRegistrationMetaQuery(
        { dateFrom: calendarWindow.from, dateTo: calendarWindow.to },
        { skip: !clientId }
    );

    const registrationMetaBySessionId = useMemo(() => {
        const map = new Map<number, NonNullable<typeof registrationMetaPage>["items"][number]>();
        for (const row of registrationMetaPage?.items ?? []) {
            map.set(row.training_session_id, row);
        }
        return map;
    }, [registrationMetaPage]);

    const windowFrom = calendarWindow.from;

    const visibleDays = useMemo(
        () => filterAgendaDaysFromMonday(groupedDays, windowFrom),
        [groupedDays, windowFrom]
    );

    const weekSections = useMemo(
        () =>
            filterAgendaWeekSectionsForView(
                groupAgendaDaysByWeek(visibleDays),
                sessionsById,
                filter
            ),
        [visibleDays, sessionsById, filter]
    );

    const hasVisibleContent = weekSections.length > 0;

    useEffect(() => {
        const raw = sessionStorage.getItem(AGENDA_SCROLL_KEY);
        if (!raw) return;
        const y = Number(raw);
        if (!Number.isFinite(y)) return;
        window.scrollTo(0, y);
        sessionStorage.removeItem(AGENDA_SCROLL_KEY);
    }, [hasVisibleContent]);

    const handleRefresh = useCallback(async () => {
        await Promise.all([refetchEvents(), refetchSessions()]);
    }, [refetchEvents, refetchSessions]);

    const handleOpenTraining = useCallback(
        (path: string) => {
            sessionStorage.setItem(AGENDA_SCROLL_KEY, String(window.scrollY));
            navigate(path, { state: { from: "agenda" } });
        },
        [navigate]
    );

    const handleOpenAppointment = useCallback((event: CalendarEvent) => {
        setAppointmentSheet(event);
    }, []);

    if (profileLoading || isLoading) {
        return <AthletePageLoading variant="agenda" />;
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

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div
                className={cn(ATHLETE_PAGE, ATHLETE_AGENDA_PAGE)}
                data-testid="athlete-agenda-page"
            >
                <AthleteAgendaPageHeader />

                <AthleteAgendaFilterChips value={filter} onChange={setFilter} />

                {!hasVisibleContent ? (
                    <AthleteEmptyState
                        variant="plan"
                        title="Sin entrenos ni citas próximos"
                        description="Cuando tu entrenador programe sesiones o citas en las próximas semanas, aparecerán aquí."
                    />
                ) : (
                    <div className="space-y-6">
                        {weekSections.map((section) => (
                            <div key={section.weekMondayKey} className="space-y-4">
                                <h2 className={ATHLETE_AGENDA_WEEK_HEADING}>{section.label}</h2>
                                <div className="space-y-4">
                                    {section.days.map((day) => (
                                        <AthleteAgendaDayCard
                                            key={day.dateKey}
                                            dateKey={day.dateKey}
                                            rows={day.rows}
                                            filter={filter}
                                            sessionsById={sessionsById}
                                            registrationMetaBySessionId={
                                                registrationMetaBySessionId
                                            }
                                            onOpenTraining={handleOpenTraining}
                                            onOpenAppointment={handleOpenAppointment}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AthleteAppointmentDetailSheet
                event={appointmentSheet}
                isOpen={appointmentSheet != null}
                onClose={() => setAppointmentSheet(null)}
            />
        </PullToRefresh>
    );
};
