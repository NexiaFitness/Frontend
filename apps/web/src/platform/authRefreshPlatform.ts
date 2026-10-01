/**
 * Implementación browser de AuthRefreshPlatform (B2b).
 * Contexto: registra candado Web Locks + refresh proactivo al volver visible la pestaña.
 * Colabora con packages/shared baseApi (401 + refresh) y main.tsx (registerAuthRefreshPlatform).
 *
 * @author Frontend Team
 * @since 2026-10-01
 * @updated 2026-10-01 - proactiveRefreshIfNeeded bajo withRefreshLock; relee refresh dentro del candado
 */

import {
    configureAuthRefreshPlatform,
    refreshAccessToken,
    type AuthRefreshPlatform,
} from "@nexia/shared";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";

const REFRESH_LOCK_NAME = "nexia-auth-refresh";
const PROACTIVE_REFRESH_WINDOW_MS = 5 * 60 * 1000;

function readRefreshToken(): string | null {
    try {
        return window.localStorage.getItem(AUTH_CONFIG.REFRESH_KEY);
    } catch {
        return null;
    }
}

function readAccessTokenExpMs(accessToken: string | null): number | null {
    if (!accessToken) {
        return null;
    }
    const parts = accessToken.split(".");
    if (parts.length < 2) {
        return null;
    }
    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64)) as { exp?: unknown };
        return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function readAccessToken(): string | null {
    try {
        return window.localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    } catch {
        return null;
    }
}

function shouldProactivelyRefresh(accessToken: string | null): boolean {
    if (!accessToken) {
        return false;
    }
    const expMs = readAccessTokenExpMs(accessToken);
    if (expMs === null) {
        return false;
    }
    return expMs - Date.now() <= PROACTIVE_REFRESH_WINDOW_MS;
}

/**
 * Refresh proactivo si el access expira en ≤5 min. Serializado con el mismo candado que baseApi 401.
 * @internal exported for unit tests (B2b).
 */
export async function proactiveRefreshIfNeeded(
    platform: Pick<AuthRefreshPlatform, "withRefreshLock"> = webAuthRefreshPlatform
): Promise<void> {
    if (!shouldProactivelyRefresh(readAccessToken())) {
        return;
    }
    await platform.withRefreshLock(async () => {
        const access = readAccessToken();
        const refresh = readRefreshToken();
        if (!access || !refresh || !shouldProactivelyRefresh(access)) {
            return;
        }
        await refreshAccessToken(refresh);
    });
}

const webAuthRefreshPlatform: AuthRefreshPlatform = {
    withRefreshLock: async (fn) => {
        if (typeof navigator !== "undefined" && typeof navigator.locks?.request === "function") {
            return navigator.locks.request(REFRESH_LOCK_NAME, fn);
        }
        return fn();
    },
    onAppVisible: (callback) => {
        if (typeof document === "undefined") {
            return () => {};
        }
        const handler = (): void => {
            if (document.visibilityState === "visible") {
                callback();
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    },
};

export function registerAuthRefreshPlatform(): () => void {
    configureAuthRefreshPlatform(webAuthRefreshPlatform);
    const offVisible = webAuthRefreshPlatform.onAppVisible(() => {
        void proactiveRefreshIfNeeded();
    });
    return () => {
        offVisible();
        configureAuthRefreshPlatform({
            withRefreshLock: (fn) => fn(),
            onAppVisible: () => () => {},
        });
    };
}
