/**
 * athleteSessionSync.ts — Cola offline + flush para ejecución atleta (F1).
 * @see docs/audits/portal-atleta/07_MOBILE_PWA_Y_OFFLINE.md §5
 */

import type { SessionBlockExerciseUpdate } from "../types/sessionProgramming";
import {
    addPendingComplete,
    addPendingLog,
    clearSessionOfflineData,
    getPendingCompletes,
    getPendingLogs,
    getSessionSnapshot,
    isIndexedDbAvailable,
    removePendingComplete,
    removePendingLog,
    saveSessionSnapshot,
} from "./athleteSessionDb";
import type {
    AthleteFlatExercise,
    AthleteSessionSnapshot,
    AthleteSessionSyncAdapter,
    PendingExerciseLog,
} from "./athleteSessionTypes";
import { AthleteSyncConflictError } from "./athleteSessionTypes";

const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

export function createLogId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Last-write-wins por blockExerciseId (timestamp más reciente gana). */
export function dedupePendingLogs(logs: PendingExerciseLog[]): PendingExerciseLog[] {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    const byExercise = new Map<number, PendingExerciseLog>();
    for (const log of sorted) {
        byExercise.set(log.blockExerciseId, log);
    }
    return [...byExercise.values()].sort((a, b) => a.ts - b.ts);
}

export function isSnapshotExpired(snapshot: AthleteSessionSnapshot): boolean {
    return Date.now() - snapshot.savedAt > SNAPSHOT_TTL_MS;
}

export async function persistSessionSnapshot(input: {
    sessionId: number;
    clientId: number;
    sessionName: string;
    flatExercises: AthleteFlatExercise[];
}): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    await saveSessionSnapshot({
        ...input,
        savedAt: Date.now(),
    });
}

export async function loadSessionSnapshot(
    sessionId: number
): Promise<AthleteSessionSnapshot | null> {
    if (!isIndexedDbAvailable()) return null;
    const snapshot = await getSessionSnapshot(sessionId);
    if (!snapshot || isSnapshotExpired(snapshot)) {
        return null;
    }
    return snapshot;
}

export async function queueExerciseLog(input: {
    sessionId: number;
    blockExerciseId: number;
    payload: SessionBlockExerciseUpdate;
}): Promise<PendingExerciseLog> {
    const entry: PendingExerciseLog = {
        id: createLogId(),
        sessionId: input.sessionId,
        blockExerciseId: input.blockExerciseId,
        payload: input.payload,
        ts: Date.now(),
        retryCount: 0,
    };
    if (isIndexedDbAvailable()) {
        await addPendingLog(entry);
    }
    return entry;
}

export async function queueSessionComplete(sessionId: number): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    await addPendingComplete({ sessionId, ts: Date.now() });
}

function isConflictError(error: unknown): boolean {
    if (error instanceof AthleteSyncConflictError) return true;
    const status =
        (error as { status?: number })?.status ??
        (error as { originalStatus?: number })?.originalStatus;
    return status === 409;
}

function wrapAdapterError(error: unknown): never {
    if (isConflictError(error)) {
        throw new AthleteSyncConflictError();
    }
    throw error;
}

export interface FlushResult {
    syncedLogs: number;
    syncedCompletes: number;
    conflict: boolean;
}

/** Sincroniza cola pendiente con el backend. */
export async function flushPendingSessionSync(
    sessionId: number,
    adapter: AthleteSessionSyncAdapter
): Promise<FlushResult> {
    if (!isIndexedDbAvailable()) {
        return { syncedLogs: 0, syncedCompletes: 0, conflict: false };
    }

    const rawLogs = await getPendingLogs(sessionId);
    const logs = dedupePendingLogs(rawLogs);
    let syncedLogs = 0;
    let conflict = false;

    for (const log of logs) {
        try {
            await adapter.updateExercise(log.blockExerciseId, log.payload);
            await removePendingLog(log.id);
            syncedLogs += 1;
        } catch (error) {
            if (isConflictError(error)) {
                conflict = true;
                break;
            }
            throw error;
        }
    }

    if (conflict) {
        return { syncedLogs, syncedCompletes: 0, conflict: true };
    }

    const completes = (await getPendingCompletes()).filter((c) => c.sessionId === sessionId);
    let syncedCompletes = 0;
    for (const entry of completes) {
        try {
            await adapter.completeSession(entry.sessionId);
            await removePendingComplete(entry.sessionId);
            syncedCompletes += 1;
        } catch (error) {
            wrapAdapterError(error);
        }
    }

    if (syncedLogs > 0 || syncedCompletes > 0) {
        const remainingLogs = await getPendingLogs(sessionId);
        const remainingCompletes = (await getPendingCompletes()).filter(
            (c) => c.sessionId === sessionId
        );
        if (remainingLogs.length === 0 && remainingCompletes.length === 0) {
            await clearSessionOfflineData(sessionId);
        }
    }

    return { syncedLogs, syncedCompletes, conflict: false };
}

export interface FinishOnlineSessionResult {
    alreadyCompleted: boolean;
}

/**
 * Online session finish: flush pending exercise logs (and queued completes) before
 * marking complete, so post-session report reflects all logged sets.
 */
export async function finishOnlineSession(
    sessionId: number,
    adapter: AthleteSessionSyncAdapter
): Promise<FinishOnlineSessionResult> {
    await pruneSupersededLogs(sessionId);
    const flushResult = await flushPendingSessionSync(sessionId, adapter);

    if (flushResult.conflict) {
        throw new AthleteSyncConflictError();
    }

    if (flushResult.syncedCompletes > 0) {
        return { alreadyCompleted: true };
    }

    await adapter.completeSession(sessionId);
    return { alreadyCompleted: false };
}

/** Elimina logs duplicados obsoletos tras dedupe (mantiene solo el ganador por ejercicio). */
export async function pruneSupersededLogs(sessionId: number): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const raw = await getPendingLogs(sessionId);
    const winners = new Set(dedupePendingLogs(raw).map((l) => l.id));
    for (const log of raw) {
        if (!winners.has(log.id)) {
            await removePendingLog(log.id);
        }
    }
}

export { isIndexedDbAvailable };
