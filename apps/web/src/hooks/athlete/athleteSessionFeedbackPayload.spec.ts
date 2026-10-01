import { describe, expect, it } from "vitest";
import {
    buildAthleteSessionFeedbackCreateBody,
    EMPTY_ATHLETE_SESSION_FEEDBACK_TOUCHED,
} from "./athleteSessionFeedbackPayload";

describe("buildAthleteSessionFeedbackCreateBody (B8)", () => {
    it("envía null en escalas no tocadas (no defaults inventados)", () => {
        const body = buildAthleteSessionFeedbackCreateBody(42, {
            effort: 7,
            fatigue: 5,
            sleep: 7,
            motivation: 7,
            pain: "",
            notes: "",
            touched: { ...EMPTY_ATHLETE_SESSION_FEEDBACK_TOUCHED, effort: true },
        });

        expect(body).toEqual({
            client_id: 42,
            perceived_effort: 7,
            fatigue_level: null,
            sleep_quality: null,
            motivation_level: null,
            pain_or_discomfort: null,
            notes: null,
        });
    });

    it("incluye solo campos tocados y textos opcionales", () => {
        const body = buildAthleteSessionFeedbackCreateBody(1, {
            effort: null,
            fatigue: 8,
            sleep: null,
            motivation: null,
            pain: "  rodilla  ",
            notes: "",
            touched: {
                ...EMPTY_ATHLETE_SESSION_FEEDBACK_TOUCHED,
                fatigue: true,
            },
        });

        expect(body.perceived_effort).toBeNull();
        expect(body.fatigue_level).toBe(8);
        expect(body.pain_or_discomfort).toBe("rodilla");
    });
});
