/**
 * athleteSessionSync.spec.ts — Tests cola offline atleta (F1 + F5).
 */

import { describe, expect, it, vi } from "vitest";
import {
    dedupePendingExecutions,
    dedupePendingLogs,
    dedupePendingTimedResults,
    finishOnlineSession,
    flushPendingSessionSync,
    prepareOfflineExecutionPayload,
} from "./athleteSessionSync";
import type { PendingExecutionLog, PendingExerciseLog, PendingTimedResultLog } from "./athleteSessionTypes";

function log(id: string, blockExerciseId: number, ts: number): PendingExerciseLog {
    return {
        id,
        sessionId: 1,
        blockExerciseId,
        payload: { actual_reps: "8", actual_sets: 1 },
        ts,
        retryCount: 0,
    };
}

function executionLog(
    id: string,
    stepKey: string,
    ts: number,
    sessionId = 1
): PendingExecutionLog {
    return {
        id,
        sessionId,
        stepKey,
        payload: {
            training_session_id: sessionId,
            step_key: stepKey,
            exercise_id: 42,
            weight_kg: 20,
            reps: 10,
        },
        ts,
        retryCount: 0,
    };
}

function timedLog(id: string, stepKey: string, ts: number): PendingTimedResultLog {
    return {
        id,
        sessionId: 1,
        stepKey,
        payload: {
            training_session_id: 1,
            group_id: "g1",
            step_key: stepKey,
            timed_mode: "amrap",
            rounds_completed: 5,
        },
        ts,
        retryCount: 0,
    };
}

describe("dedupePendingLogs", () => {
    it("keeps latest log per blockExerciseId", () => {
        const result = dedupePendingLogs([
            log("a", 10, 100),
            log("b", 10, 200),
            log("c", 20, 150),
        ]);
        expect(result).toHaveLength(2);
        expect(result.find((r) => r.blockExerciseId === 10)?.id).toBe("b");
        expect(result.find((r) => r.blockExerciseId === 20)?.id).toBe("c");
    });

    it("returns empty for empty input", () => {
        expect(dedupePendingLogs([])).toEqual([]);
    });
});

describe("dedupePendingExecutions", () => {
    it("keeps latest log per stepKey within session", () => {
        const result = dedupePendingExecutions([
            executionLog("a", "SBE:1:S1", 100),
            executionLog("b", "SBE:1:S1", 200),
            executionLog("c", "SBE:1:S2", 150),
        ]);
        expect(result).toHaveLength(2);
        expect(result.find((r) => r.stepKey === "SBE:1:S1")?.id).toBe("b");
        expect(result.find((r) => r.stepKey === "SBE:1:S2")?.id).toBe("c");
    });
});

describe("dedupePendingTimedResults", () => {
    it("keeps latest timed result per stepKey", () => {
        const result = dedupePendingTimedResults([
            timedLog("a", "g1-timed", 100),
            timedLog("b", "g1-timed", 200),
        ]);
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe("b");
    });
});

const noopAdapter = {
    updateExercise: vi.fn(),
    completeSession: vi.fn(),
    postExecution: vi.fn(),
    postTimedResult: vi.fn(),
};

describe("prepareOfflineExecutionPayload", () => {
    it("sets offline_sync source and keeps suggestion_snapshot", () => {
        const prepared = prepareOfflineExecutionPayload({
            training_session_id: 1,
            step_key: "SBE:1:S1",
            exercise_id: 42,
            weight_kg: 40,
            suggestion_snapshot: {
                suggestion_shown: true,
                suggested_weight_kg: 42.5,
                reference_weight_kg: 40,
                suggestion_action: "increase",
                load_step_kg: 2.5,
                confidence: "high",
            },
        });
        expect(prepared.source).toBe("offline_sync");
        expect(prepared.suggestion_snapshot?.suggested_weight_kg).toBe(42.5);
    });

    it("does not override explicit source", () => {
        const prepared = prepareOfflineExecutionPayload({
            training_session_id: 1,
            step_key: "SBE:1:S1",
            exercise_id: 42,
            source: "run_live",
        });
        expect(prepared.source).toBe("run_live");
    });
});

describe("finishOnlineSession", () => {
    it("calls completeSession when there is no queued complete (test env: no IDB)", async () => {
        const completeSession = vi.fn().mockResolvedValue(undefined);

        const result = await finishOnlineSession(42, {
            ...noopAdapter,
            completeSession,
        });

        expect(completeSession).toHaveBeenCalledWith(42);
        expect(result.alreadyCompleted).toBe(false);
    });

    it("propagates errors from completeSession", async () => {
        const completeSession = vi.fn().mockRejectedValue(new Error("network"));

        await expect(
            finishOnlineSession(42, { ...noopAdapter, completeSession })
        ).rejects.toThrow("network");
    });
});

describe("flushPendingSessionSync", () => {
    it("is a no-op when IndexedDB is unavailable (test env)", async () => {
        const result = await flushPendingSessionSync(1, noopAdapter);
        expect(result).toEqual({
            syncedLogs: 0,
            syncedExecutions: 0,
            syncedTimedResults: 0,
            syncedCompletes: 0,
            conflict: false,
        });
    });
});
