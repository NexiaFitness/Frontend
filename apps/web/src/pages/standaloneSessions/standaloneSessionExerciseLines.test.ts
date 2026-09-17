import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import {
    buildStandaloneExerciseLinesFromConstructor,
    hydrateConstructorRowsFromStandaloneExercises,
} from "./standaloneSessionExerciseLines";

describe("standaloneSessionExerciseLines", () => {
    it("hydrates and round-trips server exercise ids", () => {
        const rows = hydrateConstructorRowsFromStandaloneExercises({
            defaultBlockTypeId: 7,
            exerciseNameById: new Map([[42, "Press banca"]]),
            exercises: [
                {
                    id: 99,
                    standalone_session_id: 1,
                    exercise_id: 42,
                    order_in_session: 1,
                    planned_sets: 3,
                    planned_reps: 8,
                    planned_weight: 60,
                    planned_assistance_kg: null,
                    planned_duration: null,
                    planned_distance: null,
                    planned_rest: 90,
                    actual_sets: null,
                    actual_reps: null,
                    actual_weight: null,
                    actual_duration: null,
                    actual_distance: null,
                    actual_rest: null,
                    notes: null,
                    created_at: "",
                    updated_at: "",
                    is_active: true,
                },
            ],
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].exercises[0].serverExerciseId).toBe(99);

        const lines = buildStandaloneExerciseLinesFromConstructor(rows);
        expect(lines[0].serverExerciseId).toBe(99);
        expect(lines[0].exercise_id).toBe(42);
        expect(lines[0].planned_rest).toBe(90);
    });

    it("buildStandaloneExerciseLinesFromConstructor respects row order", () => {
        const row: ConstructorRow = {
            id: "r1",
            blockTypeId: 1,
            setType: SET_TYPE.SINGLE_SET,
            sets: 1,
            rounds: null,
            timeCap: null,
            intervalSeconds: null,
            rest: 45,
            exercises: [
                {
                    id: "e1",
                    exerciseId: 5,
                    exerciseName: "Row",
                    plannedReps: "10",
                    plannedWeight: 20,
                    plannedAssistanceKg: null,
                    plannedDuration: null,
                    effortCharacter: null,
                    effortValue: null,
                    notes: null,
                },
            ],
        };
        const lines = buildStandaloneExerciseLinesFromConstructor([row]);
        expect(lines).toHaveLength(1);
        expect(lines[0].order_in_session).toBe(1);
        expect(lines[0].planned_sets).toBe(1);
    });
});
