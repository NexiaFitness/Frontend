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

const FOUR_ROUNDS = [round(1, 4), round(2, 4), round(3, 4), round(4, 4)];

describe("useAthleteForTimeFlow (B4)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("termina el bloque con un solo finishBlock y conserva el cronó", () => {
        const { result } = renderHook(() =>
            useAthleteForTimeFlow("for-time-step", FOUR_ROUNDS, true)
        );

        act(() => {
            vi.advanceTimersByTime(754_000);
        });

        expect(result.current.elapsedSeconds).toBe(754);
        expect(result.current.allRoundsComplete).toBe(false);

        act(() => {
            result.current.finishBlock();
        });

        expect(result.current.allRoundsComplete).toBe(true);
        expect(result.current.elapsedSeconds).toBe(754);
    });

    it("deja de contar tras finishBlock aunque pase el tiempo", () => {
        const { result } = renderHook(() =>
            useAthleteForTimeFlow("for-time-step", FOUR_ROUNDS, true)
        );

        act(() => {
            vi.advanceTimersByTime(10_000);
        });
        expect(result.current.elapsedSeconds).toBe(10);

        act(() => {
            result.current.finishBlock();
        });

        act(() => {
            vi.advanceTimersByTime(120_000);
        });

        expect(result.current.elapsedSeconds).toBe(10);
        expect(result.current.allRoundsComplete).toBe(true);
    });

    it("reinicia el cronó al cambiar stepKey con active true", () => {
        const { result, rerender } = renderHook(
            ({ stepKey }) =>
                useAthleteForTimeFlow(stepKey, FOUR_ROUNDS, true),
            { initialProps: { stepKey: "for-time-a" } }
        );

        act(() => {
            vi.advanceTimersByTime(15_000);
        });
        expect(result.current.elapsedSeconds).toBe(15);

        rerender({ stepKey: "for-time-b" });
        act(() => {
            vi.advanceTimersByTime(4_000);
        });
        expect(result.current.elapsedSeconds).toBe(4);
    });

    it("pausa cuando active es false y reanuda sin contar la pausa", () => {
        const { result, rerender } = renderHook(
            ({ active }) => useAthleteForTimeFlow("for-time-step", FOUR_ROUNDS, active),
            { initialProps: { active: true } }
        );

        act(() => {
            vi.advanceTimersByTime(8_000);
        });
        expect(result.current.elapsedSeconds).toBe(8);

        rerender({ active: false });
        act(() => {
            vi.advanceTimersByTime(45_000);
        });
        expect(result.current.elapsedSeconds).toBe(8);

        rerender({ active: true });
        act(() => {
            vi.advanceTimersByTime(2_000);
        });
        expect(result.current.elapsedSeconds).toBe(10);
    });
});
