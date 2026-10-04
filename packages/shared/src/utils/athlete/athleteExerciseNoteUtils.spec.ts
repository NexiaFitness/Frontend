/**
 * athleteExerciseNoteUtils.spec.ts — D6 payloads y mapa progress.
 */

import { describe, expect, it } from "vitest";
import {
    buildExerciseNoteUpsertPayload,
    collectBlockExerciseNotePayloads,
    exerciseNotesMapFromProgress,
} from "./athleteExerciseNoteUtils";

describe("athleteExerciseNoteUtils", () => {
    it("buildExerciseNoteUpsertPayload incluye PUT cuando hay texto", () => {
        const payload = buildExerciseNoteUpsertPayload(10, 895, "  Hombro  ");
        expect(payload).toEqual({
            training_session_id: 10,
            block_exercise_id: 895,
            athlete_note: "Hombro",
        });
    });

    it("buildExerciseNoteUpsertPayload borra con null si vacío", () => {
        expect(buildExerciseNoteUpsertPayload(10, 895, "   ").athlete_note).toBeNull();
    });

    it("exerciseNotesMapFromProgress indexa por block_exercise_id", () => {
        const map = exerciseNotesMapFromProgress({
            training_session_id: 1,
            steps: [],
            blocks: [],
            exercise_notes: [
                {
                    block_exercise_id: 5,
                    exercise_id: 2,
                    session_block_id: 3,
                    athlete_note: "Ok",
                },
            ],
            pending_count: 0,
        });
        expect(map.get(5)).toBe("Ok");
    });

    it("collectBlockExerciseNotePayloads emite un PUT por slot con texto", () => {
        const payloads = collectBlockExerciseNotePayloads(
            99,
            new Map([
                [1, "A"],
                [2, ""],
            ])
        );
        expect(payloads).toHaveLength(2);
        expect(payloads[0].athlete_note).toBe("A");
        expect(payloads[1].athlete_note).toBeNull();
    });
});
