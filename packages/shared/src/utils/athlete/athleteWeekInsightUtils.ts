/**
 * athleteWeekInsightUtils.ts — Progreso visual semana (dots) para V01 insight.
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type { WeekDayStripItem } from "./athleteSessionUtils";

export type WeekProgressDotState = "done" | "pending" | "empty";

export function dotStateForDay(sessions: TrainingSession[]): WeekProgressDotState {
    if (sessions.length === 0) {
        return "empty";
    }

    const active = sessions.filter((s) => s.status !== "cancelled");
    if (active.length === 0) {
        return "empty";
    }
    if (active.some((s) => s.status === "completed")) {
        return "done";
    }
    return "pending";
}

/** Siempre 7 dots (Lun–Dom), alineados con WeekStrip. */
export function buildWeekProgressDotsFromStrip(
    days: WeekDayStripItem[]
): WeekProgressDotState[] {
    if (days.length === 0) {
        return Array.from({ length: 7 }, () => "empty" as const);
    }

    return days.map((day) => dotStateForDay(day.sessions));
}

export function countWeekStripStats(days: WeekDayStripItem[]): {
    done: number;
    planned: number;
} {
    let done = 0;
    let planned = 0;
    for (const day of days) {
        const state = dotStateForDay(day.sessions);
        if (state === "empty") continue;
        planned += 1;
        if (state === "done") done += 1;
    }
    return { done, planned };
}

export function getDayProgressState(day: WeekDayStripItem): WeekProgressDotState {
    return dotStateForDay(day.sessions);
}

/** @deprecated Usar buildWeekProgressDotsFromStrip — conservado por compatibilidad tests. */
export function buildWeekProgressDots(
    sessionsCompleted: number,
    sessionsPlanned: number
): WeekProgressDotState[] {
    if (sessionsPlanned <= 0) {
        return Array.from({ length: 7 }, () => "empty" as const);
    }

    const dots: WeekProgressDotState[] = [];
    for (let i = 0; i < sessionsPlanned; i += 1) {
        dots.push(i < sessionsCompleted ? "done" : "pending");
    }
    while (dots.length < 7) {
        dots.push("empty");
    }
    return dots.slice(0, 7);
}

export function countDotStates(dots: WeekProgressDotState[]): {
    done: number;
    pending: number;
    planned: number;
} {
    const done = dots.filter((d) => d === "done").length;
    const pending = dots.filter((d) => d === "pending").length;
    return { done, pending, planned: done + pending };
}
