/**
 * athleteFeedbackUtils.ts — Feedback atleta + respuestas entrenador (F3a).
 */

import type { ClientFeedback } from "../../types/training";

export const ATHLETE_LAST_SEEN_TRAINER_RESPONSE_KEY =
    "athleteLastSeenTrainerResponseAt";

export function readLastSeenTrainerResponseAt(): string | null {
    try {
        return localStorage.getItem(ATHLETE_LAST_SEEN_TRAINER_RESPONSE_KEY);
    } catch {
        return null;
    }
}

export function writeLastSeenTrainerResponseAt(iso: string): void {
    try {
        localStorage.setItem(ATHLETE_LAST_SEEN_TRAINER_RESPONSE_KEY, iso);
    } catch {
        /* ignore */
    }
}

/** Marca como leídas todas las respuestas del entrenador hasta ahora. */
export function markTrainerResponsesSeen(feedbackItems: ClientFeedback[]): void {
    const latest = feedbackItems
        .filter((item) => item.trainer_response_at)
        .map((item) => new Date(item.trainer_response_at!).getTime())
        .filter((t) => Number.isFinite(t));

    if (latest.length === 0) return;
    writeLastSeenTrainerResponseAt(new Date(Math.max(...latest)).toISOString());
}

export function hasUnreadTrainerResponse(
    feedbackItems: ClientFeedback[],
    lastSeenAt: string | null = readLastSeenTrainerResponseAt()
): boolean {
    const seenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
    return feedbackItems.some((item) => {
        if (!item.trainer_response?.trim() || !item.trainer_response_at) {
            return false;
        }
        const at = new Date(item.trainer_response_at).getTime();
        return Number.isFinite(at) && at > seenMs;
    });
}

export function sortFeedbackNewestFirst(items: ClientFeedback[]): ClientFeedback[] {
    return dedupeFeedbackBySession(items).sort(
        (a, b) =>
            new Date(b.feedback_date).getTime() - new Date(a.feedback_date).getTime()
    );
}

/**
 * Una fila por sesión — conserva la de mayor id (más reciente).
 * Defensa en profundidad si hay datos legacy sin migrar.
 */
export function dedupeFeedbackBySession(items: ClientFeedback[]): ClientFeedback[] {
    const bySession = new Map<number, ClientFeedback>();
    for (const item of items) {
        const prev = bySession.get(item.training_session_id);
        if (!prev || item.id > prev.id) {
            bySession.set(item.training_session_id, item);
        }
    }
    return Array.from(bySession.values());
}

/** True si el atleta ya envió feedback para esa sesión. */
export function sessionHasClientFeedback(
    sessionId: number,
    feedbackItems: ClientFeedback[]
): boolean {
    return feedbackItems.some((item) => item.training_session_id === sessionId);
}
