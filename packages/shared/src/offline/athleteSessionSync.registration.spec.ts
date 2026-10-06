/**
 * athleteSessionSync.registration.spec.ts — FE-9 cola offline vs ventana D5.
 */

import { describe, expect, it, vi } from "vitest";
import {
    flushPendingSessionSync,
    isRegistrationWindowClosedSyncError,
} from "./athleteSessionSync";

vi.mock("./athleteSessionDb", () => ({
    isIndexedDbAvailable: () => true,
    getPendingExecutions: async () => [
        {
            id: "e1",
            sessionId: 99,
            stepKey: "k1",
            payload: { training_session_id: 99, step_key: "k1", exercise_id: 1 },
            ts: 1,
            retryCount: 0,
        },
    ],
    getPendingTimedResults: async () => [],
    getPendingExerciseNotes: async () => [],
    getPendingLogs: async () => [],
    getPendingCompletes: async () => [],
    removePendingExecution: vi.fn(),
    removePendingTimedResult: vi.fn(),
    removePendingExerciseNote: vi.fn(),
    removePendingLog: vi.fn(),
    removePendingComplete: vi.fn(),
    clearSessionOfflineData: vi.fn(),
}));

describe("isRegistrationWindowClosedSyncError", () => {
    it("detecta 403 con mensaje de plazo cerrado", () => {
        expect(
            isRegistrationWindowClosedSyncError({
                status: 403,
                data: { detail: "El plazo de registro cerró (máximo 7 días)" },
            })
        ).toBe(true);
        expect(isRegistrationWindowClosedSyncError({ status: 404 })).toBe(false);
    });
});

describe("flushPendingSessionSync FE-9", () => {
    it("descarta execution pendiente en 403 sin relanzar", async () => {
        const { removePendingExecution } = await import("./athleteSessionDb");
        const adapter = {
            updateExercise: vi.fn(),
            completeSession: vi.fn(),
            postExecution: vi.fn().mockRejectedValue({
                status: 403,
                data: { detail: "El plazo de registro cerró" },
            }),
            postTimedResult: vi.fn(),
            putExerciseNote: vi.fn(),
        };
        const result = await flushPendingSessionSync(99, adapter);
        expect(result.registrationWindowClosed).toBe(true);
        expect(result.syncedExecutions).toBe(0);
        expect(removePendingExecution).toHaveBeenCalledWith("e1");
        expect(adapter.postExecution).toHaveBeenCalledTimes(1);
    });
});
