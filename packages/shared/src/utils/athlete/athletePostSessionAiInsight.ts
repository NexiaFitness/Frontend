/**
 * athletePostSessionAiInsight.ts — Elegibilidad IA post-sesión (F3d-FE-01).
 * Sin DOM. Contrato: docs/audits/portal-atleta/especificaciones-atleta/inteligencia/F3d_FE01_POST_SESSION_AI_INSIGHT.md
 */

import type { AthleteWeeklySummary } from "../../types/athleteWeeklySummary";
import type { PostSessionReport } from "../../types/trainingSessions";
import { isPartiallyClosedSession, PARTIAL_SESSION_COMPLETION_THRESHOLD } from "./athleteSessionUtils";

export interface PostSessionAiEligibilityInput {
    report: Pick<PostSessionReport, "status" | "completion_percentage">;
    weeklySummary: AthleteWeeklySummary | undefined;
}

/** Sesión con cumplimiento bajo: no elegible para IA ni copy de cierre semanal. */
function hasLowSessionCompletion(
    report: Pick<PostSessionReport, "status" | "completion_percentage">
): boolean {
    if (isPartiallyClosedSession(report)) {
        return true;
    }
    const pct = report.completion_percentage;
    return pct != null && Number.isFinite(pct) && pct < PARTIAL_SESSION_COMPLETION_THRESHOLD;
}

/** True when V06 should auto-fetch POST /ai/weekly-summary after session completion. */
export function shouldFetchPostSessionAiInsight(
    input: PostSessionAiEligibilityInput
): boolean {
    if (hasLowSessionCompletion(input.report)) {
        return false;
    }

    const weekly = input.weeklySummary;
    if (!weekly) {
        return false;
    }

    const { sessions_planned: planned, sessions_completed: completed } = weekly.adherence;
    const weekClosed = planned > 0 && completed >= planned;
    const hasWeeklyPr = weekly.personal_records.length > 0;

    return weekClosed || hasWeeklyPr;
}

export type PostSessionCelebrationVariant = "full" | "partial" | "week_closed" | "record";

export interface PostSessionCelebrationCopy {
    variant: PostSessionCelebrationVariant;
    badge: string | null;
    headline: string;
    subline: string | null;
}

export function buildPostSessionCelebrationCopy(
    report: Pick<
        PostSessionReport,
        "status" | "completion_percentage" | "session_name"
    >,
    weeklySummary: AthleteWeeklySummary | undefined
): PostSessionCelebrationCopy {
    const isPartial = hasLowSessionCompletion(report);
    const pct = Math.round(report.completion_percentage);

    if (isPartial) {
        return {
            variant: "partial",
            badge: "Sesión parcial",
            headline: "Sesión cerrada parcialmente",
            subline:
                "Registraste menos del 50% de las series planificadas. Puedes retomarla otro día.",
        };
    }

    const planned = weeklySummary?.adherence.sessions_planned ?? 0;
    const completed = weeklySummary?.adherence.sessions_completed ?? 0;
    const weekClosed = planned > 0 && completed >= planned;
    const hasPr = (weeklySummary?.personal_records.length ?? 0) > 0;

    if (weekClosed && hasPr && pct >= PARTIAL_SESSION_COMPLETION_THRESHOLD) {
        return {
            variant: "record",
            badge: "Semana cerrada",
            headline: "Semana cerrada con récord",
            subline: `${report.session_name} al ${pct}%.`,
        };
    }

    if (weekClosed && pct >= PARTIAL_SESSION_COMPLETION_THRESHOLD) {
        return {
            variant: "week_closed",
            badge: "Semana cerrada",
            headline: "Semana cerrada",
            subline: `${report.session_name} al ${pct}%.`,
        };
    }

    if (hasPr) {
        const prName = weeklySummary?.personal_records[0]?.exercise_name;
        return {
            variant: "record",
            badge: "Nuevo récord",
            headline: "Sesión con récord personal",
            subline: prName
                ? `${report.session_name} al ${pct}%. ${prName}.`
                : `${report.session_name} al ${pct}%.`,
        };
    }

    return {
        variant: "full",
        badge: "Sesión completada",
        headline: "Sesión completada",
        subline: `${report.session_name} al ${pct}%.`,
    };
}
