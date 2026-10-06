/**
 * athleteCalendarUtils.ts — Agenda unificada atleta (AG-2), zona Europe/Madrid.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import type { CalendarEvent } from "../../types/calendar";

export const ATHLETE_CALENDAR_TIMEZONE = "Europe/Madrid";

const MADRID_OFFSETS = ["+01:00", "+02:00"] as const;

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

const madridClockPartsFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATHLETE_CALENDAR_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

export type MadridCivilTimeIssue = "nonexistent" | "ambiguous";

export const MADRID_CIVIL_TIME_TRAINER_MESSAGE: Record<MadridCivilTimeIssue, string> = {
    nonexistent:
        "Esa hora no existe en Madrid ese día (cambio de horario de primavera). Elige otra hora.",
    ambiguous:
        "Esa hora ocurre dos veces en Madrid ese día (cambio de horario de otoño). Elige una hora anterior o posterior al solape.",
};

function pad2(value: string | undefined): string {
    return (value ?? "00").padStart(2, "0");
}

function formatMadridClockHms(instant: Date): string {
    const parts = madridClockPartsFormatter.formatToParts(instant);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value;
    return `${pad2(get("hour"))}:${pad2(get("minute"))}:${pad2(get("second"))}`;
}

function normalizeCivilClock(clock: string): string | null {
    const trimmed = clock.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(":");
    if (parts.length < 2) return null;
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const s = (parts[2] ?? "00").padStart(2, "0");
    return `${h}:${m}:${s}`;
}

/** Instants that round-trip to the given Madrid civil date+clock. */
export function madridCivilInstants(dateKey: string, clock: string): Date[] {
    const normalized = normalizeCivilClock(clock);
    if (!dateKey || !normalized) return [];
    const found: Date[] = [];
    const seen = new Set<number>();
    for (const offset of MADRID_OFFSETS) {
        const iso = `${dateKey}T${normalized}${offset}`;
        const instant = new Date(iso);
        if (Number.isNaN(instant.getTime())) continue;
        if (madridDateFormatter.format(instant) !== dateKey) continue;
        if (formatMadridClockHms(instant) !== normalized) continue;
        if (seen.has(instant.getTime())) continue;
        seen.add(instant.getTime());
        found.push(instant);
    }
    return found;
}

export function madridCivilTimeIssue(
    dateKey: string,
    clock: string
): MadridCivilTimeIssue | null {
    if (!dateKey || !clock.trim()) return null;
    const instants = madridCivilInstants(dateKey, clock);
    if (instants.length === 0) return "nonexistent";
    if (instants.length > 1) return "ambiguous";
    return null;
}

export function madridTrainerTimeError(dateKey: string, clock: string): string | null {
    const issue = madridCivilTimeIssue(dateKey, clock);
    return issue ? MADRID_CIVIL_TIME_TRAINER_MESSAGE[issue] : null;
}

export function madridDayStartIso(dateKey: string): string {
    const instant = madridCivilInstants(dateKey, "00:00:00")[0];
    return instant ? instant.toISOString() : `${dateKey}T00:00:00+01:00`;
}

export function madridDayEndIso(dateKey: string): string {
    const instant = madridCivilInstants(dateKey, "23:59:59")[0];
    return instant ? instant.toISOString() : `${dateKey}T23:59:59+01:00`;
}

/** YYYY-MM-DD del instante en Europe/Madrid. */
export function madridTodayDateKey(instant = new Date()): string {
    return madridDateFormatter.format(instant);
}

function addCalendarDays(dateKey: string, days: number): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const utc = new Date(Date.UTC(year, month - 1, day + days));
    return utc.toISOString().slice(0, 10);
}

/** YYYY-MM-DD del instante del evento en Europe/Madrid. */
export function calendarEventDateKeyMadrid(startsAtIso: string): string {
    const instant = new Date(startsAtIso);
    return madridDateFormatter.format(instant);
}

export function isCalendarEventTodayMadrid(
    event: CalendarEvent,
    today = new Date()
): boolean {
    return calendarEventDateKeyMadrid(event.starts_at) === madridTodayDateKey(today);
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
    const todayKey = madridTodayDateKey(today);
    return events
        .filter(isActiveCalendarEvent)
        .filter((e) => e.event_kind === "appointment")
        .filter((e) => calendarEventDateKeyMadrid(e.starts_at) === todayKey)
        .sort(
            (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        );
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
            events: [...dayEvents].sort(
                (a, b) =>
                    new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
            ),
        }));
}

export function athleteCalendarDateWindow(now = new Date()): { from: string; to: string } {
    const todayKey = madridTodayDateKey(now);
    return { from: addCalendarDays(todayKey, -14), to: addCalendarDays(todayKey, 90) };
}

export function athleteCalendarHasPartialFailure(
    eventsError: boolean,
    sessionsError: boolean
): boolean {
    return eventsError || sessionsError;
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
