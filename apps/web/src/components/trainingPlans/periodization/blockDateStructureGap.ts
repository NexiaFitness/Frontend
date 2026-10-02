/**
 * blockDateStructureGap.ts — Huecos de estructura tras cambio de fechas del bloque (Fase 4).
 *
 * Contexto: al alargar el rango calendario, semanas ordinales nuevas quedan sin fila;
 * aviso fuerte + CTA «Replicar semana tipo» sin bloquear guardado.
 *
 * @author Frontend Team
 * @since v9.1.0
 */

import { getBlockCalendarWeekCount } from "@nexia/shared";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

export interface BlockDateStructureGapViewModel {
    show: boolean;
    message: string;
    missingWeekOrdinals: number[];
    replicateWeekPath: string | null;
}

export function listConfiguredWeekOrdinals(
    structure: readonly WeeklyStructureWeekCreate[],
): number[] {
    return [...new Set(structure.map((w) => w.week_ordinal))].sort(
        (a, b) => a - b,
    );
}

/** Semanas calendario 1..N sin fila de estructura para el rango de fechas dado. */
export function missingStructureOrdinalsForDateRange(
    startDate: string,
    endDate: string,
    structure: readonly WeeklyStructureWeekCreate[],
): number[] {
    const calendarWeeks = getBlockCalendarWeekCount(startDate, endDate);
    if (calendarWeeks <= 0) return [];
    const configured = new Set(listConfiguredWeekOrdinals(structure));
    const missing: number[] = [];
    for (let n = 1; n <= calendarWeeks; n += 1) {
        if (!configured.has(n)) {
            missing.push(n);
        }
    }
    return missing;
}

export function buildBlockDateStructureGapViewModel(input: {
    planId: number;
    blockId: number | null;
    startDate: string | null;
    endDate: string | null;
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    persistedStartDate?: string | null;
    persistedEndDate?: string | null;
}): BlockDateStructureGapViewModel {
    const {
        planId,
        blockId,
        startDate,
        endDate,
        weeklyStructure,
        persistedStartDate,
        persistedEndDate,
    } = input;

    const empty: BlockDateStructureGapViewModel = {
        show: false,
        message: "",
        missingWeekOrdinals: [],
        replicateWeekPath: null,
    };

    if (!startDate || !endDate || blockId == null) {
        return empty;
    }

    const datesExtended =
        persistedStartDate != null &&
        persistedEndDate != null &&
        getBlockCalendarWeekCount(startDate, endDate) >
            getBlockCalendarWeekCount(persistedStartDate, persistedEndDate);

    const missing = missingStructureOrdinalsForDateRange(
        startDate,
        endDate,
        weeklyStructure,
    );

    if (missing.length === 0) {
        return empty;
    }

    const show = datesExtended || missing.length > 0;
    if (!show) {
        return empty;
    }

    const weekList = missing.join(", ");
    const firstMissing = missing[0] ?? 1;
    const replicateWeekPath =
        blockId != null
            ? `/dashboard/training-plans/${planId}/period-blocks/${blockId}/weekly-structure?week=${firstMissing}`
            : null;

    return {
        show: true,
        message:
            missing.length === 1
                ? `La semana ${weekList} del bloque aún no tiene estructura. Replica la semana tipo o configúrala manualmente.`
                : `Las semanas ${weekList} del bloque aún no tienen estructura. Replica la semana tipo o configúralas manualmente.`,
        missingWeekOrdinals: missing,
        replicateWeekPath,
    };
}
