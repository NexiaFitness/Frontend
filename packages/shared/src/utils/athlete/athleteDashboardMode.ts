/**
 * athleteDashboardMode.ts — Modo global del dashboard atleta V01 (F3b-FE-04).
 * Una sola fuente de verdad para copy y UI por estado.
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

export function resolveDashboardMode(input: ResolveDashboardModeInput): AthleteDashboardMode {
    const today = input.today ?? new Date();

    if (!input.hasActivePlan) {
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

    const todaySession = input.todaySession;
    if (todaySession) {
        if (todaySession.status === "completed") {
            return "train_today_done";
        }
        return "train_today";
    }

    const nextDate = input.nextSession?.session_date;
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
