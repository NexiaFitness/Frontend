/**
 * calendarWeekForBlock.ts — Semanas calendario (lunes–domingo) dentro de un bloque.
 *
 * Contexto: `week_ordinal` de PlanPeriodBlock se ancla al lunes de la semana que
 * contiene `block.start_date`, no a bloques de 7 días desde start_date.
 * Compartido por weeklyStructure (FE) y debe reflejarse en planning/helpers (BE).
 *
 * Notas de mantenimiento: fechas en hora local (YYYY-MM-DD), day_of_week ISO 1=lun..7=dom.
 * @author Frontend Team
 * @since v6.4.0
 */

function parseLocalDate(iso: string): Date | null {
    const [y, m, d] = iso.split("-").map(Number);
    if ([y, m, d].some((n) => Number.isNaN(n))) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
}

function toLocalISO(dt: Date): string {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Devuelve el lunes (ISO) de la semana calendario que contiene `dateISO`.
 */
export function getMondayOfWeekLocal(dateISO: string): string {
    const dt = parseLocalDate(dateISO);
    if (!dt) return dateISO;
    const jsDay = dt.getDay();
    const diff = jsDay === 0 ? -6 : 1 - jsDay;
    dt.setDate(dt.getDate() + diff);
    return toLocalISO(dt);
}

/**
 * Ordinal 1-based de la semana calendario de `dateISO` dentro del bloque
 * que empieza en `blockStartISO`.
 */
export function getBlockCalendarWeekOrdinal(
    dateISO: string,
    blockStartISO: string,
): number {
    const anchorMonday = parseLocalDate(getMondayOfWeekLocal(blockStartISO));
    const dateMonday = parseLocalDate(getMondayOfWeekLocal(dateISO));
    if (!anchorMonday || !dateMonday) return 1;
    const diffMs = dateMonday.getTime() - anchorMonday.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
}

/**
 * Número de semanas calendario que cubre el rango [blockStart, blockEnd].
 */
export function getBlockCalendarWeekCount(
    blockStartISO: string,
    blockEndISO: string,
): number {
    const start = parseLocalDate(blockStartISO);
    const end = parseLocalDate(blockEndISO);
    if (!start || !end || end.getTime() < start.getTime()) return 0;
    return getBlockCalendarWeekOrdinal(blockEndISO, blockStartISO);
}

/**
 * Etiqueta corta lun–dom de la semana ordinal N del bloque (semana calendario completa).
 */
export function formatCalendarWeekRange(
    weekOrdinal: number,
    blockStartISO: string,
): string {
    const anchor = parseLocalDate(getMondayOfWeekLocal(blockStartISO));
    if (!anchor || weekOrdinal < 1) return "";
    const start = new Date(anchor);
    start.setDate(start.getDate() + (weekOrdinal - 1) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (dt: Date) =>
        dt.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
}
