import { describe, expect, it } from "vitest";
import {
    buildInsightDeepLinks,
    resolveInsightDeepLinkSessionContext,
} from "./athleteInsightDeepLinks";
import type { ClientFeedback } from "../../types/training";
import type { TrainingSession } from "../../types/trainingSessions";

function session(id: number, status: TrainingSession["status"], date: string): TrainingSession {
    return {
        id,
        status,
        session_date: date,
    } as TrainingSession;
}

function feedback(sessionId: number): ClientFeedback {
    return {
        id: sessionId,
        training_session_id: sessionId,
        feedback_date: "2026-06-18T10:00:00Z",
    } as ClientFeedback;
}

describe("buildInsightDeepLinks", () => {
    it("week_done sin feedback → Cuéntale envía a sesión", () => {
        const ctx = resolveInsightDeepLinkSessionContext({
            sessions: [session(42, "completed", "2026-06-18")],
            feedbackItems: [],
        });

        const links = buildInsightDeepLinks({
            mode: "week_done",
            hasTrainerResponse: false,
            hasPersonalRecord: false,
            ...ctx,
        });

        expect(links[1]).toMatchObject({
            label: "Cuéntale cómo te fue",
            action: "submit_session_feedback",
            sessionId: 42,
        });
    });

    it("week_done con feedback → Ver tu feedback", () => {
        const ctx = resolveInsightDeepLinkSessionContext({
            sessions: [session(42, "completed", "2026-06-18")],
            feedbackItems: [feedback(42)],
        });

        const links = buildInsightDeepLinks({
            mode: "week_done",
            hasTrainerResponse: false,
            hasPersonalRecord: false,
            ...ctx,
        });

        expect(links[1]).toMatchObject({
            label: "Ver lo que enviaste",
            action: "view_session_feedback",
            sessionId: 42,
        });
    });

    it("hasTrainerResponse → Historial (campana), no Cuéntale", () => {
        const ctx = resolveInsightDeepLinkSessionContext({
            sessions: [session(42, "completed", "2026-06-18")],
            feedbackItems: [],
        });

        const links = buildInsightDeepLinks({
            mode: "week_done",
            hasTrainerResponse: true,
            hasPersonalRecord: false,
            ...ctx,
        });

        expect(links[1]).toMatchObject({
            label: "Historial de notas",
            action: "feedback_history",
        });
    });
});
