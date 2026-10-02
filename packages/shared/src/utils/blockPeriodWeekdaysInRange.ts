/**
 * blockPeriodWeekdaysInRange.ts — Días ISO (1=lun..7=dom) presentes en [start_date, end_date].
 *
 * Contexto: N4 acota toggles del wizard D-PAP al calendario real del bloque (no días habituales).
 * Convive con calendarWeekForBlock.ts (ordinal semanal); fechas YYYY-MM-DD en hora local.
 *
 * @author NEXIA Shared
 * @since v1.0.3
 */

function parseLocalDate(iso: string): Date | null {
    const [y, m, d] = iso.split("-").map(Number);
    if ([y, m, d].some((n) => Number.isNaN(n))) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
}

/** ISO day-of-week 1..7 for a calendar date in local time. */
export function isoDayOfWeekFromDateISO(dateISO: string): number | null {
    const dt = parseLocalDate(dateISO);
    if (!dt) return null;
    const js = dt.getDay();
    return js === 0 ? 7 : js;
}

/**
 * Sorted unique weekdays (1..7) that occur at least once in the inclusive block range.
 */
export function getWeekdaysPresentInBlockRange(
    startDateISO: string,
    endDateISO: string,
): number[] {
    const start = parseLocalDate(startDateISO);
    const end = parseLocalDate(endDateISO);
    if (!start || !end || end.getTime() < start.getTime()) {
        return [];
    }
    const present = new Set<number>();
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
        const js = cursor.getDay();
        present.add(js === 0 ? 7 : js);
        cursor.setDate(cursor.getDate() + 1);
    }
    return [...present].sort((a, b) => a - b);
}

export function isWeekdayInBlockRange(
    dayOfWeek: number,
    startDateISO: string,
    endDateISO: string,
): boolean {
    if (dayOfWeek < 1 || dayOfWeek > 7) return false;
    return getWeekdaysPresentInBlockRange(startDateISO, endDateISO).includes(
        dayOfWeek,
    );
}

const WEEKDAY_LABELS_ES = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
] as const;

/** null if the weekday is selectable; otherwise a short reason for the UI. */
export function blockWeekdayUnavailableReason(
    dayOfWeek: number,
    startDateISO: string,
    endDateISO: string,
): string | null {
    if (dayOfWeek < 1 || dayOfWeek > 7) {
        return "Día no válido.";
    }
    if (isWeekdayInBlockRange(dayOfWeek, startDateISO, endDateISO)) {
        return null;
    }
    return "Este día no cae dentro del bloque.";
}

export function formatBlockRangeShort(
    startDateISO: string,
    endDateISO: string,
): string {
    return `${startDateISO} — ${endDateISO}`;
}

/** Weekdays in draft patterns that no longer fall inside the block range. */
export function findStructureDaysOutsideBlockRange(
    startDateISO: string,
    endDateISO: string,
    activeDays: readonly number[],
): number[] {
    const allowed = new Set(
        getWeekdaysPresentInBlockRange(startDateISO, endDateISO),
    );
    return [...new Set(activeDays)]
        .filter((d) => !allowed.has(d))
        .sort((a, b) => a - b);
}

export function weekdayLabelEs(dayOfWeek: number): string {
    if (dayOfWeek < 1 || dayOfWeek > 7) return `Día ${dayOfWeek}`;
    return WEEKDAY_LABELS_ES[dayOfWeek - 1];
}
