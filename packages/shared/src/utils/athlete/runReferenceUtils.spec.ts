/**
 * runReferenceUtils.spec.ts — B-25: payload de ejecución blocks vs legacy.
 */

import { describe, expect, it } from "vitest";

import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import {
    buildAthleteRunExecutionPayload,
    isLegacySyntheticSessionBlockId,
    resolveAthleteRunExecutionLineIds,
} from "./runReferenceUtils";

function flat(partial: Partial<AthleteFlatExercise> & Pick<AthleteFlatExercise, "blockExerciseId">): AthleteFlatExercise {
    return {
        stepKey: "g-r1-A-S1-1",
        exerciseId: 29,
        name: "Plancha lateral",
        blockName: "Ejercicios",
        groupKind: "single_set",
        setLabel: "S1",
        setIndex: 1,
        totalSetsInSlot: 3,
        plannedLabel: "8 reps",
        plannedWeight: null,
        plannedDurationSeconds: null,
        inputMode: "weight_reps",
        defaultWeight: 0,
        defaultReps: 8,
        restSeconds: 60,
        defaultRpe: null,
        videoUrl: null,
        loggedSets: 0,
        ...partial,
    };
}

describe("resolveAthleteRunExecutionLineIds (B-25)", () => {
    it("marca bloques sintéticos legacy (id negativo)", () => {
        expect(isLegacySyntheticSessionBlockId(-1)).toBe(true);
        expect(isLegacySyntheticSessionBlockId(42)).toBe(false);
        expect(isLegacySyntheticSessionBlockId(null)).toBe(false);
    });

    it("en legacy envía session_exercise_id y omite block_exercise_id", () => {
        const exercise = flat({ blockExerciseId: 824, sessionBlockId: -1 });
        expect(resolveAthleteRunExecutionLineIds(exercise)).toEqual({
            block_exercise_id: null,
            session_exercise_id: 824,
        });
        const payload = buildAthleteRunExecutionPayload(4991, exercise, {
            weight: 20,
            reps: 8,
            rpe: 7,
        });
        expect(payload.block_exercise_id).toBeNull();
        expect(payload.session_exercise_id).toBe(824);
        expect(payload.training_session_id).toBe(4991);
    });

    it("en bloques reales envía block_exercise_id", () => {
        const exercise = flat({ blockExerciseId: 1201, sessionBlockId: 55 });
        expect(resolveAthleteRunExecutionLineIds(exercise)).toEqual({
            block_exercise_id: 1201,
            session_exercise_id: null,
        });
        const payload = buildAthleteRunExecutionPayload(5008, exercise, {
            weight: 40,
            reps: 5,
            rpe: null,
        });
        expect(payload.block_exercise_id).toBe(1201);
        expect(payload.session_exercise_id).toBeNull();
    });
});
