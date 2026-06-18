/**
 * athleteInsightDeepLinks.ts — Enlaces profundos del insight V01 (F3b-FE-05).
 * Progreso fijo + segundo enlace contextual. Campana = leer; Cuéntale = enviar.
 */

import type { ClientFeedback } from "../../types/training";
import type { TrainingSession } from "../../types/trainingSessions";
import { sessionHasClientFeedback } from "./athleteFeedbackUtils";
import type { AthleteDashboardMode } from "./athleteDashboardMode";
import { findLatestCompletedSession } from "./athleteSessionUtils";

export type InsightDeepLinkAction =
    | "progress"
    | "progress_exercise"
    | "feedback_history"
    | "submit_session_feedback"
    | "view_session_feedback";

export interface InsightDeepLink {
    id: string;
    label: string;
    hint: string;
    action: InsightDeepLinkAction;
    exerciseId?: number;
    sessionId?: number;
}

export interface InsightDeepLinksInput {
    mode: AthleteDashboardMode;
    hasTrainerResponse: boolean;
    hasPersonalRecord: boolean;
    topRecordExerciseId?: number;
    topRecordExerciseName?: string;
    lastCompletedSessionId: number | null;
    lastCompletedSessionHasFeedback: boolean;
}

export interface InsightDeepLinkContext {
    sessions: TrainingSession[];
    feedbackItems: ClientFeedback[];
}

export function resolveInsightDeepLinkSessionContext(
    context: InsightDeepLinkContext | undefined
): Pick<InsightDeepLinksInput, "lastCompletedSessionId" | "lastCompletedSessionHasFeedback"> {
    if (!context) {
        return {
            lastCompletedSessionId: null,
            lastCompletedSessionHasFeedback: false,
        };
    }

    const lastCompleted = findLatestCompletedSession(context.sessions);
    if (!lastCompleted) {
        return {
            lastCompletedSessionId: null,
            lastCompletedSessionHasFeedback: false,
        };
    }

    return {
        lastCompletedSessionId: lastCompleted.id,
        lastCompletedSessionHasFeedback: sessionHasClientFeedback(
            lastCompleted.id,
            context.feedbackItems
        ),
    };
}

function buildPostSessionFeedbackLink(input: InsightDeepLinksInput): InsightDeepLink | null {
    if (input.lastCompletedSessionId == null) {
        return null;
    }

    if (!input.lastCompletedSessionHasFeedback) {
        return {
            id: "feedback-after-session",
            label: "Cuéntale cómo te fue",
            hint: "Deja feedback de tu última sesión",
            action: "submit_session_feedback",
            sessionId: input.lastCompletedSessionId,
        };
    }

    return {
        id: "view-session-feedback",
        label: "Ver lo que enviaste",
        hint: "Tu mensaje y las respuestas del entrenador",
        action: "view_session_feedback",
        sessionId: input.lastCompletedSessionId,
    };
}

function buildSecondaryLink(input: InsightDeepLinksInput): InsightDeepLink | null {
    if (input.hasTrainerResponse) {
        return {
            id: "feedback-history",
            label: "Historial de notas",
            hint: "Toda la conversación con tu entrenador",
            action: "feedback_history",
        };
    }

    if (input.hasPersonalRecord && input.topRecordExerciseId != null) {
        const name = input.topRecordExerciseName?.trim() || "tu ejercicio";
        return {
            id: "pr-evolution",
            label: `Evolución de ${name}`,
            hint: "Gráfica y récords del movimiento",
            action: "progress_exercise",
            exerciseId: input.topRecordExerciseId,
        };
    }

    if (input.mode === "train_today_done" || input.mode === "week_done") {
        return buildPostSessionFeedbackLink(input);
    }

    return {
        id: "feedback-history",
        label: "Historial de notas",
        hint: "Mensajes y feedback con tu entrenador",
        action: "feedback_history",
    };
}

/**
 * Máximo 2 enlaces: progreso (fijo) + uno contextual.
 */
export function buildInsightDeepLinks(input: InsightDeepLinksInput): InsightDeepLink[] {
    const links: InsightDeepLink[] = [
        {
            id: "progress",
            label: "Ver mi progreso",
            hint: "Pesos, récords y evolución semanal",
            action: "progress",
        },
    ];

    const secondary = buildSecondaryLink(input);
    if (secondary) {
        links.push(secondary);
    }

    return links;
}
