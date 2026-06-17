/**
 * athleteWeeklyCopy.ts — Copy insight semanal V01 (F3b-FE-03).
 * Narrativa emocional; no repetir hero ni proximidad ya cubierta.
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type {
    AthleteWeeklyAdherence,
    AthleteWeeklyFeedback,
    AthleteWeeklyPersonalRecord,
    AthleteWeeklySummary,
} from "../../types/athleteWeeklySummary";
import type { AthleteDashboardMode } from "./athleteDashboardMode";
import { dailyCopySeed, pickFromPool } from "./athleteCopyPools";
import { computeDaysUntilSession, formatWeekdayForSession } from "./athleteSessionUtils";

export interface WeeklyInsightCopy {
    headline: string | null;
    subline: string | null;
}

export interface WeeklyInsightCopyContext {
    summary: AthleteWeeklySummary;
    mode: AthleteDashboardMode;
    nextSession?: TrainingSession;
    today?: Date;
    copySeed?: string;
    clientId?: number;
}

function sessionWord(count: number): string {
    return count === 1 ? "sesión" : "sesiones";
}

function remainingSessionsPhrase(count: number): string {
    if (count === 1) return "Te queda 1 sesión esta semana.";
    return `Te quedan ${count} ${sessionWord(count)} esta semana.`;
}

function buildSingleSessionPendingHeadline(
    nextSession: TrainingSession | undefined,
    today: Date
): string {
    if (!nextSession?.session_date) {
        return "Tienes una sesión esta semana. Cuando toque, la rematamos.";
    }

    const daysUntil = computeDaysUntilSession(nextSession.session_date, today);

    if (daysUntil === 0) {
        return "Hoy es tu sesión de la semana. Vamos a por ella.";
    }
    if (daysUntil === 1) {
        return "Mañana toca tu sesión de la semana. Estás a tiempo.";
    }
    if (daysUntil >= 2 && daysUntil <= 3) {
        const weekday = formatWeekdayForSession(nextSession.session_date).toLowerCase();
        return `El ${weekday} toca tu sesión de la semana. Prepara el cuerpo.`;
    }
    return "Esta semana tienes una sesión en el radar. Mantén el ritmo.";
}

function buildSingleSessionPendingSubline(
    nextSession: TrainingSession | undefined,
    today: Date
): string {
    if (nextSession?.session_date) {
        const daysUntil = computeDaysUntilSession(nextSession.session_date, today);
        if (daysUntil <= 1) {
            return "Un buen entreno y la semana queda hecha.";
        }
    }
    return "Cuando llegue el día, dale con todo.";
}

function proximityCloser(
    daysUntil: number,
    nextSessionDate: string,
    remaining: number
): string {
    if (daysUntil === 0) {
        return remaining === 1
            ? "Hoy la cerramos fuerte."
            : "Hoy sumamos otra. Vamos.";
    }
    if (daysUntil === 1) {
        return remaining === 1
            ? "Mañana la rematamos."
            : "Mañana volvemos a apretar.";
    }
    if (daysUntil >= 2 && daysUntil <= 3) {
        const weekday = formatWeekdayForSession(nextSessionDate).toLowerCase();
        return remaining === 1
            ? `El ${weekday} la cerramos.`
            : `El ${weekday} retomamos ritmo.`;
    }
    return remaining === 1
        ? "Vamos a cerrarla fuerte."
        : "Mantén el ritmo, vas bien.";
}

export function buildWeeklyAdherenceHeadline(
    adherence: AthleteWeeklyAdherence,
    nextSession?: TrainingSession,
    today = new Date()
): string {
    const { sessions_planned: planned, sessions_completed: completed } = adherence;

    if (planned === 0) {
        return "Semana de recuperación. Aprovecha para recargar.";
    }

    if (completed === 0) {
        if (planned === 1) {
            return buildSingleSessionPendingHeadline(nextSession, today);
        }
        return `Arrancas la semana. ${remainingSessionsPhrase(planned)}`;
    }

    if (completed >= planned) {
        if (planned === 1) {
            return "Sesión hecha. Semana cerrada. Buen trabajo.";
        }
        return `Buena semana: ${completed} de ${planned}. Mantén el ritmo.`;
    }

    const remaining = planned - completed;
    const base = `${remainingSessionsPhrase(remaining)}`;

    if (nextSession?.session_date) {
        const daysUntil = computeDaysUntilSession(nextSession.session_date, today);
        return `${base} ${proximityCloser(daysUntil, nextSession.session_date, remaining)}`;
    }

    if (planned === 1) {
        return "Vas 1 de 1. Sigue con ese impulso.";
    }

    return `Vas ${completed} de ${planned}. Mantén el ritmo, vas bien.`;
}

export function buildWeeklyInsightSubline(
    trainingStreak: number,
    feedback: AthleteWeeklyFeedback,
    adherence: AthleteWeeklyAdherence,
    nextSession?: TrainingSession,
    today = new Date()
): string | null {
    if (feedback.has_trainer_response) {
        return "Tu entrenador te dejó un mensaje. Échale un vistazo.";
    }

    const { sessions_planned: planned, sessions_completed: completed } = adherence;
    if (planned > 0 && completed < planned && completed > 0) {
        return "Cada sesión suma. Sigue así.";
    }

    if (trainingStreak >= 3) {
        const dayWord = trainingStreak === 1 ? "día" : "días";
        return `Llevas ${trainingStreak} ${dayWord} seguidos entrenando.`;
    }

    if (planned === 1 && completed === 0) {
        return buildSingleSessionPendingSubline(nextSession, today);
    }

    if (planned > 1 && completed === 0) {
        return "La primera sesión marca el tono de la semana.";
    }

    return null;
}

function buildModeAwareHeadline(ctx: WeeklyInsightCopyContext): string | null {
    const { adherence } = ctx.summary;
    const { sessions_planned: planned, sessions_completed: completed } = adherence;
    const today = ctx.today ?? new Date();
    const seed = ctx.copySeed ?? dailyCopySeed(today, ctx.clientId);

    switch (ctx.mode) {
        case "train_today_done":
            if (planned === 1) {
                return "Semana cerrada. Buen trabajo.";
            }
            if (completed >= planned) {
                return `Buena semana: ${completed} de ${planned}.`;
            }
            return remainingSessionsPhrase(planned - completed);

        case "train_today":
            if (planned === 1) {
                return null;
            }
            if (completed === 0) {
                return `Arrancas la semana. ${remainingSessionsPhrase(planned)}`;
            }
            return remainingSessionsPhrase(planned - completed);

        case "rest_tomorrow":
        case "rest_near":
            if (planned === 1 && completed === 0) {
                return pickFromPool("insight_rest_tomorrow_single", seed);
            }
            if (completed === 0 && planned > 1) {
                return pickFromPool("insight_week_partial", seed);
            }
            break;

        case "week_done":
            if (planned === 1) {
                return "Sesión hecha. Semana cerrada.";
            }
            return `Buena semana: ${completed} de ${planned}. Mantén el ritmo.`;

        case "week_recovery":
            return "Semana de recuperación. Aprovecha para recargar.";

        default:
            break;
    }

    if (ctx.mode === "rest_tomorrow" || ctx.mode === "rest_near") {
        if (completed > 0 && completed < planned) {
            return pickFromPool("insight_week_partial", seed);
        }
        if (planned > 1 && completed === 0) {
            return `Arrancas la semana. ${remainingSessionsPhrase(planned)}`;
        }
        return null;
    }

    return buildWeeklyAdherenceHeadline(ctx.summary.adherence, ctx.nextSession, today);
}

function buildModeAwareSubline(ctx: WeeklyInsightCopyContext): string | null {
    const feedbackSubline = buildWeeklyInsightSubline(
        ctx.summary.training_streak,
        ctx.summary.feedback,
        ctx.summary.adherence,
        ctx.nextSession,
        ctx.today
    );

    if (ctx.mode === "rest_tomorrow" && ctx.summary.adherence.sessions_planned === 1) {
        if (ctx.summary.feedback.has_trainer_response) {
            return feedbackSubline;
        }
        if (ctx.summary.training_streak >= 3) {
            return feedbackSubline;
        }
        return "Un buen entreno y la semana queda hecha.";
    }

    if (ctx.mode === "train_today" && ctx.summary.adherence.sessions_planned === 1) {
        return "Cuando termines, la semana quedará hecha.";
    }

    return feedbackSubline;
}

export function buildWeeklyInsightCopy(ctx: WeeklyInsightCopyContext): WeeklyInsightCopy {
    return {
        headline: buildModeAwareHeadline(ctx),
        subline: buildModeAwareSubline(ctx),
    };
}

export function shouldShowWeeklyInsight(
    summary: AthleteWeeklySummary | undefined,
    hasActivePlan: boolean
): boolean {
    return hasActivePlan && summary != null;
}

export function buildPersonalRecordChipLabel(record: AthleteWeeklyPersonalRecord): string {
    const weight =
        record.max_weight % 1 === 0
            ? String(record.max_weight)
            : record.max_weight.toFixed(1).replace(".", ",");
    return `${record.exercise_name} · ${weight} kg`;
}

export function buildTrainerMessageChipLabel(sessionName: string | null): string {
    if (sessionName?.trim()) {
        return `Mensaje sobre ${sessionName}`;
    }
    return "Mensaje de tu entrenador";
}
