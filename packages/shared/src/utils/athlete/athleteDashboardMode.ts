/**
 * athleteDashboardMode.ts — Modo global del dashboard atleta V01 (F3b-FE-04).
 * D10: sin plan activo pero con sesiones → mismos modos train/rest que con plan.
 */

import type { TrainingSession } from "../../types/trainingSessions";
import { computeDaysUntilSession } from "./athleteSessionUtils";

export type AthleteDashboardMode =
    | "no_plan"
    | "week_recovery"
    | "week_done"
    | "train_today"
    | "train_today_done"
    | "rest_tomorrow"
    | "rest_near"
    | "rest_far"
    | "week_partial";

export interface ResolveDashboardModeInput {
    hasActivePlan: boolean;
    todaySession?: TrainingSession;
    nextSession?: TrainingSession;
    sessionsPlanned?: number;
    sessionsCompleted?: number;
    today?: Date;
}

function resolveRestMode(
    nextSession: TrainingSession | undefined,
    today: Date,
    planned?: number,
    completed?: number
): AthleteDashboardMode {
    const nextDate = nextSession?.session_date;
    if (!nextDate) {
        return "rest_far";
    }

    const daysUntil = computeDaysUntilSession(nextDate, today);
    if (daysUntil === 1) {
        return "rest_tomorrow";
    }
    if (daysUntil >= 2 && daysUntil <= 3) {
        return "rest_near";
    }

    if (planned != null && completed != null && planned > 0 && completed < planned) {
        return "week_partial";
    }

    return "rest_far";
}

export function resolveDashboardMode(input: ResolveDashboardModeInput): AthleteDashboardMode {
    const today = input.today ?? new Date();
    const todaySession = input.todaySession;

    if (!input.hasActivePlan) {
        if (todaySession) {
            if (todaySession.status === "completed") {
                return "train_today_done";
            }
            return "train_today";
        }
        if (input.nextSession) {
            return resolveRestMode(
                input.nextSession,
                today,
                input.sessionsPlanned,
                input.sessionsCompleted
            );
        }
        return "no_plan";
    }

    const planned = input.sessionsPlanned;
    const completed = input.sessionsCompleted;

    if (planned != null && planned === 0) {
        return "week_recovery";
    }

    if (
        planned != null &&
        completed != null &&
        planned > 0 &&
        completed >= planned
    ) {
        return "week_done";
    }

    if (todaySession) {
        if (todaySession.status === "completed") {
            return "train_today_done";
        }
        return "train_today";
    }

    return resolveRestMode(input.nextSession, today, planned, completed);
}
