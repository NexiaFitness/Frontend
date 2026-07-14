import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { useAthleteEmomFlow } from "./useAthleteEmomFlow";

const SLOT = {
    stepKey: "s1",
    slotLabel: "V1",
    exerciseId: 1,
    exerciseName: "Curl",
    setLabel: "V1-1",
    plannedLabel: "10 reps",
    blockExerciseId: 1,
    inputMode: "reps_only" as const,
    defaultWeight: 0,
    defaultReps: 10,
    defaultRpe: null,
    loggedSets: 0,
};

function interval(minuteIndex: number, key: string): AthleteEmomInterval {
    return {
        intervalKey: key,
        minuteIndex,
        minuteTotal: 4,
        roundIndex: minuteIndex,
        roundTotal: 4,
        slots: [{ ...SLOT, stepKey: `${key}-s1` }],
    };
}

const INTERVALS = [
    interval(1, "i1"),
    interval(2, "i2"),
    interval(3, "i3"),
    interval(4, "i4"),
];

describe("useAthleteEmomFlow", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("avanza intervalo a intervalo sin saltos ni bloqueo en 0", () => {
        const { result } = renderHook(() =>
            useAthleteEmomFlow("emom-step", INTERVALS, 3, true)
        );

        expect(result.current.intervalLabel).toBe("Intervalos 1 de 4 · 3 s");
        expect(result.current.displaySeconds).toBe(3);

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.intervalLabel).toBe("Intervalos 2 de 4 · 3 s");
        expect(result.current.displaySeconds).toBe(3);

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.intervalLabel).toBe("Intervalos 3 de 4 · 3 s");

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.intervalLabel).toBe("Intervalos 4 de 4 · 3 s");

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.allIntervalsComplete).toBe(true);
        expect(result.current.displaySeconds).toBe(0);
    });
});
