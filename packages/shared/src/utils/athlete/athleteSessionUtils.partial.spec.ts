import { describe, expect, it } from "vitest";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    PARTIAL_SESSION_COMPLETION_THRESHOLD,
    getCompletedSessionCompletionPercent,
    getSessionStatusLabel,
    isPartiallyClosedSession,
} from "./athleteSessionUtils";

function completedSession(
    completion_percentage: number | null | undefined
): TrainingSession {
    return {
        id: 1,
        session_name: "Test",
        status: "completed",
        completion_percentage,
    } as TrainingSession;
}

describe("partial session completion (F3c-FE-02)", () => {
    it("flags completed sessions below threshold", () => {
        expect(isPartiallyClosedSession(completedSession(49.9))).toBe(true);
        expect(isPartiallyClosedSession(completedSession(0))).toBe(true);
    });

    it("does not flag completed sessions at or above threshold", () => {
        expect(isPartiallyClosedSession(completedSession(50))).toBe(false);
        expect(isPartiallyClosedSession(completedSession(100))).toBe(false);
    });

    it("ignores non-completed sessions", () => {
        expect(
            isPartiallyClosedSession({ status: "planned", completion_percentage: 10 })
        ).toBe(false);
    });

    it("returns Cerrada parcial label when below threshold", () => {
        expect(getSessionStatusLabel(completedSession(30))).toBe("Cerrada parcial");
        expect(getSessionStatusLabel(completedSession(80))).toBe("Completada");
    });

    it("clamps completion percent to 0–100", () => {
        expect(getCompletedSessionCompletionPercent(completedSession(150))).toBe(100);
        expect(getCompletedSessionCompletionPercent(completedSession(-5))).toBe(0);
    });

    it("exports threshold at 50", () => {
        expect(PARTIAL_SESSION_COMPLETION_THRESHOLD).toBe(50);
    });
});
