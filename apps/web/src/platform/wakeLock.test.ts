import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    __getAthleteRunWakeLockDesiredForTests,
    __resetAthleteRunWakeLockForTests,
    __simulateWakeLockReleasedForTests,
    installAthleteRunWakeLockVisibilityRecovery,
    setAthleteRunWakeLockActive,
} from "./wakeLock";

describe("wakeLock (B6)", () => {
    const release = vi.fn(async () => undefined);
    const request = vi.fn(async () => ({
        release,
        addEventListener: vi.fn(),
    }));

    beforeEach(() => {
        __resetAthleteRunWakeLockForTests();
        release.mockClear();
        request.mockClear();
        Object.defineProperty(navigator, "wakeLock", {
            configurable: true,
            value: { request },
        });
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });
    });

    afterEach(() => {
        __resetAthleteRunWakeLockForTests();
    });

    it("pide wake lock cuando está activo y libera al desactivar", async () => {
        setAthleteRunWakeLockActive(true);
        await Promise.resolve();
        expect(request).toHaveBeenCalledWith("screen");

        setAthleteRunWakeLockActive(false);
        await Promise.resolve();
        expect(release).toHaveBeenCalled();
        expect(__getAthleteRunWakeLockDesiredForTests()).toBe(false);
    });

    it("vuelve a pedir tras visibilitychange visible", async () => {
        const cleanup = installAthleteRunWakeLockVisibilityRecovery();
        setAthleteRunWakeLockActive(true);
        await Promise.resolve();
        expect(request).toHaveBeenCalledTimes(1);

        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "hidden",
        });
        __simulateWakeLockReleasedForTests();
        document.dispatchEvent(new Event("visibilitychange"));

        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });
        document.dispatchEvent(new Event("visibilitychange"));
        await Promise.resolve();

        expect(request.mock.calls.length).toBeGreaterThanOrEqual(2);
        cleanup();
    });

    it("no falla si navigator.wakeLock no existe", async () => {
        Object.defineProperty(navigator, "wakeLock", {
            configurable: true,
            value: undefined,
        });
        expect(() => setAthleteRunWakeLockActive(true)).not.toThrow();
        await Promise.resolve();
        setAthleteRunWakeLockActive(false);
    });
});
