import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AthleteForTimeRound } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { useAthleteForTimeFlow } from "./useAthleteForTimeFlow";

const SLOT = {
    stepKey: "s1",
    slotLabel: "1",
    exerciseId: 1,
    exerciseName: "Thruster",
    setLabel: "1",
    plannedLabel: "12 reps",
    blockExerciseId: 1,
    inputMode: "weight_reps" as const,
    defaultWeight: 40,
    defaultReps: 12,
    defaultRpe: null,
    loggedSets: 0,
};

function round(index: number, total: number): AthleteForTimeRound {
    return {
        roundKey: `r${index}`,
        roundIndex: index,
        roundTotal: total,
        slots: [{ ...SLOT, stepKey: `r${index}-s1` }],
    };
}

const ROUNDS = [round(1, 2), round(2, 2)];

describe("useAthleteForTimeFlow", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("cronó continuo, splits acumulados y cierre tras última ronda", () => {
        const { result } = renderHook(() =>
            useAthleteForTimeFlow("for-time-step", ROUNDS, true)
        );

        expect(result.current.roundLabel).toBe("Rondas 1 de 2");
        expect(result.current.elapsedSeconds).toBe(0);

        act(() => {
            vi.advanceTimersByTime(75000);
        });

        expect(result.current.elapsedSeconds).toBe(75);

        act(() => {
            result.current.completeRound();
        });

        expect(result.current.roundAdvanceCue).toEqual({
            completedRoundIndex: 1,
            cumulativeSeconds: 75,
            segmentSeconds: 75,
            isLastRound: false,
        });
        expect(result.current.cumulativeSplits).toEqual([75]);
        expect(result.current.roundLabel).toBe("Rondas 2 de 2");
        expect(result.current.allRoundsComplete).toBe(false);

        act(() => {
            vi.advanceTimersByTime(80000);
        });

        expect(result.current.elapsedSeconds).toBe(155);

        act(() => {
            result.current.completeRound();
        });

        expect(result.current.cumulativeSplits).toEqual([75, 155]);
        expect(result.current.allRoundsComplete).toBe(true);
    });
});
