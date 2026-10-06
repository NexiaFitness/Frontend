/**
 * calendarApi.ts — Global calendar events (AG-2).
 */

import { baseApi } from "./baseApi";
import type { CalendarEventListResponse, CalendarEventsQueryArgs } from "../types/calendar";
import { madridDayEndIso, madridDayStartIso } from "../utils/athlete/athleteCalendarUtils";

export function buildCalendarEventsSearchParams(
    args: CalendarEventsQueryArgs = {}
): URLSearchParams {
    const params = new URLSearchParams();
    if (args.clientId != null) params.set("client_id", String(args.clientId));
    if (args.trainerId != null) params.set("trainer_id", String(args.trainerId));
    if (args.from) {
        params.set("from", args.from.includes("T") ? args.from : madridDayStartIso(args.from));
    }
    if (args.to) {
        params.set("to", args.to.includes("T") ? args.to : madridDayEndIso(args.to));
    }
    if (args.eventKind) params.set("event_kind", args.eventKind);
    if (args.skip != null) params.set("skip", String(args.skip));
    if (args.limit != null) params.set("limit", String(args.limit));
    return params;
}

export const calendarApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCalendarEvents: builder.query<CalendarEventListResponse, CalendarEventsQueryArgs | void>({
            query: (args) => {
                const qs = buildCalendarEventsSearchParams(args ?? {}).toString();
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
