/**
 * weeklyStructure.ts — Lógica pura para estructura semanal de bloques de periodización.
 *
 * Contexto:
 * - Generación de semanas sintéticas para bloques sin filas en weekly_structure_weeks.
 * - Compartido entre WeeklyStructureEditor (web) y PeriodizationWeeklyStructureDraft (web).
 *
 * @author Frontend Team
 * @since v6.3.1 — SPEC_FIX_ESTRUCTURA_SEMANAL_BLOQUES_ANTIGUOS.md Fase 4
 */

import type { WeeklyStructureWeek, WeeklyStructureDay } from "../types/weeklyStructure";

/**
 * Genera semanas sintéticas vacías a partir del rango de fechas de un bloque.
 *
 * Reglas:
 * - total_days  = (end_date - start_date).days + 1
 * - num_weeks   = ceil(total_days / 7)
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
    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);

    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const numWeeks = Math.ceil(totalDays / 7);

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
