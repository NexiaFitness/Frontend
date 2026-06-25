/**
 * pwaInstallDetection.ts — Lógica pura PWA instalación (portal atleta).
 * Sin DOM ni Tailwind. El hook web orquesta eventos y timers.
 * @see docs/atleta/pwa/IMPLEMENTACION.md FASE 3
 */

export type InstallSource = "android-prompt" | "ios-manual" | "none";

export type InstallSheetTrigger = "mount" | "interval";

export interface PWAInstallState {
    isStandalone: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    canNativePrompt: boolean;
    installSource: InstallSource;
}

/** Storage síncrono mínimo (web: localStorage; tests: mock). */
export interface PwaSyncStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export const PWA_STORAGE_INSTALLED = "nexia_pwa_installed";
export const PWA_STORAGE_LAST_SHEET_SHOWN_AT = "nexia_pwa_lastSheetShownAt";

/** 24 horas — re-mostrar sheet en la misma pestaña sin recargar. */
export const SHEET_RESHOW_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function detectStandalone(
    win: Window | undefined = typeof window !== "undefined" ? window : undefined
): boolean {
    if (!win) return false;

    const nav = win.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone === true) return true;

    return win.matchMedia("(display-mode: standalone)").matches;
}

export function detectIOS(
    userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
    maxTouchPoints: number = typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0,
    platform: string = typeof navigator !== "undefined" ? navigator.platform : ""
): boolean {
    if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  // iPadOS 13+ con UA de escritorio
    if (platform === "MacIntel" && maxTouchPoints > 1) return true;
    return false;
}

export function detectAndroid(
    userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : ""
): boolean {
    return /Android/i.test(userAgent) && !detectIOS(userAgent);
}

export function getInstallSource(
    canNativePrompt: boolean,
    isIOS: boolean
): InstallSource {
    if (isIOS) return "ios-manual";
    if (canNativePrompt) return "android-prompt";
    return "none";
}

export function isInstallRecorded(storage: PwaSyncStorage): boolean {
    return storage.getItem(PWA_STORAGE_INSTALLED) === "true";
}

export function isPwaInstallPending(
    state: PWAInstallState,
    storage: PwaSyncStorage
): boolean {
    if (state.isStandalone) return false;
    if (isInstallRecorded(storage)) return false;
    return true;
}

export function buildPWAInstallState(canNativePrompt: boolean): PWAInstallState {
    const isIOS = detectIOS();
    const isAndroid = detectAndroid();
    return {
        isStandalone: detectStandalone(),
        isIOS,
        isAndroid,
        canNativePrompt,
        installSource: getInstallSource(canNativePrompt, isIOS),
    };
}

export function getInstallUiPlatform(
    state: PWAInstallState
): "ios" | "android" | "none" {
    if (state.isStandalone) return "none";
    if (state.isIOS) return "ios";
    if (state.isAndroid) return "android";
    return "none";
}

export function shouldShowInstallSheet(
    state: PWAInstallState,
    storage: PwaSyncStorage,
    options?: { now?: number; trigger?: InstallSheetTrigger }
): boolean {
    if (!isPwaInstallPending(state, storage)) return false;

    const trigger = options?.trigger ?? "mount";
    if (trigger === "mount") return true;

    const lastShownRaw = storage.getItem(PWA_STORAGE_LAST_SHEET_SHOWN_AT);
    if (!lastShownRaw) return true;

    const lastShown = Number(lastShownRaw);
    if (!Number.isFinite(lastShown)) return true;

    const now = options?.now ?? Date.now();
    return now - lastShown >= SHEET_RESHOW_INTERVAL_MS;
}

export function shouldShowInstallChip(
    state: PWAInstallState,
    storage: PwaSyncStorage,
    isSheetOpen: boolean
): boolean {
    if (isSheetOpen) return false;
    return isPwaInstallPending(state, storage);
}

export function recordSheetShown(
    storage: PwaSyncStorage,
    now: number = Date.now()
): void {
    storage.setItem(PWA_STORAGE_LAST_SHEET_SHOWN_AT, String(now));
}

export function recordInstallAccepted(storage: PwaSyncStorage): void {
    storage.setItem(PWA_STORAGE_INSTALLED, "true");
}
