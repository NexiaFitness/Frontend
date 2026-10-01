import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_CONFIG } from "../config/constants";
import { refreshAccessToken } from "./baseApi";

describe("refreshAccessToken (B2a)", () => {
    const storage: Record<string, string> = {};

    beforeEach(() => {
        for (const key of Object.keys(storage)) {
            delete storage[key];
        }
        const localStorage = {
            getItem(key: string) {
                return storage[key] ?? null;
            },
            setItem(key: string, value: string) {
                storage[key] = value;
            },
            removeItem(key: string) {
                delete storage[key];
            },
        };
        vi.stubGlobal("window", { localStorage });
        vi.stubGlobal("localStorage", localStorage);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns ok and persists tokens on 200", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    access_token: "new-access",
                    refresh_token: "new-refresh",
                }),
            })
        );

        const result = await refreshAccessToken("old-refresh");
        expect(result).toBe("ok");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("new-access");
        expect(storage[AUTH_CONFIG.REFRESH_KEY]).toBe("new-refresh");
    });

    it("returns invalid on 401 without clearing storage", async () => {
        storage[AUTH_CONFIG.TOKEN_KEY] = "keep-access";
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({}),
            })
        );

        const result = await refreshAccessToken("stale-refresh");
        expect(result).toBe("invalid");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("keep-access");
    });

    it.each([408, 429] as const)("returns network on %i", async (status) => {
        storage[AUTH_CONFIG.TOKEN_KEY] = "keep-access";
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status,
                json: async () => ({}),
            })
        );

        const result = await refreshAccessToken("refresh");
        expect(result).toBe("network");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("keep-access");
    });

    it("returns network on 503", async () => {
        storage[AUTH_CONFIG.TOKEN_KEY] = "keep-access";
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
                json: async () => ({}),
            })
        );

        const result = await refreshAccessToken("refresh");
        expect(result).toBe("network");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("keep-access");
    });

    it("returns network on fetch TypeError", async () => {
        storage[AUTH_CONFIG.TOKEN_KEY] = "keep-access";
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

        const result = await refreshAccessToken("refresh");
        expect(result).toBe("network");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("keep-access");
    });

    it("returns network on AbortError", async () => {
        storage[AUTH_CONFIG.TOKEN_KEY] = "keep-access";
        const abortError = new DOMException("Aborted", "AbortError");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

        const result = await refreshAccessToken("refresh");
        expect(result).toBe("network");
        expect(storage[AUTH_CONFIG.TOKEN_KEY]).toBe("keep-access");
    });
});
