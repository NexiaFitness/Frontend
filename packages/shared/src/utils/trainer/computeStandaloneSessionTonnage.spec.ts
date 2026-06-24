/**
 * computeStandaloneSessionTonnage.spec.ts
 */

import { describe, expect, it } from "vitest";
import { computeStandaloneSessionTonnage } from "./computeStandaloneSessionTonnage";
import type { StandaloneSessionExerciseOut } from "../../types/standaloneSessions";

function row(
    partial: Partial<StandaloneSessionExerciseOut> &
        Pick<StandaloneSessionExerciseOut, "exercise_id" | "order_in_session">,
): StandaloneSessionExerciseOut {
    return {
        id: partial.id ?? 1,
        standalone_session_id: partial.standalone_session_id ?? 1,
        exercise_id: partial.exercise_id,
        order_in_session: partial.order_in_session,
        planned_sets: null,
        planned_reps: null,
        planned_weight: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: null,
        actual_sets: partial.actual_sets ?? null,
        actual_reps: partial.actual_reps ?? null,
        actual_weight: partial.actual_weight ?? null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        notes: null,
        created_at: "2026-06-01T00:00:00Z",
        updated_at: "2026-06-01T00:00:00Z",
        is_active: true,
    };
}

describe("computeStandaloneSessionTonnage", () => {
    it("sums actual_sets × actual_reps × actual_weight", () => {
        const summary = computeStandaloneSessionTonnage([
            row({
                exercise_id: 1,
                order_in_session: 1,
                actual_sets: 4,
                actual_reps: 10,
                actual_weight: 20,
            }),
            row({
                exercise_id: 2,
                order_in_session: 2,
                actual_sets: 3,
                actual_reps: 8,
                actual_weight: 25,
            }),
        ]);

        expect(summary.tonnageKg).toBe(1400);
        expect(summary.exercisesWithLoad).toBe(2);
    });

    it("ignores exercises without complete actual load", () => {
        const summary = computeStandaloneSessionTonnage([
            row({
                exercise_id: 1,
                order_in_session: 1,
                actual_sets: 0,
                actual_reps: 10,
                actual_weight: 20,
            }),
        ]);

        expect(summary.tonnageKg).toBe(0);
        expect(summary.exercisesWithLoad).toBe(0);
    });
});
