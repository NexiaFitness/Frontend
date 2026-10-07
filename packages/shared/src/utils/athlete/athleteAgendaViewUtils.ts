/**
 * athleteAgendaViewUtils.ts — Filtro, filas normalizadas y agrupación semanal (agenda atleta).
 */

import type { CalendarEvent } from "../../types/calendar";
import type { TrainingSession } from "../../types/trainingSessions";
import type { AthleteAgendaDayGroup, AthleteAgendaDayRow } from "./athleteCalendarUtils";
import {
    formatCalendarEventClockMadrid,
    isActiveCalendarEvent,
    trainingSessionDateKey,
} from "./athleteCalendarUtils";
import { formatAgendaMuscleGroupsLine } from "./athleteSessionPlannedLoad";
import { madridTodayDateKey } from "./athleteCalendarUtils";
import { formatAthleteDateLong } from "./athleteSessionUtils";

export type AthleteAgendaFilter = "all" | "training" | "appointments";

export type NormalizedAgendaRow =
    | {
          kind: "training";
          session: TrainingSession;
          clock: string | null;
          linkedEventId: number | null;
      }
    | {
          kind: "appointment";
          event: CalendarEvent;
      };

export function isoWeekdayMondayFirst(dateKey: string): number {
    const [year, month, day] = dateKey.split("-").map(Number);
    const utc = new Date(Date.UTC(year, month - 1, day));
    const sundayZero = utc.getUTCDay();
    return sundayZero === 0 ? 7 : sundayZero;
}

export function mondayOfIsoWeek(dateKey: string): string {
    const weekday = isoWeekdayMondayFirst(dateKey);
    const [year, month, day] = dateKey.split("-").map(Number);
    const utc = new Date(Date.UTC(year, month - 1, day - (weekday - 1)));
    return utc.toISOString().slice(0, 10);
}

export function addCalendarDaysKey(dateKey: string, days: number): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const utc = new Date(Date.UTC(year, month - 1, day + days));
    return utc.toISOString().slice(0, 10);
}

export function resolveSessionClockMadrid(
    session: TrainingSession,
    event: CalendarEvent | null
): string | null {
    if (event?.has_explicit_time) {
        return formatCalendarEventClockMadrid(event.starts_at, true);
    }
    if (session.session_time) {
        return session.session_time.slice(0, 5);
    }
    return null;
}

export function normalizeAgendaDayRows(
    rows: AthleteAgendaDayRow[],
    sessionsById: Map<number, TrainingSession>
): NormalizedAgendaRow[] {
    const normalized: NormalizedAgendaRow[] = [];

    for (const row of rows) {
        if (row.kind === "training_session") {
            normalized.push({
                kind: "training",
                session: row.session,
                clock: resolveSessionClockMadrid(row.session, null),
                linkedEventId: null,
            });
            continue;
        }

        const { event } = row;
        if (!isActiveCalendarEvent(event)) continue;
        if (event.event_kind === "group_class") continue;

        if (
            event.training_session_id != null &&
            (event.event_kind === "personal_workout" || event.event_kind === "appointment")
        ) {
            const linked = sessionsById.get(Number(event.training_session_id));
            if (linked) {
                normalized.push({
                    kind: "training",
                    session: linked,
                    clock: resolveSessionClockMadrid(linked, event),
                    linkedEventId: event.id,
                });
                continue;
            }
        }

        if (event.event_kind === "appointment") {
            normalized.push({ kind: "appointment", event });
        }
    }

    return normalized;
}

export function filterNormalizedAgendaRows(
    rows: NormalizedAgendaRow[],
    filter: AthleteAgendaFilter
): NormalizedAgendaRow[] {
    if (filter === "all") return rows;
    if (filter === "training") {
        return rows.filter((r) => r.kind === "training");
    }
    return rows.filter((r) => r.kind === "appointment");
}

export function filterAgendaDaysFromMonday(
    days: AthleteAgendaDayGroup[],
    fromDateKey: string
): AthleteAgendaDayGroup[] {
    return days.filter((d) => d.dateKey >= fromDateKey);
}

export function countTrainingSessionsInDay(rows: NormalizedAgendaRow[]): number {
    return rows.filter((r) => r.kind === "training").length;
}

