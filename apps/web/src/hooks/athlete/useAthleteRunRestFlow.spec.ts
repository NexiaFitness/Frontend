import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAthleteRunRestFlow } from "./useAthleteRunRestFlow";

describe("useAthleteRunRestFlow (B6 wall clock)", () => {
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

    it("descanso sigue el tiempo real tras salto largo en pestaña oculta", () => {
        const onConfirm = vi.fn(async () => true);
        const onRestComplete = vi.fn();

        const { result } = renderHook(() =>
            useAthleteRunRestFlow({
                restAfterSeconds: 90,
                confirmLabel: "OK",
                stepKey: "step-1",
                onConfirm,
                onRestComplete,
            })
        );

        act(() => {
            result.current.startRest();
        });
        expect(result.current.remainingSeconds).toBe(90);

        act(() => {
            vi.advanceTimersByTime(5_000);
        });
        expect(result.current.remainingSeconds).toBe(85);

        act(() => {
            vi.setSystemTime(new Date(Date.now() + 30_000));
            document.dispatchEvent(new Event("visibilitychange"));
        });

        expect(result.current.remainingSeconds).toBe(55);
    });
});
