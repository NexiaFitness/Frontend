/**
 * useAthleteRunSingleLoggerDefaults.spec.ts — referencia tardía en serie simple (H4 / C6).
 */

import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { AthleteFlatExercise } from "@nexia/shared/offline/athleteSessionTypes";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import { buildRunLoggerFieldTouchKey } from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import { useAthleteRunSingleLoggerDefaults } from "./useAthleteRunSingleLoggerDefaults";

const baseExercise: AthleteFlatExercise = {
    stepKey: "block-single-1",
    blockExerciseId: 1,
    exerciseId: 10,
    name: "Press",
    blockName: "B",
    groupKind: null,
    setLabel: "S1",
    setIndex: 2,
    totalSetsInSlot: 3,
    plannedLabel: "10 reps",
    plannedWeight: null,
    plannedDurationSeconds: null,
    inputMode: "weight_reps",
    defaultWeight: 0,
    defaultReps: 9,
    restSeconds: 90,
    defaultRpe: null,
    videoUrl: null,
    loggedSets: 0,
    roundIndex: 1,
};

describe("useAthleteRunSingleLoggerDefaults", () => {
    it("late reference: touched weight unchanged, untouched rpe hydrates", async () => {
        const touched = new Set([
            buildRunLoggerFieldTouchKey("single", baseExercise.stepKey, "weight"),
        ]);
        const setWeight = vi.fn();
        const setReps = vi.fn();
        const setRpe = vi.fn();
        const exercise = { ...baseExercise, setIndex: 2, setLabel: "S2" };
        const seriesAutofillWeightRef = { current: new Map<string, number>() };

        const { rerender } = renderHook(
            ({
                effectiveRunReference,
            }: {
                effectiveRunReference: AthleteRunReference | null | undefined;
            }) =>
                useAthleteRunSingleLoggerDefaults({
                    restShowLogger: true,
                    current: exercise,
                    isBatchStep: false,
                    effectiveRunReference,
                    getTouchedSnapshot: () => touched,
                    weight: 33,
                    reps: 9,
                    rpe: null,
                    seriesAutofillWeightRef,
                    setWeight,
                    setReps,
                    setRpe,
                }),
            {
                initialProps: {
                    effectiveRunReference: undefined as AthleteRunReference | null | undefined,
                },
            }
        );

        expect(setWeight).not.toHaveBeenCalled();
        expect(setRpe).not.toHaveBeenCalled();

        const refPayload: AthleteRunReference = {
            exercise_id: 10,
            step_key: exercise.stepKey,
            reference: {
                weight_kg: 41,
                reps: 12,
                rpe: 7,
                source: "history",
                rounds_completed: null,
                total_seconds: null,
                performed_at: null,
                session_date_label: null,
            },
            personal_best: null,
            suggestion: null,
        };

        await act(async () => {
            rerender({ effectiveRunReference: refPayload });
        });

        await waitFor(() => {
            expect(setRpe).toHaveBeenCalledWith(7);
        });
        expect(setWeight).not.toHaveBeenCalled();
        expect(setReps).not.toHaveBeenCalled();
    });
});
