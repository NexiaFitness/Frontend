/**
 * Sesiones del cliente en un día concreto (training + standalone).
 * Fuente única para calendario, constructor y avisos de coexistencia (G4).
 */

import type { SessionListItem } from "../types/standaloneSessions";
import type { TrainingSession } from "../types/training";
import type { StandaloneSessionOut } from "../types/standaloneSessions";
import { isDateInRange } from "../utils/periodBlockOverlap";
import { toDateOnlyString } from "./activePeriodBlock";

export type ClientDaySessionAction =
    | { kind: "open_one"; session: SessionListItem }
    | { kind: "pick"; sessions: SessionListItem[] }
    | { kind: "create" };

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

/** Orden estable para picker (P-A: sin prioridad program vs standalone). */
export function sortSessionsForDayPicker(sessions: readonly SessionListItem[]): SessionListItem[] {
    return [...sessions].sort((a, b) => {
        const nameA = (a.session_name ?? "").trim().toLocaleLowerCase("es");
        const nameB = (b.session_name ?? "").trim().toLocaleLowerCase("es");
        if (nameA !== nameB) return nameA.localeCompare(nameB, "es");
        return a.id - b.id;
    });
}

/**
 * P-A: 0 → create · 1 → open · N → pick (sin priorizar kind).
 */
export function resolveClientDaySessionAction(
    sessionsOnDay: readonly SessionListItem[],
): ClientDaySessionAction {
    if (sessionsOnDay.length === 0) {
        return { kind: "create" };
    }
    if (sessionsOnDay.length === 1) {
        return { kind: "open_one", session: sessionsOnDay[0]! };
    }
    return { kind: "pick", sessions: sortSessionsForDayPicker(sessionsOnDay) };
}

/** Deep link create desde calendario: sin sessionKind (D2). planId solo si fecha en vigencia operativa. */
export function buildCalendarCreateSessionSearchParams(input: {
    clientId: number;
    dateStr: string;
    activePlanId: number | null;
    planStartDate: string | null | undefined;
    planEndDate: string | null | undefined;
}): URLSearchParams {
    const qs = new URLSearchParams();
    qs.set("clientId", String(input.clientId));
    qs.set("date", input.dateStr);
    if (
        input.activePlanId != null &&
        input.planStartDate &&
        input.planEndDate &&
        isDateInRange(input.dateStr, input.planStartDate, input.planEndDate)
    ) {
        qs.set("planId", String(input.activePlanId));
    }
    return qs;
}
