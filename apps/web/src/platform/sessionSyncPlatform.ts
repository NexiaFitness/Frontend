/**
 * Implementación browser de SessionSyncPlatform — Web Locks por sesión atleta.
 */

import { configureSessionSyncPlatform } from "@nexia/shared";

const lockName = (sessionId: number) => `nexia-athlete-session-sync-${sessionId}`;

export function registerSessionSyncPlatform(): () => void {
    configureSessionSyncPlatform({
        withSessionSyncLock: async (sessionId, run) => {
            if (typeof navigator !== "undefined" && typeof navigator.locks?.request === "function") {
                return navigator.locks.request(lockName(sessionId), run);
            }
            return run();
        },
    });
    return () => {
        configureSessionSyncPlatform({
            withSessionSyncLock: (_sessionId, run) => run(),
        });
    };
}
