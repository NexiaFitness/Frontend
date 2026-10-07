/**
 * useAthleteCalendarEvents — GET /calendar/events para portal atleta (solo lectura).
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";
import { useGetCalendarEventsQuery } from "@nexia/shared/api/calendarApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useGetTrainingSessionsByClientQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    athleteCalendarDateWindow,
    athleteCalendarHasPartialFailure,
    filterHomeTodayAppointments,
    mergeAthleteAgendaDaysByMadrid,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";
export function useAthleteCalendarEvents(clientId: number | null | undefined) {
    const { isLoading: profileLoading } = useAthleteContext();
    const window = useMemo(() => athleteCalendarDateWindow(), []);

    const calendarQueryArg =
        clientId != null && clientId > 0
            ? {
                  clientId,
                  from: window.from,
                  to: window.to,
                  limit: 300,
              }
            : skipToken;

    const {
        data,
        isLoading: eventsLoading,
        isError: eventsError,
        refetch: refetchEvents,
    } = useGetCalendarEventsQuery(calendarQueryArg);

    const {
        data: sessions = [],
        isLoading: sessionsLoading,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetTrainingSessionsByClientQuery(
        clientId
            ? {
                  clientId,
                  limit: 200,
                  dateFrom: window.from,
                  dateTo: window.to,
              }
            : 0,
        { skip: !clientId }
    );

    const events = useMemo(() => data?.items ?? [], [data?.items]);

    const sessionsById = useMemo(() => {
        const map = new Map<number, TrainingSession>();
        for (const s of sessions) map.set(s.id, s);
        return map;
    }, [sessions]);

    const todayAppointments = useMemo(
        () => filterHomeTodayAppointments(events),
        [events]
    );

    const groupedDays = useMemo(
        () => mergeAthleteAgendaDaysByMadrid(events, sessions),
        [events, sessions]
    );

    return {
        events,
        todayAppointments,
        groupedDays,
        sessionsById,
        isLoading: profileLoading || eventsLoading || sessionsLoading,
        isError: athleteCalendarHasPartialFailure(eventsError, sessionsError),
        refetchEvents,
        refetchSessions,
    };
}