export function trainingSessionOrdinalLabel(
    indexAmongTraining: number,
    totalTraining: number
): string | null {
    if (totalTraining < 2) return null;
    return `Sesión ${indexAmongTraining + 1}`;
}

export function formatAgendaSessionCountLabel(count: number): string | null {
    if (count < 2) return null;
    if (count === 2) return "2 sesiones";
    return `${count} sesiones`;
}

export function resolveAgendaTrainingHeadline(session: TrainingSession): string | null {
    const quality = session.agenda_quality_label?.trim();
    if (quality) return quality;
    return null;
}

export function resolveAgendaTrainingSubline(session: TrainingSession): string | null {
    return formatAgendaMuscleGroupsLine(session.agenda_muscle_groups ?? null);
}

export function resolveAgendaWeekSectionLabel(
    weekMondayKey: string,
    todayKey = madridTodayDateKey()
): string {
    const thisMonday = mondayOfIsoWeek(todayKey);
    const nextMonday = addCalendarDaysKey(thisMonday, 7);
    if (weekMondayKey === thisMonday) return "ESTA SEMANA";
    if (weekMondayKey === nextMonday) return "PRÓXIMA SEMANA";
    const [year, month, day] = weekMondayKey.split("-").map(Number);
    const monthNames = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
    ];
    const monthLabel = monthNames[month - 1] ?? String(month);
    return `SEMANA DEL ${day} DE ${monthLabel.toUpperCase()}`;
}

export interface AgendaWeekSection {
    weekMondayKey: string;
    label: string;
    days: AthleteAgendaDayGroup[];
}

export function agendaDayHasVisibleRows(
    day: AthleteAgendaDayGroup,
    sessionsById: Map<number, TrainingSession>,
    filter: AthleteAgendaFilter
): boolean {
    const normalized = filterNormalizedAgendaRows(
        normalizeAgendaDayRows(day.rows, sessionsById),
        filter
    );
    return normalized.length > 0;
}

/** Semanas y días sin contenido para el filtro activo no se renderizan. */
export function filterAgendaWeekSectionsForView(
    sections: AgendaWeekSection[],
    sessionsById: Map<number, TrainingSession>,
    filter: AthleteAgendaFilter
): AgendaWeekSection[] {
    return sections
        .map((section) => ({
            ...section,
            days: section.days.filter((day) =>
                agendaDayHasVisibleRows(day, sessionsById, filter)
            ),
        }))
        .filter((section) => section.days.length > 0);
}

export function groupAgendaDaysByWeek(
    days: AthleteAgendaDayGroup[],
    todayKey = madridTodayDateKey()
): AgendaWeekSection[] {
    const map = new Map<string, AthleteAgendaDayGroup[]>();
    for (const day of days) {
        const monday = mondayOfIsoWeek(day.dateKey);
        const bucket = map.get(monday) ?? [];
        bucket.push(day);
        map.set(monday, bucket);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekMondayKey, weekDays]) => ({
            weekMondayKey,
            label: resolveAgendaWeekSectionLabel(weekMondayKey, todayKey),
            days: weekDays.sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
        }));
}

export function isPastDayInCurrentWeek(
    dateKey: string,
    todayKey = madridTodayDateKey()
): boolean {
    if (dateKey > todayKey) return false;
    return mondayOfIsoWeek(dateKey) === mondayOfIsoWeek(todayKey);
}

export function agendaTrainingStatusShort(
    session: TrainingSession,
    dateKey: string,
    todayKey = madridTodayDateKey()
): "Hecho" | "Pendiente" | null {
    if (!isPastDayInCurrentWeek(dateKey, todayKey)) return null;
    if (session.status === "completed") return "Hecho";
    if (session.status === "skipped" || session.status === "cancelled") return null;
    return "Pendiente";
}

export function buildAgendaTrainingRowAriaLabel(
    session: TrainingSession,
    dateKey: string
): string {
    const headline = resolveAgendaTrainingHeadline(session);
    const muscles = resolveAgendaTrainingSubline(session);
    const parts = [headline, muscles].filter(Boolean);
    const core = parts.length > 0 ? parts.join(", ") : "Entrenamiento";
    return `${core}, ${formatAthleteDateLong(dateKey)}`;
}
