import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { useAthleteBlockTimer } from "./useAthleteBlockTimer";

const COUNTUP_STEP: AthleteRunStep = {
    stepKey: "amrap-1",
    kind: "timed_block",
    blockName: "AMRAP",
    groupKind: "amrap",
    groupId: "g1",
    timedMode: "countup",
    timeCapMinutes: 10,
    exerciseId: 1,
    exerciseName: "Burpee",
    blockId: 1,
};

describe("useAthleteBlockTimer (B6 wall clock)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("refleja un salto de tiempo tras pestaña oculta al volver visible", () => {
        const { result } = renderHook(() => useAthleteBlockTimer(COUNTUP_STEP, true));

        act(() => {
            vi.advanceTimersByTime(3_000);
        });
        expect(result.current.elapsedSeconds).toBe(3);

        const jumped = Date.now() + 60_000;
        act(() => {
            vi.setSystemTime(new Date(jumped));
            document.dispatchEvent(new Event("visibilitychange"));
        });

        expect(result.current.elapsedSeconds).toBe(63);
    });
});
