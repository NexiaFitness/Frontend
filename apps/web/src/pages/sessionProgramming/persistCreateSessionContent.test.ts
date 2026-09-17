import { describe, expect, it, vi } from "vitest";
import {
    persistStandaloneSessionExercises,
    persistTrainingSessionConstructorContent,
    syncStandaloneSessionExercises,
} from "./persistCreateSessionContent";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";

describe("persistCreateSessionContent (G8)", () => {
    it("persistTrainingSessionConstructorContent returns ok when all blocks and exercises save", async () => {
        const createSessionBlock = vi.fn(() => ({
            unwrap: () => Promise.resolve({ id: 101 }),
        }));
        const createSessionBlockExercise = vi.fn(() => ({
            unwrap: () => Promise.resolve({}),
        }));

        const row: ConstructorRow = {
            id: "r1",
            blockTypeId: 1,
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            rounds: null,
            rest: 60,
            timeCap: null,
            intervalSeconds: null,
            exercises: [
                {
                    id: "e1",
                    exerciseId: 10,
                    exerciseName: "Press",
                    plannedReps: "8",
                    plannedWeight: 50,
                    plannedAssistanceKg: null,
                    plannedDuration: null,
                    effortCharacter: null,
                    effortValue: null,
                    notes: null,
                },
            ],
        };

        const result = await persistTrainingSessionConstructorContent({
            sessionId: 55,
            constructorRows: [row],
            createSessionBlock,
            createSessionBlockExercise,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.blocksSaved).toBe(1);
            expect(result.exercisesSaved).toBeGreaterThan(0);
        }
        expect(createSessionBlock).toHaveBeenCalledTimes(1);
        expect(createSessionBlockExercise.mock.calls.length).toBeGreaterThan(0);
    });

    it("persistTrainingSessionConstructorContent fails without swallowing after partial block failure", async () => {
        const createSessionBlock = vi.fn(() => ({
            unwrap: () => Promise.reject(new Error("network")),
        }));
        const createSessionBlockExercise = vi.fn(() => ({
            unwrap: () => Promise.resolve({}),
        }));

        const row: ConstructorRow = {
            id: "r1",
            blockTypeId: 1,
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            rounds: null,
            rest: 60,
            timeCap: null,
            intervalSeconds: null,
            exercises: [],
        };

        const result = await persistTrainingSessionConstructorContent({
            sessionId: 55,
            constructorRows: [row],
            createSessionBlock,
            createSessionBlockExercise,
        });

        expect(result.ok).toBe(false);
        expect(createSessionBlockExercise).not.toHaveBeenCalled();
    });

    it("persistStandaloneSessionExercises stops on first exercise failure", async () => {
        let call = 0;
        const createStandaloneExercise = vi.fn(() => ({
            unwrap: () => {
                call += 1;
                if (call === 2) return Promise.reject(new Error("fail"));
                return Promise.resolve({});
            },
        }));

        const result = await persistStandaloneSessionExercises({
            sessionId: 9,
            exercises: [
                {
                    exercise_id: 1,
                    order_in_session: 1,
                    planned_sets: 3,
                    planned_reps: 8,
                    planned_weight: 40,
                    planned_rest: 60,
                    notes: null,
                },
                {
                    exercise_id: 2,
                    order_in_session: 2,
                    planned_sets: 3,
                    planned_reps: 8,
                    planned_weight: 40,
                    planned_rest: 60,
                    notes: null,
                },
            ],
            createStandaloneExercise,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.savedCount).toBe(1);
        }
        expect(createStandaloneExercise).toHaveBeenCalledTimes(2);
    });

    it("syncStandaloneSessionExercises deletes removed, updates and creates", async () => {
        const deleteStandaloneExercise = vi.fn(() => ({
            unwrap: () => Promise.resolve({ message: "ok" }),
        }));
        const updateStandaloneExercise = vi.fn(() => ({
            unwrap: () => Promise.resolve({}),
        }));
        const createStandaloneExercise = vi.fn(() => ({
            unwrap: () => Promise.resolve({}),
        }));

        const result = await syncStandaloneSessionExercises({
            sessionId: 5,
            existingServerIds: [10, 11],
            desired: [
                {
                    serverExerciseId: 10,
                    exercise_id: 1,
                    order_in_session: 1,
                    planned_sets: 3,
                    planned_reps: 8,
                    planned_weight: 40,
                    planned_rest: 60,
                    notes: null,
                },
                {
                    exercise_id: 2,
                    order_in_session: 2,
                    planned_sets: 4,
                    planned_reps: 6,
                    planned_weight: 50,
                    planned_rest: 90,
                    notes: "new",
                },
            ],
            deleteStandaloneExercise,
            updateStandaloneExercise,
            createStandaloneExercise,
        });

        expect(result.ok).toBe(true);
        expect(deleteStandaloneExercise).toHaveBeenCalledWith(11);
        expect(updateStandaloneExercise).toHaveBeenCalledTimes(1);
        expect(createStandaloneExercise).toHaveBeenCalledTimes(1);
    });
});
