/**
 * athleteSessionFeedbackPayload.ts — POST feedback: null en campos no tocados (B8).
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import type { ClientFeedbackCreate } from "@nexia/shared/types/training";

export type AthleteSessionFeedbackTouched = {
    effort: boolean;
    fatigue: boolean;
    sleep: boolean;
    motivation: boolean;
};

export type AthleteSessionFeedbackDraft = {
    effort: number | null;
    fatigue: number | null;
    sleep: number | null;
    motivation: number | null;
    pain: string;
    notes: string;
    touched: AthleteSessionFeedbackTouched;
};

export const EMPTY_ATHLETE_SESSION_FEEDBACK_TOUCHED: AthleteSessionFeedbackTouched = {
    effort: false,
    fatigue: false,
    sleep: false,
    motivation: false,
};

export function buildAthleteSessionFeedbackCreateBody(
    clientId: number,
    draft: AthleteSessionFeedbackDraft
): ClientFeedbackCreate {
    return {
        client_id: clientId,
        perceived_effort: draft.touched.effort ? draft.effort : null,
        fatigue_level: draft.touched.fatigue ? draft.fatigue : null,
        sleep_quality: draft.touched.sleep ? draft.sleep : null,
        motivation_level: draft.touched.motivation ? draft.motivation : null,
        pain_or_discomfort: draft.pain.trim() || null,
        notes: draft.notes.trim() || null,
    };
}
