/**
 * wakeLock.ts — Screen Wake Lock durante run atleta (B6).
 * Contexto: mantiene pantalla encendida en bloques cronometrados y descansos; fallo silencioso sin soporte.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

type WakeLockSentinelLike = {
    release: () => Promise<void>;
    addEventListener?: (type: "release", listener: () => void) => void;
};

let desiredActive = false;
let activeSentinel: WakeLockSentinelLike | null = null;
let visibilityCleanupInstalled = false;

function wakeLockApi(): { request: (type: "screen") => Promise<WakeLockSentinelLike> } | undefined {
    if (typeof navigator === "undefined") return undefined;
    return navigator.wakeLock as
        | { request: (type: "screen") => Promise<WakeLockSentinelLike> }
        | undefined;
}

async function acquireWakeLockInternal(): Promise<void> {
    if (!desiredActive || activeSentinel) return;

    const api = wakeLockApi();
    if (!api?.request) return;

    try {
        const sentinel = await api.request("screen");
        if (!desiredActive) {
            await sentinel.release();
            return;
        }
        activeSentinel = sentinel;
        sentinel.addEventListener?.("release", () => {
            activeSentinel = null;
            if (desiredActive) {
                void acquireWakeLockInternal();
            }
        });
    } catch {
        activeSentinel = null;
    }
}

async function releaseWakeLockInternal(): Promise<void> {
    const sentinel = activeSentinel;
    activeSentinel = null;
    if (!sentinel) return;
    try {
        await sentinel.release();
    } catch {
        /* noop */
    }
}

/** Solicita o libera el único wake lock de la sesión de run. */
export function setAthleteRunWakeLockActive(active: boolean): void {
    desiredActive = active;
    if (active) {
        void acquireWakeLockInternal();
        return;
    }
    void releaseWakeLockInternal();
}

function onVisibilityChange(): void {
    if (document.visibilityState === "visible" && desiredActive) {
        void acquireWakeLockInternal();
    }
}

/** Una sola suscripción global (main.tsx). */
export function installAthleteRunWakeLockVisibilityRecovery(): () => void {
    if (visibilityCleanupInstalled || typeof document === "undefined") {
        return () => undefined;
    }
    visibilityCleanupInstalled = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        visibilityCleanupInstalled = false;
    };
}

/** Test helpers */
export function __resetAthleteRunWakeLockForTests(): void {
    desiredActive = false;
    activeSentinel = null;
}

export function __getAthleteRunWakeLockDesiredForTests(): boolean {
    return desiredActive;
}

/** Simula liberación del SO al ocultar pestaña (tests). */
export function __simulateWakeLockReleasedForTests(): void {
    activeSentinel = null;
}
