/**
 * useOfflineSessionLog.ts — Write-through IDB + flush on reconnect (F1 + F5).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
    AthleteRunExecutionCreate,
    AthleteRunTimedResultCreate,
} from "../../types/athleteRunReference";
import type { SessionBlockExerciseUpdate } from "../../types/sessionProgramming";
import { countPendingForSession } from "../../offline/athleteSessionDb";
import {
    finishOnlineSession,
    flushPendingSessionSync,
    loadSessionSnapshot,
    persistSessionSnapshot,
    pruneSupersededExecutions,
    pruneSupersededLogs,
    pruneSupersededTimedResults,
    queueExecutionLog,
    queueExerciseLog,
    queueSessionComplete,
    queueTimedResultLog,
} from "../../offline/athleteSessionSync";
import type {
    AthleteFlatExercise,
    AthleteSessionSnapshot,
    AthleteSessionSyncAdapter,
    LocalSetExecution,
} from "../../offline/athleteSessionTypes";
import { AthleteSyncConflictError } from "../../offline/athleteSessionTypes";
import { useOnlineStatus } from "./useOnlineStatus";

export interface UseOfflineSessionLogOptions {
    sessionId: number;
    clientId: number | null;
    sessionName: string;
    flatExercises: AthleteFlatExercise[];
    adapter: AthleteSessionSyncAdapter;
    onSynced?: (result: {
        syncedLogs: number;
        syncedExecutions: number;
        syncedTimedResults: number;
        syncedCompletes: number;
    }) => void;
    onConflict?: () => void;
}

export interface UseOfflineSessionLogResult {
    isOnline: boolean;
    pendingCount: number;
    cachedSnapshot: AthleteSessionSnapshot | null;
    localExecutions: LocalSetExecution[];
    isUsingCache: boolean;
    logSet: (
        blockExerciseId: number,
        payload: SessionBlockExerciseUpdate
    ) => Promise<"synced" | "queued" | "offline">;
    logExecution: (
        payload: AthleteRunExecutionCreate
    ) => Promise<"synced" | "queued" | "offline">;
    logTimedResult: (
        payload: AthleteRunTimedResultCreate
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

    const reloadSnapshot = useCallback(async () => {
        const snap = await loadSessionSnapshot(sessionId);
        setCachedSnapshot(snap);
        return snap;
    }, [sessionId]);

    useEffect(() => {
        let cancelled = false;
        reloadSnapshot().then((snap) => {
            if (!cancelled && snap) setCachedSnapshot(snap);
        });
        refreshPendingCount();
        return () => {
            cancelled = true;
        };
    }, [reloadSnapshot, refreshPendingCount]);

    useEffect(() => {
        if (!clientId || flatExercises.length === 0) return;
        persistSessionSnapshot({
            sessionId,
            clientId,
            sessionName,
            flatExercises,
        }).then(() => reloadSnapshot());
    }, [sessionId, clientId, sessionName, flatExercises, reloadSnapshot]);

    const flush = useCallback(async () => {
        if (!isOnline || flushingRef.current) return;
        flushingRef.current = true;
        try {
            await pruneSupersededExecutions(sessionId);
            await pruneSupersededTimedResults(sessionId);
            await pruneSupersededLogs(sessionId);
            const result = await flushPendingSessionSync(sessionId, adapter);
            await refreshPendingCount();
            await reloadSnapshot();
            if (result.conflict) {
                onConflict?.();
                return;
            }
            if (
                result.syncedLogs > 0 ||
                result.syncedExecutions > 0 ||
                result.syncedTimedResults > 0 ||
                result.syncedCompletes > 0
            ) {
                onSynced?.(result);
            }
        } finally {
            flushingRef.current = false;
        }
    }, [adapter, isOnline, onConflict, onSynced, refreshPendingCount, reloadSnapshot, sessionId]);

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
                await reloadSnapshot();
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
                await reloadSnapshot();
                return "queued";
            }
        },
        [isOnline, onConflict, refreshPendingCount, reloadSnapshot]
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

    const logExecution = useCallback(
        async (payload: AthleteRunExecutionCreate) => {
            return trySyncOrQueue(
                () => adapter.postExecution(payload),
                async () => {
                    await queueExecutionLog({
                        sessionId,
                        stepKey: payload.step_key,
                        payload,
                    });
                }
            );
        },
        [adapter, sessionId, trySyncOrQueue]
    );

    const logTimedResult = useCallback(
        async (payload: AthleteRunTimedResultCreate) => {
            return trySyncOrQueue(
                () => adapter.postTimedResult(payload),
                async () => {
                    await queueTimedResultLog({
                        sessionId,
                        stepKey: payload.step_key,
                        payload,
                    });
                }
            );
        },
        [adapter, sessionId, trySyncOrQueue]
    );

    const finishSession = useCallback(async () => {
        if (!isOnline) {
            await queueSessionComplete(sessionId);
            await refreshPendingCount();
            return "offline";
        }

        try {
            await finishOnlineSession(sessionId, adapter);
            await refreshPendingCount();
            await reloadSnapshot();
            return "synced";
        } catch (error) {
            if (error instanceof AthleteSyncConflictError) {
                onConflict?.();
                throw error;
            }
            await queueSessionComplete(sessionId);
            await refreshPendingCount();
            return "queued";
        }
    }, [adapter, isOnline, onConflict, refreshPendingCount, reloadSnapshot, sessionId]);

    const isUsingCache =
        !isOnline && flatExercises.length === 0 && cachedSnapshot != null;

    const localExecutions = cachedSnapshot?.localExecutions ?? [];

    return {
        isOnline,
        pendingCount,
        cachedSnapshot,
        localExecutions,
        isUsingCache,
        logSet,
        logExecution,
        logTimedResult,
        finishSession,
        refreshPendingCount,
    };
}
