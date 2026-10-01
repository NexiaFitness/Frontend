import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    elapsedSecondsSince,
    flushWallClockSegmentMs,
    remainingSecondsUntil,
    subscribeAthleteWallClockTick,
    wallClockElapsedSeconds,
} from "./athleteWallClock";

describe("athleteWallClock (B6)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("wallClockElapsedSeconds acumula pausa entre tramos", () => {
        const start = Date.now();
        vi.advanceTimersByTime(5_000);
        const accumulated = flushWallClockSegmentMs(0, start);
        expect(wallClockElapsedSeconds(accumulated, null)).toBe(5);

        const segmentStart = Date.now();
        vi.advanceTimersByTime(3_000);
        expect(wallClockElapsedSeconds(accumulated, segmentStart)).toBe(8);
    });

    it("elapsedSecondsSince usa Date.now()", () => {
        const start = Date.now();
        vi.advanceTimersByTime(12_500);
        expect(elapsedSecondsSince(start)).toBe(12);
    });

    it("remainingSecondsUntil cuenta hacia cero", () => {
        const deadline = Date.now() + 5_500;
        expect(remainingSecondsUntil(deadline)).toBe(6);
        vi.advanceTimersByTime(2_000);
        expect(remainingSecondsUntil(deadline)).toBe(4);
    });

    it("visibilitychange dispara tick tras salto grande de reloj", () => {
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });

        const tick = vi.fn();
        const start = Date.now();
        subscribeAthleteWallClockTick(true, () => {
            tick(elapsedSecondsSince(start));
        });

        vi.advanceTimersByTime(2_000);
        expect(tick).toHaveBeenLastCalledWith(2);

        vi.setSystemTime(new Date(start + 90_000));
        document.dispatchEvent(new Event("visibilitychange"));
        expect(tick).toHaveBeenLastCalledWith(90);
    });
});
