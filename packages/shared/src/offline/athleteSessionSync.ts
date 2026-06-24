/**
 * athleteSessionSync.ts — Cola offline + flush para ejecución atleta (F1 + F5).
 * @see docs/audits/portal-atleta/07_MOBILE_PWA_Y_OFFLINE.md §5
 */

import type { AthleteRunExecutionCreate, AthleteRunTimedResultCreate } from "../types/athleteRunReference";
import type { SessionBlockExerciseUpdate } from "../types/sessionProgramming";
import {
    addPendingComplete,
    addPendingExecution,
    addPendingLog,
    addPendingTimedResult,
    clearSessionOfflineData,
    getPendingCompletes,
    getPendingExecutions,
    getPendingLogs,
    getPendingTimedResults,
    getSessionSnapshot,
    isIndexedDbAvailable,
    removePendingComplete,
    removePendingExecution,
    removePendingLog,
    removePendingTimedResult,
    saveSessionSnapshot,
} from "./athleteSessionDb";
import type {
    AthleteFlatExercise,
    AthleteSessionSnapshot,
    AthleteSessionSyncAdapter,
    LocalSetExecution,
    PendingExecutionLog,
    PendingExerciseLog,
    PendingTimedResultLog,
} from "./athleteSessionTypes";
import { AthleteSyncConflictError } from "./athleteSessionTypes";

const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

export function createLogId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Last-write-wins por blockExerciseId (legacy agregado). */
export function dedupePendingLogs(logs: PendingExerciseLog[]): PendingExerciseLog[] {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    const byExercise = new Map<number, PendingExerciseLog>();
    for (const log of sorted) {
        byExercise.set(log.blockExerciseId, log);
    }
    return [...byExercise.values()].sort((a, b) => a.ts - b.ts);
}

/** Last-write-wins por (sessionId, stepKey) — F5-OFF-02. */
export function dedupePendingExecutions(
    logs: PendingExecutionLog[]
): PendingExecutionLog[] {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    const byStep = new Map<string, PendingExecutionLog>();
    for (const log of sorted) {
        byStep.set(`${log.sessionId}:${log.stepKey}`, log);
    }
    return [...byStep.values()].sort((a, b) => a.ts - b.ts);
}

/** Last-write-wins por (sessionId, stepKey) en timed results. */
export function dedupePendingTimedResults(
    logs: PendingTimedResultLog[]
): PendingTimedResultLog[] {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    const byStep = new Map<string, PendingTimedResultLog>();
    for (const log of sorted) {
        byStep.set(`${log.sessionId}:${log.stepKey}`, log);
    }
    return [...byStep.values()].sort((a, b) => a.ts - b.ts);
}

export function executionPayloadToLocal(
    payload: AthleteRunExecutionCreate,
    performedAt: number
): LocalSetExecution {
    return {
        step_key: payload.step_key,
        exercise_id: payload.exercise_id,
        weight_kg: payload.weight_kg ?? null,
        reps: payload.reps ?? null,
        rpe: payload.rpe ?? null,
        set_index: payload.set_index ?? null,
        round_index: payload.round_index ?? null,
        slot_label: payload.slot_label ?? null,
        group_kind: payload.group_kind ?? null,
        rounds_completed: payload.rounds_completed ?? null,
        total_seconds: payload.split_seconds ?? null,
        performed_at: performedAt,
    };
}

export function mergeLocalExecutions(
    current: readonly LocalSetExecution[] | undefined,
    next: LocalSetExecution
): LocalSetExecution[] {
    const without = (current ?? []).filter((row) => row.step_key !== next.step_key);
    return [...without, next].sort((a, b) => a.performed_at - b.performed_at);
}

export function isSnapshotExpired(snapshot: AthleteSessionSnapshot): boolean {
    return Date.now() - snapshot.savedAt > SNAPSHOT_TTL_MS;
}

export async function persistSessionSnapshot(input: {
    sessionId: number;
    clientId: number;
    sessionName: string;
    flatExercises: AthleteFlatExercise[];
    localExecutions?: LocalSetExecution[];
}): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const existing = await getSessionSnapshot(input.sessionId);
    await saveSessionSnapshot({
        ...input,
        localExecutions: input.localExecutions ?? existing?.localExecutions ?? [],
        savedAt: Date.now(),
    });
}

