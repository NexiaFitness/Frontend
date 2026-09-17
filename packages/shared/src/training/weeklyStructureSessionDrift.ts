/**
 * G26 — Deriva estructura semanal ↔ sesiones de programa planificadas/futuras.
 * No marca completadas/canceladas ni fechas pasadas.
 */

import type { WeeklyStructureWeek } from "../types/weeklyStructure";
import { getBlockCalendarWeekOrdinal } from "../utils/calendarWeekForBlock";

const PLANNED_STATUSES = new Set(["planned", "modified", "in_progress"]);

export const STRUCTURE_DRIFT_WARNING_COPY =
    "La estructura semanal cambió: hay sesiones planificadas en días que ya no tienen entreno en el bloque. Revísalas; las sesiones completadas no se marcan como error.";

export const SESSION_OUTSIDE_PHASE_COPY =
    "Esta sesión no está vinculada a ninguna fase del plan para esta fecha. Es válida en dominio; revisa la periodización si esperabas una fase concreta.";

export function isProgramSessionStatusEligibleForStructureDrift(
    status: string | null | undefined,
): boolean {
    return status != null && PLANNED_STATUSES.has(status);
}

function parseLocalDate(iso: string): Date | null {
    const [y, m, d] = iso.split("-").map(Number);
    if ([y, m, d].some((n) => Number.isNaN(n))) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
}

function isoDayOfWeek(dateISO: string): number | null {
    const dt = parseLocalDate(dateISO);
    if (!dt) return null;
    const jsDay = dt.getDay();
    return jsDay === 0 ? 7 : jsDay;
}

/** True si la estructura semanal define al menos un patrón para esa fecha dentro del bloque. */
export function hasTrainingPatternsOnDate(
    dateISO: string,
    blockStartDate: string,
    weeklyStructureWeeks: WeeklyStructureWeek[],
): boolean {
    const dayOfWeek = isoDayOfWeek(dateISO);
    if (dayOfWeek == null) return false;
    const weekOrdinal = getBlockCalendarWeekOrdinal(dateISO, blockStartDate);
    const week = weeklyStructureWeeks.find((w) => w.week_ordinal === weekOrdinal);
    const day = week?.days.find((d) => d.day_of_week === dayOfWeek);
    return (day?.patterns.length ?? 0) > 0;
}

export interface StructureDriftSessionInput {
    id: number;
    session_date: string | null;
    status: string | null;
    period_block_id: number | null;
}

export function listStructureDriftPlannedSessionIds(
    sessions: StructureDriftSessionInput[],
    block: { id: number; start_date: string; end_date: string },
    weeklyStructureWeeks: WeeklyStructureWeek[],
    todayYmd: string,
): number[] {
    const ids: number[] = [];
    for (const session of sessions) {
        const date = session.session_date;
        if (!date || date < todayYmd) continue;
        if (date < block.start_date || date > block.end_date) continue;
        if (!isProgramSessionStatusEligibleForStructureDrift(session.status)) continue;
        if (
            session.period_block_id != null &&
            session.period_block_id !== block.id
        ) {
            continue;
        }
        if (
            hasTrainingPatternsOnDate(date, block.start_date, weeklyStructureWeeks)
        ) {
            continue;
        }
        ids.push(session.id);
    }
    return ids;
}

export function buildStructureDriftToastMessage(driftSessionIds: readonly number[]): string | null {
    if (driftSessionIds.length === 0) return null;
    if (driftSessionIds.length === 1) {
        return `${STRUCTURE_DRIFT_WARNING_COPY} (1 sesión planificada afectada).`;
    }
    return `${STRUCTURE_DRIFT_WARNING_COPY} (${driftSessionIds.length} sesiones planificadas afectadas).`;
}
