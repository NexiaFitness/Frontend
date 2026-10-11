/**
 * businessCalendar.ts — Día calendario de negocio (Europe/Madrid, D-REP-6).
 *
 * Contexto: paridad con backend/app/domain/business_calendar.py para «hoy»
 * en planificación (repetir semana, apply-template, replicar sesión).
 * Usa Intl.DateTimeFormat con timeZone (Hermes / JSC soportan timeZone en RN).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { addDaysToLocalISO } from "./calendarWeekForBlock";

export const BUSINESS_TIMEZONE = "Europe/Madrid";

/** YYYY-MM-DD en Europe/Madrid para un instante (UTC-aware). */
export function businessDayYmdFromInstant(instant: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: BUSINESS_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(instant);
}

/** Hoy de negocio (Europe/Madrid). */
export function businessTodayYmd(instant: Date = new Date()): string {
    return businessDayYmdFromInstant(instant);
}

/** Domingo (YYYY-MM-DD) de una semana cuyo lunes es weekMondayYmd. */
export function weekSundayYmd(weekMondayYmd: string): string {
    return addDaysToLocalISO(weekMondayYmd, 6);
}

/** Semana terminada: su domingo es anterior a todayYmd (D-REP-6 / D2). */
export function isWeekFinished(weekMondayYmd: string, todayYmd: string): boolean {
    return weekSundayYmd(weekMondayYmd) < todayYmd;
}
