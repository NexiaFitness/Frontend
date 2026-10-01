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

    it("reinicia el cronó al cambiar stepKey con active true", () => {
        const stepA: AthleteRunStep = { ...COUNTUP_STEP, stepKey: "amrap-a" };
        const stepB: AthleteRunStep = { ...COUNTUP_STEP, stepKey: "amrap-b" };

        const { result, rerender } = renderHook(
            ({ step }) => useAthleteBlockTimer(step, true),
            { initialProps: { step: stepA } }
        );

        act(() => {
            vi.advanceTimersByTime(20_000);
        });
        expect(result.current.elapsedSeconds).toBe(20);

        rerender({ step: stepB });
        act(() => {
            vi.advanceTimersByTime(3_000);
        });
        expect(result.current.elapsedSeconds).toBe(3);
    });

    it("pausa y reanuda sin perder ni sumar tiempo", () => {
        const { result, rerender } = renderHook(
            ({ active }) => useAthleteBlockTimer(COUNTUP_STEP, active),
            { initialProps: { active: true } }
        );

        act(() => {
            vi.advanceTimersByTime(10_000);
        });
        expect(result.current.elapsedSeconds).toBe(10);

        rerender({ active: false });
        act(() => {
            vi.advanceTimersByTime(30_000);
        });
        expect(result.current.elapsedSeconds).toBe(10);

        rerender({ active: true });
        act(() => {
            vi.advanceTimersByTime(5_000);
        });
        expect(result.current.elapsedSeconds).toBe(15);
    });
});
