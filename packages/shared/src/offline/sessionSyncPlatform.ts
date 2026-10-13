/**
 * sessionSyncPlatform.ts — Candado cross-tab para drenaje offline (agent.md §5).
 * Default: sin candado (comportamiento single-tab). La app web inyecta Web Locks.
 */

export type SessionSyncPlatform = {
    withSessionSyncLock<T>(sessionId: number, run: () => Promise<T>): Promise<T>;
};

const defaultPlatform: SessionSyncPlatform = {
    withSessionSyncLock: (_sessionId, run) => run(),
};

let sessionSyncPlatform: SessionSyncPlatform = defaultPlatform;

export function configureSessionSyncPlatform(platform: SessionSyncPlatform): void {
    sessionSyncPlatform = platform;
}

export function getSessionSyncPlatform(): SessionSyncPlatform {
    return sessionSyncPlatform;
}

export function resetSessionSyncPlatformForTests(): void {
    sessionSyncPlatform = defaultPlatform;
}
