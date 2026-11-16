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

    it("B-13: completed today uses Completada/parcial, not Hoy (label matches %)", () => {
        const today = new Date(2026, 10, 16);
        const todayKey = "2026-11-16";
        const full = {
            ...completedSession(100),
            session_date: todayKey,
        } as TrainingSession;
        const partial = {
            ...completedSession(0),
            session_date: todayKey,
        } as TrainingSession;
        const plannedToday = {
            id: 2,
            session_name: "Pendiente",
            status: "planned",
            session_date: todayKey,
            completion_percentage: null,
        } as TrainingSession;

        expect(getSessionStatusLabel(full, today)).toBe("Completada");
        expect(getSessionStatusLabel(partial, today)).toBe("Cerrada parcial");
        expect(getSessionStatusLabel(plannedToday, today)).toBe("Hoy");
    });

    it("B-34: persisted status wins over Hoy / Programada", () => {
        const today = new Date(2026, 10, 16);
        const todayKey = "2026-11-16";
        const otherKey = "2026-11-10";
        const base = {
            id: 10,
            session_name: "Estado",
            completion_percentage: null,
        };

        const cancelledToday = {
            ...base,
            status: "cancelled",
            session_date: todayKey,
        } as TrainingSession;
        const cancelledOther = {
            ...base,
            id: 11,
            status: "cancelled",
            session_date: otherKey,
        } as TrainingSession;
        const inProgressToday = {
            ...base,
            id: 12,
            status: "in_progress",
            session_date: todayKey,
        } as TrainingSession;
        const inProgressOther = {
            ...base,
            id: 13,
            status: "in_progress",
            session_date: otherKey,
        } as TrainingSession;
        const skippedToday = {
            ...base,
            id: 14,
            status: "skipped",
            session_date: todayKey,
        } as TrainingSession;
        const skippedOther = {
            ...base,
            id: 15,
            status: "skipped",
            session_date: otherKey,
        } as TrainingSession;
        const plannedOther = {
            ...base,
            id: 16,
            status: "planned",
            session_date: "2026-12-01",
        } as TrainingSession;
        const plannedPast = {
            ...base,
            id: 17,
            status: "planned",
            session_date: otherKey,
        } as TrainingSession;
        const modifiedToday = {
            ...base,
            id: 18,
            status: "modified",
            session_date: todayKey,
        } as TrainingSession;
        const archivedOther = {
            ...base,
            id: 19,
            status: "archived",
            session_date: otherKey,
        } as TrainingSession;

        expect(getSessionStatusLabel(cancelledToday, today)).toBe("Cancelada");
        expect(getSessionStatusLabel(cancelledOther, today)).toBe("Cancelada");
        expect(getSessionStatusLabel(inProgressToday, today)).toBe("En curso");
        expect(getSessionStatusLabel(inProgressOther, today)).toBe("En curso");
        expect(getSessionStatusLabel(skippedToday, today)).toBe("Omitida");
        expect(getSessionStatusLabel(skippedOther, today)).toBe("Omitida");
        expect(getSessionStatusLabel(plannedOther, today)).toBe("Programada");
        expect(getSessionStatusLabel(plannedPast, today)).toBe("Pendiente de registro");
        expect(getSessionStatusLabel(modifiedToday, today)).toBe("Hoy");
        expect(getSessionStatusLabel(archivedOther, today)).toBe("Archivada");
    });

    it("clamps completion percent to 0–100", () => {
        expect(getCompletedSessionCompletionPercent(completedSession(150))).toBe(100);
        expect(getCompletedSessionCompletionPercent(completedSession(-5))).toBe(0);
    });

    it("exports threshold at 50", () => {
        expect(PARTIAL_SESSION_COMPLETION_THRESHOLD).toBe(50);
    });
});
