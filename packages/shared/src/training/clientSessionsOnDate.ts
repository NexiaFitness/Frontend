/**
 * Sesiones del cliente en un día concreto (training + standalone).
 * Fuente única para calendario, constructor y avisos de coexistencia (G4).
 */

import type { SessionListItem } from "../types/standaloneSessions";
import type { TrainingSession } from "../types/training";
import type { StandaloneSessionOut } from "../types/standaloneSessions";
import { toDateOnlyString } from "./activePeriodBlock";

export function filterSessionsOnDate<T extends { session_date?: string | null }>(
    sessions: readonly T[],
    dateStr: string,
): T[] {
    const target = toDateOnlyString(dateStr);
    if (!target) return [];
    return sessions.filter((s) => toDateOnlyString(s.session_date) === target);
}

/** Misma forma que ClientSessionsTab — listado unificado por cliente. */
export function mergeClientTrainingAndStandaloneSessions(
    trainingSessions: readonly TrainingSession[],
    standaloneSessions: readonly StandaloneSessionOut[],
): SessionListItem[] {
    const list: SessionListItem[] = [];
    trainingSessions.forEach((s) => {
        list.push({ ...s, session_kind: "training" as const });
    });
    standaloneSessions.forEach((s) => {
        list.push({ ...s, session_kind: "standalone" as const });
    });
    list.sort((a, b) => (b.session_date ?? "").localeCompare(a.session_date ?? ""));
    return list;
}

export function getClientSessionsOnDate(
    trainingSessions: readonly TrainingSession[],
    standaloneSessions: readonly StandaloneSessionOut[],
    dateStr: string,
): SessionListItem[] {
    return filterSessionsOnDate(
        mergeClientTrainingAndStandaloneSessions(trainingSessions, standaloneSessions),
        dateStr,
    );
}
