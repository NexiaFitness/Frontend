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

/** Cuenta días entrenables con patrón (clave weekOrdinal-dayOfWeek, sin duplicar). */
export function countConfiguredTrainableDays(
    startDate: string,
    endDate: string,
    trainingDays: readonly string[] | null | undefined,
    value: readonly WeeklyStructureWeekCreate[],
): { totalTrainable: number; withPatterns: number } {
    const trainingDates = getTrainingDatesInRange(
        startDate,
        endDate,
        trainingDays,
    );
    const configured = new Set<string>();
    for (const week of value) {
        for (const day of week.days) {
            if (day.patterns.length > 0) {
                configured.add(`${week.week_ordinal}-${day.day_of_week}`);
            }
        }
    }
    let withPatterns = 0;
    for (const d of trainingDates) {
        if (configured.has(`${d.weekOrdinal}-${d.dayOfWeek}`)) {
            withPatterns += 1;
        }
    }
    return { totalTrainable: trainingDates.length, withPatterns };
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
    const { withPatterns } = countConfiguredTrainableDays(
        startDate,
        endDate,
        trainingDays,
        value,
    );
    return {
        totalTrainable: trainingDates.length,
        withPatterns,
        weekCount: weekOrdinals.size,
    };
}

/** Copia la estructura de la semana plantilla sobre otra semana del draft. */
export function restoreWeekFromTemplate(
    draft: readonly WeeklyStructureWeekCreate[],
    targetWeekOrdinal: number,
    templateOrdinal = 1,
): WeeklyStructureWeekCreate[] {
    const template = draft.find((w) => w.week_ordinal === templateOrdinal);
    if (!template || targetWeekOrdinal === templateOrdinal) {
        return draft.map((w) => ({
            ...w,
            days: w.days.map((d) => ({
                ...d,
                patterns: d.patterns.map((p) => ({ ...p })),
            })),
        }));
    }
    const restored: WeeklyStructureWeekCreate = {
        week_ordinal: targetWeekOrdinal,
        label: template.label ?? null,
        days: template.days.map((d) => ({
            day_of_week: d.day_of_week,
            patterns: d.patterns.map((p) => ({
                movement_pattern_id: p.movement_pattern_id,
                sub_pattern: p.sub_pattern ?? null,
            })),
        })),
    };
    const withoutTarget = draft.filter((w) => w.week_ordinal !== targetWeekOrdinal);
    return [...withoutTarget, restored].sort(
        (a, b) => a.week_ordinal - b.week_ordinal,
    );
}
