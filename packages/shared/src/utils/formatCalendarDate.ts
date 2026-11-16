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

const MACHINE_SESSION_TITLE_RE =
    /^(Próxima sesión|Hoy —|Esta semana —|Sesión)\s+(.+)$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EN_MONTH_SHORT = new Set([
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
]);

function isMachineDateSuffix(suffix: string): boolean {
    const s = suffix.trim();
    if (ISO_DATE_RE.test(s)) return true;
    const parts = s.split(/\s+/);
    if (parts.length !== 2) return false;
    const day = Number(parts[0]);
    if (!Number.isInteger(day) || day < 1 || day > 31) return false;
    const mon = parts[1].toLowerCase();
    return EN_MONTH_SHORT.has(mon) || (MONTH_SHORT_ES as readonly string[]).includes(mon);
}

/**
 * Títulos de seed (`Próxima sesión 2026-11-22`, `Hoy — 12 Nov`) → fecha ES.
 * No reescribe nombres de constructor (`Fuerza máxima · mar 8 dic`).
 */
export function displaySessionTitle(
    name: string | null | undefined,
    sessionDate: string | null | undefined,
): string {
    const raw = name?.trim() ?? "";
    if (!raw) return formatCalendarDate(sessionDate);
    const match = raw.match(MACHINE_SESSION_TITLE_RE);
    if (match && sessionDate && isMachineDateSuffix(match[2] ?? "")) {
        return `${match[1]} ${formatCalendarDate(sessionDate)}`;
    }
    const dash = raw.lastIndexOf(" — ");
    if (dash >= 0 && sessionDate) {
        const suffix = raw.slice(dash + 3);
        if (isMachineDateSuffix(suffix)) {
            return `${raw.slice(0, dash)} — ${formatCalendarDate(sessionDate)}`;
        }
    }
    return raw;
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
