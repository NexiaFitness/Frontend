/**
 * B-13 / B-34 — badge de estado: cierre y estados persistidos antes que «hoy».
 */
import { describe, expect, it } from "vitest";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { resolveAthleteSessionStatusBadge } from "../athleteSessionsPresentation";

function session(
    partial: Partial<TrainingSession> & { id: number; status: string }
): TrainingSession {
    return {
        session_name: "QA",
        session_date: "2026-11-16",
        completion_percentage: null,
        ...partial,
    } as TrainingSession;
}

describe("resolveAthleteSessionStatusBadge (B-13)", () => {
    it("completed at 100% today is completed, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 1, status: "completed", completion_percentage: 100 })
            )
        ).toBe("completed");
    });

    it("completed below threshold today is partial, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 2, status: "completed", completion_percentage: 0 })
            )
        ).toBe("partial");
    });

    it("planned today stays today", () => {
        expect(
            resolveAthleteSessionStatusBadge(session({ id: 3, status: "planned" }))
        ).toBe("today");
    });
});

describe("resolveAthleteSessionStatusBadge (B-34)", () => {
    it("cancelled today is cancelled, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(session({ id: 4, status: "cancelled" }))
        ).toBe("cancelled");
    });

    it("cancelled on another day stays cancelled", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 5, status: "cancelled", session_date: "2026-11-10" })
            )
        ).toBe("cancelled");
    });

    it("in_progress today is in_progress, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(session({ id: 6, status: "in_progress" }))
        ).toBe("in_progress");
    });

    it("in_progress on another day stays in_progress", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 7, status: "in_progress", session_date: "2026-11-10" })
            )
        ).toBe("in_progress");
    });

    it("skipped today is skipped, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(session({ id: 8, status: "skipped" }))
        ).toBe("skipped");
    });

    it("planned not today is planned", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 9, status: "planned", session_date: "2026-12-01" })
            )
        ).toBe("planned");
    });

    it("archived today is archived, not today", () => {
        expect(
            resolveAthleteSessionStatusBadge(session({ id: 10, status: "archived" }))
        ).toBe("archived");
    });

    it("archived on another day stays archived", () => {
        expect(
            resolveAthleteSessionStatusBadge(
                session({ id: 11, status: "archived", session_date: "2026-11-10" })
            )
        ).toBe("archived");
    });
});
