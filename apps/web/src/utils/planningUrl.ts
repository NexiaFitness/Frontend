/**
 * planningUrl.ts — Utilidades para estado de planificación en URL (month/week)
 *
 * Usado por ClientPlanningTab para leer/escribir ?month=YYYY-MM&week=N.
 * week = índice de semana dentro del mes, 1–4 (convención del plan).
 *
 * @author Frontend Team
 * @since Fase 1 U3 — estado en URL
 */

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function formatMonth(date: Date): string {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    return `${y}-${String(m).padStart(2, "0")}`;
}

export function parseMonthToDate(monthStr: string): Date {
    if (!MONTH_REGEX.test(monthStr)) return new Date();
    const [y, m] = monthStr.split("-").map(Number);
    return new Date(y, m - 1, 1);
}

export function getDefaultPlanningMonth(): string {
    return formatMonth(new Date());
}

/** Semana dentro del mes, 1–4. Basado en día del mes. */
export function getDefaultPlanningWeek(): number {
    const d = new Date().getDate();
    const week = Math.ceil(d / 7);
    return Math.max(1, Math.min(4, week));
}

export function validatePlanningMonth(value: string): boolean {
    return MONTH_REGEX.test(value);
}

export function validatePlanningWeek(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 4;
}
