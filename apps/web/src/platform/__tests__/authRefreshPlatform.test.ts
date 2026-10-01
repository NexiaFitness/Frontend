import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";
import * as shared from "@nexia/shared";
import { proactiveRefreshIfNeeded } from "../authRefreshPlatform";

function jwtWithExp(expSeconds: number): string {
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ exp: expSeconds }));
    return `${header}.${payload}.sig`;
}

describe("proactiveRefreshIfNeeded (B2b)", () => {
    const storage: Record<string, string> = {};
    let refreshCalls = 0;
    let lockQueue: Promise<void> = Promise.resolve();

    const testPlatform = {
        withRefreshLock: async <T>(fn: () => Promise<T>): Promise<T> => {
            let result!: T;
            lockQueue = lockQueue.then(async () => {
                result = await fn();
            });
            await lockQueue;
            return result;
        },
    };

    beforeEach(() => {
        refreshCalls = 0;
        lockQueue = Promise.resolve();
        for (const key of Object.keys(storage)) {
            delete storage[key];
        }
        vi.spyOn(shared, "refreshAccessToken").mockImplementation(async () => {
            refreshCalls += 1;
            return "ok";
        });
        const localStorage = {
            getItem(key: string) {
                return storage[key] ?? null;
            },
            setItem(key: string, value: string) {
                storage[key] = value;
            },
        };
        vi.stubGlobal("window", { localStorage });
        vi.stubGlobal("localStorage", localStorage);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("uses withRefreshLock and re-reads refresh token inside the lock", async () => {
        const expSoon = Math.floor(Date.now() / 1000) + 120;
        storage[AUTH_CONFIG.TOKEN_KEY] = jwtWithExp(expSoon);
        storage[AUTH_CONFIG.REFRESH_KEY] = "refresh-a";

        await proactiveRefreshIfNeeded(testPlatform);

        expect(refreshCalls).toBe(1);
        expect(shared.refreshAccessToken).toHaveBeenCalledWith("refresh-a");
    });

    it("does not call refresh when access is outside the proactive window", async () => {
        const expLater = Math.floor(Date.now() / 1000) + 60 * 60;
        storage[AUTH_CONFIG.TOKEN_KEY] = jwtWithExp(expLater);
        storage[AUTH_CONFIG.REFRESH_KEY] = "refresh-a";

        await proactiveRefreshIfNeeded(testPlatform);

        expect(refreshCalls).toBe(0);
    });

    it("serializes concurrent proactive refresh so refreshAccessToken runs once", async () => {
        const expSoon = Math.floor(Date.now() / 1000) + 60;
        storage[AUTH_CONFIG.TOKEN_KEY] = jwtWithExp(expSoon);
        storage[AUTH_CONFIG.REFRESH_KEY] = "refresh-concurrent";

        vi.mocked(shared.refreshAccessToken).mockImplementation(async () => {
            await new Promise((r) => setTimeout(r, 10));
            refreshCalls += 1;
            storage[AUTH_CONFIG.TOKEN_KEY] = jwtWithExp(Math.floor(Date.now() / 1000) + 3600);
            return "ok";
        });

        await Promise.all([
            proactiveRefreshIfNeeded(testPlatform),
            proactiveRefreshIfNeeded(testPlatform),
        ]);

        expect(refreshCalls).toBe(1);
    });
});
