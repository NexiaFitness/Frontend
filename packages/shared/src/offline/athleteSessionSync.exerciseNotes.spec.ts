/**
 * athleteSessionSync.exerciseNotes.spec.ts — D6 dedupe y 403 offline.
 */

import { describe, expect, it } from "vitest";
import {
    dedupePendingExerciseNotes,
    isRegistrationWindowClosedSyncError,
} from "./athleteSessionSync";
import type { PendingAthleteExerciseNoteLog } from "./athleteSessionTypes";

describe("D6 offline exercise notes", () => {
    it("dedupe last-write-wins por (sessionId, blockExerciseId)", () => {
        const logs: PendingAthleteExerciseNoteLog[] = [
            {
                id: "a",
                sessionId: 1,
                blockExerciseId: 10,
                athleteNote: "v1",
                ts: 100,
                retryCount: 0,
            },
            {
                id: "b",
                sessionId: 1,
                blockExerciseId: 10,
                athleteNote: "v2",
                ts: 200,
                retryCount: 0,
            },
        ];
        const out = dedupePendingExerciseNotes(logs);
        expect(out).toHaveLength(1);
        expect(out[0].athleteNote).toBe("v2");
    });

    it("isRegistrationWindowClosedSyncError detecta 403 ventana", () => {
        expect(
            isRegistrationWindowClosedSyncError({
                status: 403,
                data: { detail: "El plazo de registro ha cerrado" },
            })
        ).toBe(true);
        expect(isRegistrationWindowClosedSyncError({ status: 404 })).toBe(false);
    });
});
