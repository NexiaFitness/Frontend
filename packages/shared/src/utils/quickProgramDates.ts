/**
 * quickProgramDates.ts — Fechas derivadas para Quick Program (alineado BE helpers).
 *
 * Convención: semanas calendario lun–dom ancladas al lunes de la semana de start_date.
 */

import { getBlockCalendarWeekCount, getMondayOfWeekLocal } from "./calendarWeekForBlock";
import { parseISODateLocal, toLocalISO, type DateRange } from "./periodBlockOverlap";

/** Suma días a una fecha local YYYY-MM-DD. */
export function addDaysLocal(dateISO: string, days: number): string {
    const dt = parseISODateLocal(dateISO);
    if (!dt) return dateISO;
    dt.setDate(dt.getDate() + days);
    return toLocalISO(dt);
}

/** Día siguiente (contiguo) a una fecha local YYYY-MM-DD. */
export function dayAfterLocal(dateISO: string): string {
    return addDaysLocal(dateISO, 1);
}

/**
 * Último día (domingo) de la semana calendario N del bloque que empieza en blockStartISO.
 * Alineado con `block_calendar_week_count` + semanas lun–dom del BE.
 */
export function deriveBlockEndFromWeekCount(
    blockStartISO: string,
    weekCount: number,
): string {
    if (weekCount < 1) return blockStartISO;
    const anchorMonday = getMondayOfWeekLocal(blockStartISO);
    const lastWeekMonday = addDaysLocal(anchorMonday, (weekCount - 1) * 7);
    return addDaysLocal(lastWeekMonday, 6);
}

/** Verifica coherencia weekCount ↔ rango [start, end] (convención calendario). */
export function isWeekCountCoherentWithRange(
    startISO: string,
    endISO: string,
    weekCount: number,
): boolean {
    return getBlockCalendarWeekCount(startISO, endISO) === weekCount;
}

export interface PhaseDateRange {
    startDate: string;
    endDate: string;
}

/** Recalcula fechas contiguas para fases ordenadas por sortOrder. */
export function recalculatePhaseDates(
    programStartDate: string,
    phases: readonly { sortOrder: number; weekCount: number }[],
): PhaseDateRange[] {
    const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const ranges: PhaseDateRange[] = [];
    let cursor = programStartDate;

    for (const phase of sorted) {
        const endDate = deriveBlockEndFromWeekCount(cursor, phase.weekCount);
        ranges.push({ startDate: cursor, endDate });
        cursor = dayAfterLocal(endDate);
    }

    return ranges;
}

/** Suma de weekCount de todas las fases. */
export function sumPhaseWeekCounts(
    phases: readonly { weekCount: number }[],
): number {
    return phases.reduce((acc, phase) => acc + phase.weekCount, 0);
}

/**
 * Inicio del programa QP sin solapar bloques ya persistidos.
 * Si hay bloques, empieza el día después del último end_date (orden por fecha).
 */
export function resolveQuickProgramStartDate(
    planStartDate: string,
    existingBlocks: readonly DateRange[],
): string {
    if (existingBlocks.length === 0) return planStartDate;

    const sorted = [...existingBlocks].sort((a, b) =>
        a.end_date.localeCompare(b.end_date),
    );
    const afterLastBlock = dayAfterLocal(sorted[sorted.length - 1].end_date);
    return afterLastBlock > planStartDate ? afterLastBlock : planStartDate;
}
