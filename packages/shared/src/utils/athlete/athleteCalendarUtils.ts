/**
 * athleteCalendarUtils.ts — Agenda unificada atleta (AG-2), zona Europe/Madrid.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import type { CalendarEvent } from "../../types/calendar";
import type { TrainingSession } from "../../types/trainingSessions";

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

export type AthleteAgendaDayRow =
    | { kind: "calendar_event"; event: CalendarEvent }
    | { kind: "training_session"; session: TrainingSession };

export interface AthleteAgendaDayGroup {
    dateKey: string;
    rows: AthleteAgendaDayRow[];
}

/** YYYY-MM-DD de la sesión (campo fecha del entrenador, sin instante). */
export function trainingSessionDateKey(session: TrainingSession): string | null {
    if (!session.session_date) return null;
    return session.session_date.split("T")[0];
}

export function isAgendaEligibleTrainingSession(session: TrainingSession): boolean {
    if (!session.session_date) return false;
    if (session.is_active === false) return false;
    if (session.status === "cancelled" || session.status === "skipped") return false;
    return true;
}

function agendaRowSortTier(row: AthleteAgendaDayRow): [number, number] {
    if (row.kind === "training_session") {
        return [0, row.session.id];
    }
    if (!row.event.has_explicit_time) {
        return [1, new Date(row.event.starts_at).getTime()];
    }
    return [2, new Date(row.event.starts_at).getTime()];
}

/**
 * Agenda atleta por día civil (Madrid): une calendario + sesiones sin evento enlazado.
 * Sin hora primero; dedup por training_session_id en eventos activos.
 */
export function mergeAthleteAgendaDaysByMadrid(
    events: CalendarEvent[],
    sessions: TrainingSession[]
): AthleteAgendaDayGroup[] {
    const activeEvents = events.filter(isActiveCalendarEvent);
    const linkedTrainingIds = new Set<number>();
    for (const event of activeEvents) {
        if (event.training_session_id != null) {
            linkedTrainingIds.add(Number(event.training_session_id));
        }
    }

    const eligibleSessions = sessions.filter(isAgendaEligibleTrainingSession);
    const orphanSessions = eligibleSessions.filter(
        (s) => !linkedTrainingIds.has(Number(s.id))
    );

    const dateKeys = new Set<string>();
    for (const event of activeEvents) {
        dateKeys.add(calendarEventDateKeyMadrid(event.starts_at));
    }
    for (const session of eligibleSessions) {
        const key = trainingSessionDateKey(session);
        if (key) dateKeys.add(key);
    }

    return [...dateKeys]
        .sort((a, b) => a.localeCompare(b))
        .map((dateKey) => {
            const dayEvents = activeEvents.filter(
                (e) => calendarEventDateKeyMadrid(e.starts_at) === dateKey
            );
            const dayLinkedIds = new Set(
                dayEvents
                    .map((e) => e.training_session_id)
                    .filter((id): id is number => id != null)
                    .map((id) => Number(id))
            );
            const dayOrphans = orphanSessions.filter(
                (s) =>
                    trainingSessionDateKey(s) === dateKey &&
                    !dayLinkedIds.has(Number(s.id))
            );
            const rows: AthleteAgendaDayRow[] = [
                ...dayOrphans.map((session) => ({
                    kind: "training_session" as const,
                    session,
                })),
                ...dayEvents.map((event) => ({
                    kind: "calendar_event" as const,
                    event,
                })),
            ];
            rows.sort((a, b) => {
                const [tierA, subA] = agendaRowSortTier(a);
                const [tierB, subB] = agendaRowSortTier(b);
                if (tierA !== tierB) return tierA - tierB;
                return subA - subB;
            });
            return { dateKey, rows };
        })
        .filter((day) => day.rows.length > 0);
}

export function resolveTrainingSessionAgendaTitle(session: TrainingSession): string {
    const name = session.session_name?.trim();
    return name || "Entrenamiento";
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
    const weekday = (() => {
        const [year, month, day] = todayKey.split("-").map(Number);
        const utc = new Date(Date.UTC(year, month - 1, day));
        const sundayZero = utc.getUTCDay();
        return sundayZero === 0 ? 7 : sundayZero;
    })();
    const mondayKey = addCalendarDays(todayKey, -(weekday - 1));
    return { from: mondayKey, to: addCalendarDays(todayKey, 90) };
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
