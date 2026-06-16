/**
 * athleteSessionSync.spec.ts — Tests cola offline atleta.
 */

import { describe, expect, it, vi } from "vitest";
import {
    dedupePendingLogs,
    finishOnlineSession,
    flushPendingSessionSync,
} from "./athleteSessionSync";
import type { PendingExerciseLog } from "./athleteSessionTypes";

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

describe("finishOnlineSession", () => {
    it("calls completeSession when there is no queued complete (test env: no IDB)", async () => {
        const completeSession = vi.fn().mockResolvedValue(undefined);
        const updateExercise = vi.fn();

        const result = await finishOnlineSession(42, { updateExercise, completeSession });

        expect(completeSession).toHaveBeenCalledWith(42);
        expect(result.alreadyCompleted).toBe(false);
    });

    it("propagates errors from completeSession", async () => {
        const completeSession = vi.fn().mockRejectedValue(new Error("network"));

        await expect(
            finishOnlineSession(42, { updateExercise: vi.fn(), completeSession })
        ).rejects.toThrow("network");
    });
});

describe("flushPendingSessionSync", () => {
    it("is a no-op when IndexedDB is unavailable (test env)", async () => {
        const result = await flushPendingSessionSync(1, {
            updateExercise: vi.fn(),
            completeSession: vi.fn(),
        });
        expect(result).toEqual({ syncedLogs: 0, syncedCompletes: 0, conflict: false });
    });
});
