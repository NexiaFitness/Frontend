/**
 * suggestSessionDate.ts — Sugerencia de fechas para sesiones en bloques de periodización
 *
 * Contexto:
 * - B13 / SessionReviewPage: `suggestNextSessionDateAfter` (siguiente día con patrón en structure).
 *
 * Notas de mantenimiento:
 * - Fechas YYYY-MM-DD en hora local (sin toISOString UTC).
 * - day_of_week ISO 1=lunes … 7=domingo (alineado con weeklyStructure y backend context_resolve).
 *
 * @author Frontend Team
 * @since v6.7.0 — B13 Programar siguiente sesión
 */

import type { WeeklyStructureWeek } from "../../types/weeklyStructure";
import { getBlockCalendarWeekOrdinal } from "../calendarWeekForBlock";

export interface SessionDateCarrier {
    session_date: string | null;
}

function parseLocalDate(iso: string): Date | null {
    const [y, m, d] = iso.split("-").map(Number);
    if ([y, m, d].some((n) => Number.isNaN(n))) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
}

function toLocalISO(dt: Date): string {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function addDaysLocal(dateISO: string, days: number): string | null {
    const dt = parseLocalDate(dateISO);
    if (!dt) return null;
    dt.setDate(dt.getDate() + days);
    return toLocalISO(dt);
}

function maxDateISO(a: string, b: string): string {
    return a >= b ? a : b;
}

function collectUsedSessionDates(sessions: SessionDateCarrier[]): Set<string> {
    const used = new Set<string>();
    for (const s of sessions) {
        if (typeof s.session_date === "string" && s.session_date.length > 0) {
            used.add(s.session_date);
        }
    }
    return used;
}

function isoDayOfWeek(dateISO: string): number | null {
    const dt = parseLocalDate(dateISO);
    if (!dt) return null;
    const jsDay = dt.getDay();
    return jsDay === 0 ? 7 : jsDay;
}

function hasPatternOnDate(
    dateISO: string,
    blockStart: string,
    weeklyStructureWeeks: WeeklyStructureWeek[],
): boolean {
    const dayOfWeek = isoDayOfWeek(dateISO);
    if (dayOfWeek == null) return false;
    const weekOrdinal = getBlockCalendarWeekOrdinal(dateISO, blockStart);
    const week = weeklyStructureWeeks.find((w) => w.week_ordinal === weekOrdinal);
    const day = week?.days.find((d) => d.day_of_week === dayOfWeek);
    return (day?.patterns.length ?? 0) > 0;
}

function suggestFirstFreeSessionDateAfter(
    afterDate: string,
    blockStart: string,
    blockEnd: string,
    sessionsInBlock: SessionDateCarrier[],
): string | null {
    const used = collectUsedSessionDates(sessionsInBlock);
    const dayAfter = addDaysLocal(afterDate, 1);
    if (!dayAfter) return null;
    const startISO = maxDateISO(blockStart, dayAfter);

    const start = parseLocalDate(startISO);
    const end = parseLocalDate(blockEnd);
    if (!start || !end) return null;

    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
        const iso = toLocalISO(cursor);
        if (!used.has(iso)) {
            return iso;
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return null;
}

/**
 * Primer día estrictamente posterior a `afterDate` en el bloque que:
 * - tiene al menos un patrón en weekly structure para su week_ordinal / day_of_week, y
 * - no tiene sesión en `sessionsInBlock`.
 *
 * Si no hay días con patrón en structure, degrada a primer día libre después de afterDate.
 */
export function suggestNextSessionDateAfter(
    afterDate: string,
    blockStart: string,
    blockEnd: string,
    weeklyStructureWeeks: WeeklyStructureWeek[],
    sessionsInBlock: SessionDateCarrier[],
): string | null {
    const used = collectUsedSessionDates(sessionsInBlock);
    const dayAfter = addDaysLocal(afterDate, 1);
    if (!dayAfter) return null;
    const startISO = maxDateISO(blockStart, dayAfter);

    const hasAnyPatternDay = weeklyStructureWeeks.some((w) =>
        w.days.some((d) => d.patterns.length > 0),
    );
    if (!hasAnyPatternDay) {
        return suggestFirstFreeSessionDateAfter(
            afterDate,
            blockStart,
            blockEnd,
            sessionsInBlock,
        );
    }

    const start = parseLocalDate(startISO);
    const end = parseLocalDate(blockEnd);
    if (!start || !end || start.getTime() > end.getTime()) return null;

    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
        const iso = toLocalISO(cursor);
        if (!used.has(iso) && hasPatternOnDate(iso, blockStart, weeklyStructureWeeks)) {
            return iso;
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    return null;
}
