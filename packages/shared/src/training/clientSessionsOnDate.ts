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

/**
 * Conteo corto tab Sesiones (lista cronológica, badges, etc.).
 * Plural correcto: sesiones — no concatenar «sesión» + «es» (sesiónes).
 */
export function formatClientWorkoutSessionCountShort(count: number): string {
    if (count < 1) return "";
    if (count === 1) return "1 sesión";
    return `${count} sesiones`;
}

/**
 * Copy accesible calendario tab Sesiones (D-QA9-b).
 * Cuenta sesiones de workout (programa + suelta), mismo ámbito que el tab — no implica session_kind training.
 */
export function formatClientCalendarDaySessionCountAria(count: number): string {
    const short = formatClientWorkoutSessionCountShort(count);
    if (!short) return "";
    return `${short} de entrenamiento`;
}

/** Conteo por día (training + standalone, sin canceladas) — hint calendario tab Sesiones (D-QA9-b). */
export function buildTrainingSessionCountByDate(
    sessions: readonly SessionListItem[],
): Map<string, number> {
    const counts = new Map<string, number>();
    for (const s of sessions) {
        if (s.status === "cancelled") continue;
        const day = toDateOnlyString(s.session_date ?? undefined);
        if (!day) continue;
        counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
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
