/**
 * pwaInstallDetection.spec.ts — Tests lógica PWA instalación (FASE 3).
 */

import { describe, expect, it, vi } from "vitest";
import {
    PWA_STORAGE_INSTALLED,
    PWA_STORAGE_LAST_SHEET_SHOWN_AT,
    SHEET_RESHOW_INTERVAL_MS,
    buildPWAInstallState,
    detectAndroid,
    detectIOS,
    detectStandalone,
    getInstallSource,
    getInstallUiPlatform,
    isPwaInstallPending,
    recordInstallAccepted,
    recordSheetShown,
    shouldShowInstallChip,
    shouldShowInstallSheet,
    type PWAInstallState,
    type PwaSyncStorage,
} from "./pwaInstallDetection";

function createStorage(initial: Record<string, string> = {}): PwaSyncStorage {
    const map = new Map(Object.entries(initial));
    return {
        getItem: (key) => map.get(key) ?? null,
        setItem: (key, value) => {
            map.set(key, value);
        },
    };
}

const pendingState: PWAInstallState = {
    isStandalone: false,
    isIOS: false,
    isAndroid: true,
    canNativePrompt: true,
    installSource: "android-prompt",
};

const standaloneState: PWAInstallState = {
    ...pendingState,
    isStandalone: true,
};

describe("detectIOS", () => {
    it("detects iPhone user agent", () => {
        expect(
            detectIOS(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
            )
        ).toBe(true);
    });

    it("detects iPadOS desktop UA via touch points", () => {
        expect(detectIOS("Mozilla/5.0 (Macintosh; Intel Mac OS X)", 5, "MacIntel")).toBe(
            true
        );
    });

    it("returns false for Android", () => {
        expect(detectIOS("Mozilla/5.0 (Linux; Android 14; Pixel 7)")).toBe(false);
    });
});

describe("detectAndroid", () => {
    it("detects Android user agent", () => {
        expect(detectAndroid("Mozilla/5.0 (Linux; Android 14; Pixel 7)")).toBe(true);
    });

    it("returns false for iPhone", () => {
        expect(detectAndroid("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(
            false
        );
    });
});

describe("detectStandalone", () => {
    it("returns true when display-mode standalone matches", () => {
        const win = {
            navigator: {},
            matchMedia: vi.fn((query: string) => ({
                matches: query.includes("standalone"),
                media: query,
            })),
        } as unknown as Window;

        expect(detectStandalone(win)).toBe(true);
    });

    it("returns true when navigator.standalone is true (iOS)", () => {
        const win = {
            navigator: { standalone: true },
            matchMedia: vi.fn(() => ({ matches: false, media: "" })),
        } as unknown as Window;

        expect(detectStandalone(win)).toBe(true);
    });
});

describe("getInstallSource", () => {
    it("prefers ios-manual on iOS", () => {
        expect(getInstallSource(true, true)).toBe("ios-manual");
    });

    it("returns android-prompt when native prompt available", () => {
        expect(getInstallSource(true, false)).toBe("android-prompt");
    });

    it("returns none otherwise", () => {
        expect(getInstallSource(false, false)).toBe("none");
    });
});

describe("shouldShowInstallSheet", () => {
    it("returns false in standalone", () => {
        const storage = createStorage();
        expect(shouldShowInstallSheet(standaloneState, storage)).toBe(false);
    });

    it("returns false when install recorded", () => {
        const storage = createStorage({ [PWA_STORAGE_INSTALLED]: "true" });
        expect(shouldShowInstallSheet(pendingState, storage)).toBe(false);
    });

    it("returns true on mount when install pending", () => {
        const storage = createStorage();
        expect(shouldShowInstallSheet(pendingState, storage, { trigger: "mount" })).toBe(
            true
        );
    });

    it("returns true on mount even if sheet was shown recently", () => {
        const storage = createStorage({
            [PWA_STORAGE_LAST_SHEET_SHOWN_AT]: String(Date.now()),
        });
        expect(shouldShowInstallSheet(pendingState, storage, { trigger: "mount" })).toBe(
            true
        );
    });

    it("returns false on interval before 24h elapsed", () => {
        const now = 1_700_000_000_000;
        const storage = createStorage({
            [PWA_STORAGE_LAST_SHEET_SHOWN_AT]: String(now - SHEET_RESHOW_INTERVAL_MS + 1000),
        });
        expect(
            shouldShowInstallSheet(pendingState, storage, {
                trigger: "interval",
                now,
            })
        ).toBe(false);
    });

    it("returns true on interval after 24h elapsed", () => {
        const now = 1_700_000_000_000;
        const storage = createStorage({
            [PWA_STORAGE_LAST_SHEET_SHOWN_AT]: String(now - SHEET_RESHOW_INTERVAL_MS - 1),
        });
        expect(
            shouldShowInstallSheet(pendingState, storage, {
                trigger: "interval",
                now,
            })
        ).toBe(true);
    });
});

describe("shouldShowInstallChip", () => {
    it("returns false when sheet is open", () => {
        const storage = createStorage();
        expect(shouldShowInstallChip(pendingState, storage, true)).toBe(false);
    });

    it("returns true when pending and sheet closed", () => {
        const storage = createStorage();
        expect(shouldShowInstallChip(pendingState, storage, false)).toBe(true);
    });
});

describe("recordSheetShown / recordInstallAccepted", () => {
    it("persists last shown timestamp", () => {
        const storage = createStorage();
        recordSheetShown(storage, 12345);
        expect(storage.getItem(PWA_STORAGE_LAST_SHEET_SHOWN_AT)).toBe("12345");
    });

    it("persists installed flag", () => {
        const storage = createStorage();
        recordInstallAccepted(storage);
        expect(storage.getItem(PWA_STORAGE_INSTALLED)).toBe("true");
    });
});

describe("buildPWAInstallState / getInstallUiPlatform", () => {
    it("builds state from environment defaults", () => {
        const state = buildPWAInstallState(false);
        expect(state).toMatchObject({
            canNativePrompt: false,
            installSource: expect.any(String),
        });
    });

    it("maps iOS to ios platform", () => {
        const state: PWAInstallState = {
            isStandalone: false,
            isIOS: true,
            isAndroid: false,
            canNativePrompt: false,
            installSource: "ios-manual",
        };
        expect(getInstallUiPlatform(state)).toBe("ios");
    });

    it("returns none when standalone", () => {
        expect(getInstallUiPlatform(standaloneState)).toBe("none");
    });
});

describe("isPwaInstallPending", () => {
    it("returns false when installed flag set", () => {
        const storage = createStorage({ [PWA_STORAGE_INSTALLED]: "true" });
        expect(isPwaInstallPending(pendingState, storage)).toBe(false);
    });
});
