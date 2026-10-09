/**
 * athleteProgressPeriod.ts — Ventanas de tiempo de Mi progreso (V10).
 * Contexto: builders puros; la URL `?period=` vive en la page.
 * Notas de mantenimiento: fechas locales YYYY-MM-DD; 30d/90d son inclusivos hasta hoy.
 * @author Frontend Team
 * @since v1.0.3
 */

import { getMondayOfWeekLocal } from "../calendarWeekForBlock";
import { parseSessionDateLocal, toLocalDateKey } from "./athleteSessionUtils";

export type AthleteProgressPeriodId = "30d" | "90d" | "all";

export interface AthleteDateRange {
    start: string;
    end: string;
}

export const ATHLETE_PROGRESS_PERIODS: readonly AthleteProgressPeriodId[] = [
    "30d",
    "90d",
    "all",
] as const;

const PERIOD_DAYS: Record<Exclude<AthleteProgressPeriodId, "all">, number> = {
    "30d": 30,
    "90d": 90,
};

export function parseAthleteProgressPeriod(
    raw: string | null | undefined
): AthleteProgressPeriodId {
    if (raw === "90d" || raw === "all" || raw === "30d") return raw;
    return "30d";
}

export function athleteProgressPeriodLabel(period: AthleteProgressPeriodId): string {
    if (period === "90d") return "90 días";
    if (period === "all") return "desde el inicio";
    return "30 días";
}

export function athleteProgressPeriodShortLabel(period: AthleteProgressPeriodId): string {
    if (period === "90d") return "90 días";
    if (period === "all") return "Todo";
    return "30 días";
}

export function athleteProgressDeltaWindowLabel(period: AthleteProgressPeriodId): string {
    if (period === "90d") return "en 90 días";
    if (period === "all") return "en el historial";
    return "en 30 días";
}

export function addLocalDateDays(isoDate: string, days: number): string {
    const date = parseSessionDateLocal(isoDate);
    date.setDate(date.getDate() + days);
    return toLocalDateKey(date);
}

export function athleteDayKey(today: Date = new Date()): string {
    return toLocalDateKey(today);
}

export function athleteProgressPeriodRange(
    period: AthleteProgressPeriodId,
    todayKey: string,
    historyStart: string | null
): AthleteDateRange {
    if (period === "all") {
        return { start: historyStart ?? todayKey, end: todayKey };
    }
    const span = PERIOD_DAYS[period];
    return { start: addLocalDateDays(todayKey, -(span - 1)), end: todayKey };
}

export function athleteProgressPreviousPeriodRange(
    period: AthleteProgressPeriodId,
    current: AthleteDateRange
): AthleteDateRange | null {
    if (period === "all") return null;
    const span = PERIOD_DAYS[period];
    const end = addLocalDateDays(current.start, -1);
    const start = addLocalDateDays(end, -(span - 1));
    return { start, end };
}

export function isDateInAthleteRange(
    isoDate: string | null | undefined,
    range: AthleteDateRange
): boolean {
    if (!isoDate) return false;
    const key = isoDate.slice(0, 10);
    return key >= range.start && key <= range.end;
}

export function formatWeekAxisLabel(mondayIso: string): string {
    const date = parseSessionDateLocal(mondayIso);
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

export function iterateMondaysInclusive(rangeStart: string, rangeEnd: string): string[] {
    const startMon = getMondayOfWeekLocal(rangeStart);
    const endMon = getMondayOfWeekLocal(rangeEnd);
    const mondays: string[] = [];
    let cursor = startMon;
    while (cursor <= endMon) {
        mondays.push(cursor);
        cursor = addLocalDateDays(cursor, 7);
    }
    return mondays;
}
