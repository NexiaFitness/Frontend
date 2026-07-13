/**
 * sessionExpired — limpia Redux + storage cuando refresh token falla (baseApi 401).
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AUTH_CONFIG } from "../config/constants";

const storageMock = vi.hoisted(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
}));

vi.mock("@nexia/shared/storage/IStorage", () => ({
    storage: storageMock,
}));

vi.mock("@nexia/shared/api/authApi", () => ({
    authApi: { endpoints: {} },
}));

import authReducer, { loginSuccess, sessionExpired } from "./authSlice";

describe("authSlice sessionExpired", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("clears authenticated state and removes tokens from storage", () => {
        const loggedIn = authReducer(
            undefined,
            loginSuccess({
                user: {
                    id: 1,
                    email: "demo@test.com",
                    role: "trainer",
                    is_active: true,
                },
                token: "access-token",
                refreshToken: "refresh-token",
            })
        );

        expect(loggedIn.isAuthenticated).toBe(true);
        expect(loggedIn.token).toBe("access-token");

        const expired = authReducer(loggedIn, sessionExpired());

        expect(expired.isAuthenticated).toBe(false);
        expect(expired.token).toBeNull();
        expect(expired.user).toBeNull();
        expect(expired.isLoading).toBe(false);
        expect(storageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.TOKEN_KEY);
        expect(storageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_KEY);
        expect(storageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.USER_KEY);
    });
});
