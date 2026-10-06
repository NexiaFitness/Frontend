/**
 * athleteCalendarUtils.ts — Agenda unificada atleta (AG-2), zona Europe/Madrid.
 */

import type { CalendarEvent } from "../../types/calendar";
import { toLocalDateKey } from "./athleteSessionUtils";

export const ATHLETE_CALENDAR_TIMEZONE = "Europe/Madrid";

const madridDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATHLETE_CALENDAR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const madridTimeFormatter = new Intl.DateTimeFormat("es-ES", {
    timeZone: ATHLETE_CALENDAR_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

/** YYYY-MM-DD del instante del evento en Europe/Madrid. */
export function calendarEventDateKeyMadrid(startsAtIso: string): string {
    const instant = new Date(startsAtIso);
    return madridDateFormatter.format(instant);
}

export function isCalendarEventTodayMadrid(
    event: CalendarEvent,
    today = new Date()
): boolean {
    return calendarEventDateKeyMadrid(event.starts_at) === toLocalDateKey(today);
}

export function formatCalendarEventClockMadrid(
    startsAtIso: string,
    hasExplicitTime: boolean
): string | null {
    if (!hasExplicitTime) return null;
    const instant = new Date(startsAtIso);
    if (Number.isNaN(instant.getTime())) return null;
    return madridTimeFormatter.format(instant);
}

export function resolveCalendarEventDisplayTitle(event: CalendarEvent): string {
    if (event.title?.trim()) return event.title.trim();
    if (event.event_kind === "personal_workout") return "Entrenamiento";
    if (event.event_kind === "group_class") return "Clase grupal";
    return "Cita";
}

export function isActiveCalendarEvent(event: CalendarEvent): boolean {
    return event.is_active && event.status !== "cancelled";
}

/** Citas (evaluación, consulta, etc.) para Home — no duplica el hero de entreno. */
export function filterHomeTodayAppointments(
    events: CalendarEvent[],
    today = new Date()
): CalendarEvent[] {
    const todayKey = toLocalDateKey(today);
    return events
        .filter(isActiveCalendarEvent)
        .filter((e) => e.event_kind === "appointment")
        .filter((e) => calendarEventDateKeyMadrid(e.starts_at) === todayKey)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export interface CalendarEventsByDay {
    dateKey: string;
    events: CalendarEvent[];
}

export function groupCalendarEventsByDayMadrid(
    events: CalendarEvent[]
): CalendarEventsByDay[] {
    const active = events.filter(isActiveCalendarEvent);
    const map = new Map<string, CalendarEvent[]>();
    for (const event of active) {
        const key = calendarEventDateKeyMadrid(event.starts_at);
        const bucket = map.get(key) ?? [];
        bucket.push(event);
        map.set(key, bucket);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, dayEvents]) => ({
            dateKey,
            events: [...dayEvents].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        }));
}

export function athleteCalendarDateWindow(): { from: string; to: string } {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90);
    return { from: toLocalDateKey(from), to: toLocalDateKey(to) };
}

/** Normaliza HH:MM del picker a payload API (HH:MM:SS). */
export function normalizeSessionTimeForApi(clock: string): string | null {
    const trimmed = clock.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(":");
    if (parts.length < 2) return null;
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    return `${h}:${m}:00`;
}

/** HH:MM para TimePicker desde valor API. */
export function sessionTimeToPickerValue(sessionTime: string | null | undefined): string {
    if (!sessionTime) return "";
    return sessionTime.slice(0, 5);
}
