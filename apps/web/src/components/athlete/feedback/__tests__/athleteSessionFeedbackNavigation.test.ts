/**
 * athleteSessionFeedbackNavigation.test.ts — Rutas y query focus del formulario V07.
 */

import { describe, expect, it } from "vitest";
import {
    ATHLETE_FEEDBACK_FOCUS_NOTES,
    ATHLETE_FEEDBACK_FOCUS_PAIN,
    athleteSessionFeedbackPath,
    feedbackFormExpandsDetails,
    feedbackFormFocusesPain,
} from "../athleteSessionFeedbackNavigation";

describe("athleteSessionFeedbackNavigation", () => {
    describe("athleteSessionFeedbackPath", () => {
        it("ruta base sin focus", () => {
            expect(athleteSessionFeedbackPath(4272)).toBe("/dashboard/sessions/4272/feedback");
        });

        it("añade ?focus=pain desde consulta lesión", () => {
            expect(athleteSessionFeedbackPath(4272, { focusPain: true })).toBe(
                `/dashboard/sessions/4272/feedback?focus=${ATHLETE_FEEDBACK_FOCUS_PAIN}`
            );
        });
    });

    describe("feedbackFormExpandsDetails", () => {
        it("expande con focus pain o notes legacy", () => {
            expect(
                feedbackFormExpandsDetails(new URLSearchParams(`focus=${ATHLETE_FEEDBACK_FOCUS_PAIN}`))
            ).toBe(true);
            expect(
                feedbackFormExpandsDetails(new URLSearchParams(`focus=${ATHLETE_FEEDBACK_FOCUS_NOTES}`))
            ).toBe(true);
        });

        it("no expande sin focus", () => {
            expect(feedbackFormExpandsDetails(new URLSearchParams(""))).toBe(false);
        });
    });

    describe("feedbackFormFocusesPain", () => {
        it("activa scroll a dolor con focus pain o notes legacy", () => {
            expect(
                feedbackFormFocusesPain(new URLSearchParams(`focus=${ATHLETE_FEEDBACK_FOCUS_PAIN}`))
            ).toBe(true);
            expect(
                feedbackFormFocusesPain(new URLSearchParams(`focus=${ATHLETE_FEEDBACK_FOCUS_NOTES}`))
            ).toBe(true);
        });

        it("no activa scroll sin focus", () => {
            expect(feedbackFormFocusesPain(new URLSearchParams(""))).toBe(false);
        });
    });
});
