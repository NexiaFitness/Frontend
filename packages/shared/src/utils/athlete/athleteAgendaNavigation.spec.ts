import { describe, expect, it } from "vitest";
import type { TrainingSession } from "../../types/trainingSessions";
import { resolveAthleteSessionOpenPath } from "./athleteAgendaNavigation";

const baseSession = {
    id: 42,
    status: "planned",
    session_date: "2026-10-01",
} as TrainingSession;

describe("resolveAthleteSessionOpenPath", () => {
    it("completed session opens V04 preview, not summary", () => {
        expect(
            resolveAthleteSessionOpenPath({
                ...baseSession,
                status: "completed",
            })
        ).toBe("/dashboard/sessions/42");
    });

    it("past session with pending registration opens log mode", () => {
        expect(
            resolveAthleteSessionOpenPath(
                { ...baseSession, status: "planned" },
                {
                    session_id: 42,
                    registered_count: 0,
                    pending_count: 5,
                    registration_editable: true,
                }
            )
        ).toBe("/dashboard/sessions/42?mode=log");
    });

    it("future session opens preview", () => {
        expect(
            resolveAthleteSessionOpenPath({
                ...baseSession,
                session_date: "2099-01-01",
                status: "planned",
            })
        ).toBe("/dashboard/sessions/42");
    });
});
