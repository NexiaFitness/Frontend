/**
 * athleteSessionSync.spec.ts — Tests dedupe cola offline atleta.
 */

import { describe, expect, it } from "vitest";
import { dedupePendingLogs } from "./athleteSessionSync";
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
