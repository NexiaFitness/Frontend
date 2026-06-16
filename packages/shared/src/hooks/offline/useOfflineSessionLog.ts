/**
 * useOfflineSessionLog.ts — Write-through IDB + flush on reconnect (F1-FE-OFFLINE).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionBlockExerciseUpdate } from "../../types/sessionProgramming";
import { countPendingForSession } from "../../offline/athleteSessionDb";
import {
    flushPendingSessionSync,
    loadSessionSnapshot,
    persistSessionSnapshot,
    pruneSupersededLogs,
    queueExerciseLog,
    queueSessionComplete,
} from "../../offline/athleteSessionSync";
import type {
    AthleteFlatExercise,
    AthleteSessionSnapshot,
    AthleteSessionSyncAdapter,
} from "../../offline/athleteSessionTypes";
import { AthleteSyncConflictError } from "../../offline/athleteSessionTypes";
import { useOnlineStatus } from "./useOnlineStatus";

export interface UseOfflineSessionLogOptions {
    sessionId: number;
    clientId: number | null;
    sessionName: string;
    flatExercises: AthleteFlatExercise[];
    adapter: AthleteSessionSyncAdapter;
    /** Llamado tras sync exitoso al reconectar. */
    onSynced?: (result: { syncedLogs: number; syncedCompletes: number }) => void;
    onConflict?: () => void;
}

export interface UseOfflineSessionLogResult {
    isOnline: boolean;
    pendingCount: number;
    cachedSnapshot: AthleteSessionSnapshot | null;
    isUsingCache: boolean;
    logSet: (
        blockExerciseId: number,
        payload: SessionBlockExerciseUpdate
    ) => Promise<"synced" | "queued" | "offline">;
    finishSession: () => Promise<"synced" | "queued" | "offline">;
    refreshPendingCount: () => Promise<void>;
}

export function useOfflineSessionLog(
    options: UseOfflineSessionLogOptions
): UseOfflineSessionLogResult {
    const {
        sessionId,
        clientId,
        sessionName,
        flatExercises,
        adapter,
        onSynced,
        onConflict,
    } = options;

    const isOnline = useOnlineStatus();
    const [pendingCount, setPendingCount] = useState(0);
    const [cachedSnapshot, setCachedSnapshot] = useState<AthleteSessionSnapshot | null>(null);
    const flushingRef = useRef(false);

    const refreshPendingCount = useCallback(async () => {
        if (!sessionId) return;
        const count = await countPendingForSession(sessionId);
        setPendingCount(count);
    }, [sessionId]);

    // Cargar snapshot local al montar (offline fallback)
    useEffect(() => {
        let cancelled = false;
        loadSessionSnapshot(sessionId).then((snap) => {
            if (!cancelled) setCachedSnapshot(snap);
        });
        refreshPendingCount();
        return () => {
            cancelled = true;
        };
    }, [sessionId, refreshPendingCount]);

    // Persistir snapshot cuando hay datos online
    useEffect(() => {
        if (!clientId || flatExercises.length === 0) return;
        persistSessionSnapshot({
            sessionId,
            clientId,
            sessionName,
            flatExercises,
        }).then(() =>
            loadSessionSnapshot(sessionId).then((snap) => setCachedSnapshot(snap))
        );
    }, [sessionId, clientId, sessionName, flatExercises]);

    const flush = useCallback(async () => {
        if (!isOnline || flushingRef.current) return;
        flushingRef.current = true;
        try {
            await pruneSupersededLogs(sessionId);
            const result = await flushPendingSessionSync(sessionId, adapter);
            await refreshPendingCount();
            if (result.conflict) {
                onConflict?.();
                return;
            }
            if (result.syncedLogs > 0 || result.syncedCompletes > 0) {
                onSynced?.({
                    syncedLogs: result.syncedLogs,
                    syncedCompletes: result.syncedCompletes,
                });
            }
        } finally {
            flushingRef.current = false;
        }
    }, [adapter, isOnline, onConflict, onSynced, refreshPendingCount, sessionId]);

    useEffect(() => {
        if (isOnline) {
            flush();
        }
    }, [isOnline, flush]);

    const trySyncOrQueue = useCallback(
        async (
            action: () => Promise<void>,
            queue: () => Promise<void>
        ): Promise<"synced" | "queued" | "offline"> => {
            if (!isOnline) {
                await queue();
                await refreshPendingCount();
                return "offline";
            }
            try {
                await action();
                return "synced";
            } catch (error) {
                if (error instanceof AthleteSyncConflictError) {
                    onConflict?.();
                    throw error;
                }
                await queue();
                await refreshPendingCount();
                return "queued";
            }
        },
        [isOnline, onConflict, refreshPendingCount]
    );

    const logSet = useCallback(
        async (blockExerciseId: number, payload: SessionBlockExerciseUpdate) => {
            return trySyncOrQueue(
                () => adapter.updateExercise(blockExerciseId, payload),
                async () => {
                    await queueExerciseLog({ sessionId, blockExerciseId, payload });
                }
            );
        },
        [adapter, sessionId, trySyncOrQueue]
    );

    const finishSession = useCallback(async () => {
        return trySyncOrQueue(
            () => adapter.completeSession(sessionId),
            async () => {
                await queueSessionComplete(sessionId);
            }
        );
    }, [adapter, sessionId, trySyncOrQueue]);

    const isUsingCache =
        !isOnline && flatExercises.length === 0 && cachedSnapshot != null;

    return {
        isOnline,
        pendingCount,
        cachedSnapshot,
        isUsingCache,
        logSet,
        finishSession,
        refreshPendingCount,
    };
}