export async function appendLocalExecutionToSnapshot(
    sessionId: number,
    execution: LocalSetExecution
): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const snapshot = await getSessionSnapshot(sessionId);
    if (!snapshot) return;
    await saveSessionSnapshot({
        ...snapshot,
        localExecutions: mergeLocalExecutions(snapshot.localExecutions, execution),
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

/** Normaliza payload execution para cola offline (SIG-06: conserva suggestion_snapshot). */
export function prepareOfflineExecutionPayload(
    payload: AthleteRunExecutionCreate
): AthleteRunExecutionCreate {
    return { ...payload, source: payload.source ?? "offline_sync" };
}

export async function queueExecutionLog(input: {
    sessionId: number;
    stepKey: string;
    payload: AthleteRunExecutionCreate;
}): Promise<PendingExecutionLog> {
    const ts = Date.now();
    const entry: PendingExecutionLog = {
        id: createLogId(),
        sessionId: input.sessionId,
        stepKey: input.stepKey,
        payload: prepareOfflineExecutionPayload(input.payload),
        ts,
        retryCount: 0,
    };
    if (isIndexedDbAvailable()) {
        await addPendingExecution(entry);
        await appendLocalExecutionToSnapshot(
            input.sessionId,
            executionPayloadToLocal(entry.payload, ts)
        );
    }
    return entry;
}

export async function queueTimedResultLog(input: {
    sessionId: number;
    stepKey: string;
    payload: AthleteRunTimedResultCreate;
}): Promise<PendingTimedResultLog> {
    const entry: PendingTimedResultLog = {
        id: createLogId(),
        sessionId: input.sessionId,
        stepKey: input.stepKey,
        payload: input.payload,
        ts: Date.now(),
        retryCount: 0,
    };
    if (isIndexedDbAvailable()) {
        await addPendingTimedResult(entry);
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
    syncedExecutions: number;
    syncedTimedResults: number;
    syncedCompletes: number;
    conflict: boolean;
}

/** Sincroniza cola pendiente con el backend. */
export async function flushPendingSessionSync(
    sessionId: number,
    adapter: AthleteSessionSyncAdapter
): Promise<FlushResult> {
    if (!isIndexedDbAvailable()) {
        return {
            syncedLogs: 0,
            syncedExecutions: 0,
            syncedTimedResults: 0,
            syncedCompletes: 0,
            conflict: false,
        };
    }

    let conflict = false;
    let syncedExecutions = 0;
    let syncedTimedResults = 0;

    const rawExecutions = await getPendingExecutions(sessionId);
    const executions = dedupePendingExecutions(rawExecutions);

    for (const log of executions) {
        try {
            await adapter.postExecution(log.payload);
            await removePendingExecution(log.id);
            syncedExecutions += 1;
        } catch (error) {
            if (isConflictError(error)) {
                conflict = true;
                break;
            }
            throw error;
        }
    }

    if (conflict) {
        return {
            syncedLogs: 0,
            syncedExecutions,
            syncedTimedResults: 0,
            syncedCompletes: 0,
            conflict: true,
        };
    }

    const rawTimed = await getPendingTimedResults(sessionId);
    const timedResults = dedupePendingTimedResults(rawTimed);

    for (const log of timedResults) {
        try {
            await adapter.postTimedResult(log.payload);
            await removePendingTimedResult(log.id);
            syncedTimedResults += 1;
        } catch (error) {
            if (isConflictError(error)) {
                conflict = true;
                break;
            }
            throw error;
        }
    }

    if (conflict) {
        return {
            syncedLogs: 0,
            syncedExecutions,
            syncedTimedResults,
            syncedCompletes: 0,
            conflict: true,
        };
    }

    const rawLogs = await getPendingLogs(sessionId);
    const logs = dedupePendingLogs(rawLogs);
    let syncedLogs = 0;

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
        return {
            syncedLogs,
            syncedExecutions,
            syncedTimedResults,
            syncedCompletes: 0,
            conflict: true,
        };
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

    if (syncedLogs > 0 || syncedExecutions > 0 || syncedTimedResults > 0 || syncedCompletes > 0) {
        const remainingLogs = await getPendingLogs(sessionId);
        const remainingExecutions = await getPendingExecutions(sessionId);
        const remainingTimed = await getPendingTimedResults(sessionId);
        const remainingCompletes = (await getPendingCompletes()).filter(
            (c) => c.sessionId === sessionId
        );
        if (
            remainingLogs.length === 0 &&
            remainingExecutions.length === 0 &&
            remainingTimed.length === 0 &&
            remainingCompletes.length === 0
        ) {
            await clearSessionOfflineData(sessionId);
        }
    }

    return {
        syncedLogs,
        syncedExecutions,
        syncedTimedResults,
        syncedCompletes,
        conflict: false,
    };
}

export interface FinishOnlineSessionResult {
    alreadyCompleted: boolean;
}

export async function finishOnlineSession(
    sessionId: number,
    adapter: AthleteSessionSyncAdapter
): Promise<FinishOnlineSessionResult> {
    await pruneSupersededLogs(sessionId);
    await pruneSupersededExecutions(sessionId);
    await pruneSupersededTimedResults(sessionId);
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

export async function pruneSupersededExecutions(sessionId: number): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const raw = await getPendingExecutions(sessionId);
    const winners = new Set(dedupePendingExecutions(raw).map((l) => l.id));
    for (const log of raw) {
        if (!winners.has(log.id)) {
            await removePendingExecution(log.id);
        }
    }
}

export async function pruneSupersededTimedResults(sessionId: number): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const raw = await getPendingTimedResults(sessionId);
    const winners = new Set(dedupePendingTimedResults(raw).map((l) => l.id));
    for (const log of raw) {
        if (!winners.has(log.id)) {
            await removePendingTimedResult(log.id);
        }
    }
}

export { isIndexedDbAvailable };
