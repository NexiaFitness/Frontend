/**
 * weeklyStructure.ts — Lógica pura para estructura semanal de bloques de periodización.
 *
 * Contexto:
 * - Generación de semanas sintéticas para bloques sin filas en weekly_structure_weeks.
 * - Compartido entre WeeklyStructureEditor (web) y constructor de periodización (web).
 * - week_ordinal = semana calendario (lun–dom) anclada al lunes de la semana de start_date.
 *
 * @author Frontend Team
 * @since v6.3.1 — SPEC_FIX_ESTRUCTURA_SEMANAL_BLOQUES_ANTIGUOS.md Fase 4
 */

import type { WeeklyStructureWeek, WeeklyStructureDay } from "../types/weeklyStructure";
import {
    getBlockCalendarWeekCount,
    getBlockCalendarWeekOrdinal,
} from "./calendarWeekForBlock";
import {
    isoLocalDateToTrainingDayValue,
    parseHabitualTrainingDaySet,
} from "./clientTrainingDays";

/**
 * Genera semanas sintéticas vacías a partir del rango de fechas de un bloque.
 *
 * Reglas:
 * - num_weeks = semanas calendario (lun–dom) entre start_date y end_date del bloque.
 * - Cada semana tiene 7 días vacíos (day_of_week 1..7, patterns=[]).
 * - id es undefined (no persistido).
 *
 * @param startDate — ISO date string (YYYY-MM-DD)
 * @param endDate   — ISO date string (YYYY-MM-DD)
 * @returns Array de WeeklyStructureWeek sintéticas ordenadas por week_ordinal.
 */
export function generateSyntheticWeeks(
    startDate: string,
    endDate: string
): WeeklyStructureWeek[] {
    const numWeeks = getBlockCalendarWeekCount(startDate, endDate);

    if (numWeeks <= 0) return [];

    return Array.from({ length: numWeeks }, (_, i): WeeklyStructureWeek => {
        const days: WeeklyStructureDay[] = Array.from({ length: 7 }, (_, d) => ({
            day_of_week: d + 1,
            patterns: [],
        }));

        return {
            week_ordinal: i + 1,
            label: null,
            days,
        };
    });
}

/** Relative program weeks for template blocks (no calendar dates). */
export function generateSyntheticProgramWeeks(
    programWeekStart: number,
    programWeekEnd: number
): WeeklyStructureWeek[] {
    const numWeeks = programWeekEnd - programWeekStart + 1;
    if (numWeeks <= 0) return [];

    return Array.from({ length: numWeeks }, (_, i): WeeklyStructureWeek => {
        const days: WeeklyStructureDay[] = Array.from({ length: 7 }, (_, d) => ({
            day_of_week: d + 1,
            patterns: [],
        }));

        return {
            week_ordinal: i + 1,
            label: null,
            days,
        };
    });
}

/**
 * Fusiona semanas reales (persistidas en BD) con semanas sintéticas (calculadas
 * desde fechas) de forma que las semanas reales tienen prioridad.
 *
 * Reglas de merge:
 * 1. Si realWeeks está vacío → devolver solo syntheticWeeks.
 * 2. Si hay realWeeks → devolver realWeeks + syntheticWeeks cuyo week_ordinal
 *    NO esté ya cubierto por una real. Ordenado por week_ordinal ascendente.
 *
 * @param realWeeks      — Semanas devueltas por el backend.
 * @param syntheticWeeks — Semanas calculadas desde start_date/end_date.
 */
export function mergeWeeklyStructureWeeks(
    realWeeks: WeeklyStructureWeek[],
    syntheticWeeks: WeeklyStructureWeek[]
): WeeklyStructureWeek[] {
    if (realWeeks.length === 0) return syntheticWeeks;

    const realOrdinals = new Set(realWeeks.map((w) => w.week_ordinal));
    const missing = syntheticWeeks.filter((w) => !realOrdinals.has(w.week_ordinal));

    return [...realWeeks, ...missing].sort((a, b) => a.week_ordinal - b.week_ordinal);
}

/**
 * Información de un día entrenable resuelto dentro del rango de un bloque.
 *
 * - `weekOrdinal` es 1-indexado: semana calendario (lun–dom) anclada al bloque.
 * - `dayOfWeek` sigue ISO 1..7 (1=Lunes, 7=Domingo).
 * - `dateISO` se devuelve en hora local (`YYYY-MM-DD`), alineado con `toLocalISO`.
 */
export interface TrainingDateInfo {
    weekOrdinal: number;
    dayOfWeek: number;
    dateISO: string;
    dayName: string;
}

const DAY_NAMES_ES: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
};

/**
 * Devuelve los días entrenables del cliente que caen dentro del rango del bloque,
 * agrupándolos en semanas calendario (lun–dom) relativas al bloque.
 *
 * - Lee `trainingDays` (lista de días habituales del cliente) y filtra el rango.
 * - Calcula `weekOrdinal` con getBlockCalendarWeekOrdinal.
 * - El nombre del día se devuelve en español.
 */
export function getTrainingDatesInRange(
    startDate: string,
    endDate: string,
    trainingDays: readonly string[] | null | undefined,
): TrainingDateInfo[] {
    const daySet = parseHabitualTrainingDaySet(trainingDays);
    if (!daySet.size) return [];

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);
    if ([sy, sm, sd, ey, em, ed].some((n) => Number.isNaN(n))) return [];

    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

    const out: TrainingDateInfo[] = [];
    const cursor = new Date(start);

    while (cursor.getTime() <= end.getTime()) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, "0");
        const d = String(cursor.getDate()).padStart(2, "0");
        const dateISO = `${y}-${m}-${d}`;

        const dayValue = isoLocalDateToTrainingDayValue(dateISO);
        if (dayValue && daySet.has(dayValue)) {
            const jsDay = cursor.getDay();
            const dayOfWeek = jsDay === 0 ? 7 : jsDay;
            const weekOrdinal = getBlockCalendarWeekOrdinal(dateISO, startDate);
            out.push({
                weekOrdinal,
                dayOfWeek,
                dateISO,
                dayName: DAY_NAMES_ES[dayOfWeek] ?? "",
            });
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return out;
}
