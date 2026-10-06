/**
 * calendarApi.ts — Global calendar events (AG-2).
 */

import { baseApi } from "./baseApi";
import type { CalendarEventListResponse, CalendarEventsQueryArgs } from "../types/calendar";

export const calendarApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCalendarEvents: builder.query<CalendarEventListResponse, CalendarEventsQueryArgs | void>({
            query: (args) => {
                const params = new URLSearchParams();
                const a = args ?? {};
                if (a.clientId != null) params.set("client_id", String(a.clientId));
                if (a.trainerId != null) params.set("trainer_id", String(a.trainerId));
                if (a.from) {
                    params.set(
                        "from",
                        a.from.includes("T") ? a.from : `${a.from}T00:00:00`
                    );
                }
                if (a.to) {
                    params.set("to", a.to.includes("T") ? a.to : `${a.to}T23:59:59`);
                }
                if (a.eventKind) params.set("event_kind", a.eventKind);
                if (a.skip != null) params.set("skip", String(a.skip));
                if (a.limit != null) params.set("limit", String(a.limit));
                const qs = params.toString();
                return { url: `/calendar/events${qs ? `?${qs}` : ""}`, method: "GET" };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "CalendarEvent" as const,
                              id,
                          })),
                          { type: "CalendarEvent", id: "LIST" },
                      ]
                    : [{ type: "CalendarEvent", id: "LIST" }],
        }),
    }),
});

export const { useGetCalendarEventsQuery, useLazyGetCalendarEventsQuery } = calendarApi;
