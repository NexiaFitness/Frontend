/**
 * formatCalendarDate.ts — Fechas de calendario YYYY-MM-DD para UI (es-ES estable).
 *
 * Independiente del locale del SO. Evita el desfase UTC de `new Date("YYYY-MM-DD")`.
 */

import { parseISODateLocal } from "./periodBlockOverlap";

const MONTH_SHORT_ES = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
] as const;

const WEEKDAY_LONG_ES = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
] as const;

function calendarDatePart(iso: string): string {
    const trimmed = iso.trim();
    return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

function parseCalendarDate(iso: string): Date | null {
    return parseISODateLocal(calendarDatePart(iso));
}

/** «11 nov 2026» — listado, revisión y fechas cortas de sesión. */
export function formatCalendarDate(
    iso: string | null | undefined,
    empty = "—",
): string {
    if (!iso?.trim()) return empty;
    const dt = parseCalendarDate(iso);
    if (!dt) return iso;
    return `${dt.getDate()} ${MONTH_SHORT_ES[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** «miércoles 11 nov 2026» — titular de detalle. */
export function formatCalendarDateLong(
    iso: string | null | undefined,
    empty = "Sin fecha",
): string {
    if (!iso?.trim()) return empty;
    const dt = parseCalendarDate(iso);
    if (!dt) return iso;
    return `${WEEKDAY_LONG_ES[dt.getDay()]} ${dt.getDate()} ${MONTH_SHORT_ES[dt.getMonth()]} ${dt.getFullYear()}`;
}
