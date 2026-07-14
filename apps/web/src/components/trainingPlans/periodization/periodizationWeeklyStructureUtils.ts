/**
 * Utilidades puras para estructura semanal de periodización (sin UI).
 */

import {
    formatCalendarWeekRange,
    getTrainingDatesInRange,
} from "@nexia/shared";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

/** Identificador único del día en el picker: `{weekOrdinal}-{dayOfWeek}`. */
export function toPickerDayId(weekOrdinal: number, dayOfWeek: number): string {
    return `${weekOrdinal}-${dayOfWeek}`;
}

export function parsePickerDayId(
    id: string,
): { weekOrdinal: number; dayOfWeek: number } | null {
    const parts = id.split("-");
    if (parts.length !== 2) return null;
    const weekOrdinal = Number(parts[0]);
    const dayOfWeek = Number(parts[1]);
    if (!Number.isFinite(weekOrdinal) || !Number.isFinite(dayOfWeek)) {
        return null;
    }
    return { weekOrdinal, dayOfWeek };
}

export function formatRangeShort(startDate: string, endDate: string): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };
    return `${fmt(startDate)} – ${fmt(endDate)}`;
}

/** Etiqueta lun–dom de la semana calendario N del bloque. */
export function formatBlockWeekRange(
    blockStartISO: string,
    weekOrdinal: number,
    _blockEndISO?: string,
): string {
    return formatCalendarWeekRange(weekOrdinal, blockStartISO);
}

export interface WeeklyStructureMetrics {
    totalTrainable: number;
    withPatterns: number;
    weekCount: number;
}

export function computeWeeklyStructureMetrics(
    startDate: string,
    endDate: string,
    trainingDays: readonly string[] | null | undefined,
    value: WeeklyStructureWeekCreate[],
): WeeklyStructureMetrics {
    const trainingDates = getTrainingDatesInRange(
        startDate,
        endDate,
        trainingDays,
    );
    const weekOrdinals = new Set(trainingDates.map((d) => d.weekOrdinal));
    const withPatterns = value.reduce(
        (acc, w) => acc + w.days.filter((d) => d.patterns.length > 0).length,
        0,
    );
    return {
        totalTrainable: trainingDates.length,
        withPatterns,
        weekCount: weekOrdinals.size,
    };
}
