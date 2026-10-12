/**
 * offlineSessionQueue.audit.spec.tsx — Cola offline del guiado: reintentos, duplicados, orden, dos pestanas (punto e).
 *
 * Proposito: contar las peticiones que salen al drenar la cola (useOfflineSessionLog + flushPendingSessionSync).
 * Contexto: auditoria debug/claude-code-2026-10-13; useAthleteSessionRun delega la cola en useOfflineSessionLog.
 * Notas: no hay fake-indexeddb instalado; se sustituye athleteSessionDb por un almacen en memoria con la misma
 * API, de modo que la logica real de sync (dedupe, prune, flush) se ejecuta sin cambios.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AthleteRunExecutionCreate } from "@nexia/shared/types/athleteRunReference";
import type {
    AthleteSessionSnapshot,
    AthleteSessionSyncAdapter,
    PendingAthleteExerciseNoteLog,
    PendingExecutionLog,
    PendingExerciseLog,
    PendingSessionComplete,
    PendingTimedResultLog,
} from "@nexia/shared/offline/athleteSessionTypes";

const mem = vi.hoisted(() => ({
    executions: new Map<string, PendingExecutionLog>(),
    timed: new Map<string, PendingTimedResultLog>(),
    notes: new Map<string, PendingAthleteExerciseNoteLog>(),
    logs: new Map<string, PendingExerciseLog>(),
    completes: new Map<number, PendingSessionComplete>(),
    snapshots: new Map<number, AthleteSessionSnapshot>(),
    online: true,
}));

vi.mock("@nexia/shared/offline/athleteSessionDb", () => {
    const bySession = <T extends { sessionId: number }>(map: Map<string, T>, sessionId?: number) =>
        [...map.values()].filter((row) => sessionId == null || row.sessionId === sessionId);
    return {
        isIndexedDbAvailable: () => true,
        saveSessionSnapshot: async (s: AthleteSessionSnapshot) => {
            mem.snapshots.set(s.sessionId, s);
        },
        getSessionSnapshot: async (sessionId: number) => mem.snapshots.get(sessionId) ?? null,
        addPendingLog: async (l: PendingExerciseLog) => void mem.logs.set(l.id, l),
        getPendingLogs: async (sessionId?: number) => bySession(mem.logs, sessionId),
        removePendingLog: async (id: string) => void mem.logs.delete(id),
        addPendingExecution: async (l: PendingExecutionLog) => void mem.executions.set(l.id, l),
        getPendingExecutions: async (sessionId?: number) => bySession(mem.executions, sessionId),
        removePendingExecution: async (id: string) => void mem.executions.delete(id),
        addPendingTimedResult: async (l: PendingTimedResultLog) => void mem.timed.set(l.id, l),
        getPendingTimedResults: async (sessionId?: number) => bySession(mem.timed, sessionId),
        removePendingTimedResult: async (id: string) => void mem.timed.delete(id),
        addPendingExerciseNote: async (l: PendingAthleteExerciseNoteLog) => void mem.notes.set(l.id, l),
        getPendingExerciseNotes: async (sessionId?: number) => bySession(mem.notes, sessionId),
        removePendingExerciseNote: async (id: string) => void mem.notes.delete(id),
        addPendingComplete: async (e: PendingSessionComplete) => void mem.completes.set(e.sessionId, e),
        getPendingCompletes: async () => [...mem.completes.values()],
        removePendingComplete: async (sessionId: number) => void mem.completes.delete(sessionId),
        clearSessionOfflineData: async (sessionId: number) => {
            mem.snapshots.delete(sessionId);
        },
        countPendingForSession: async (sessionId: number) =>
            bySession(mem.executions, sessionId).length +
            bySession(mem.timed, sessionId).length +
            bySession(mem.notes, sessionId).length +
            bySession(mem.logs, sessionId).length +
            (mem.completes.has(sessionId) ? 1 : 0),
    };
});

vi.mock("@nexia/shared/hooks/offline/useOnlineStatus", () => ({
    useOnlineStatus: () => mem.online,
}));

import { useOfflineSessionLog } from "@nexia/shared/hooks/offline/useOfflineSessionLog";
import { flushPendingSessionSync } from "@nexia/shared/offline/athleteSessionSync";

const SESSION = 7;

const execution = (stepKey: string, weight: number): AthleteRunExecutionCreate =>
    ({
        training_session_id: SESSION,
        step_key: stepKey,
        exercise_id: 1,
        weight_kg: weight,
        reps: 8,
        source: "run_live",
    }) as AthleteRunExecutionCreate;

const queueExecution = (id: string, stepKey: string, weight: number, ts: number) =>
    mem.executions.set(id, {
        id,
        sessionId: SESSION,
        stepKey,
        payload: execution(stepKey, weight),
        ts,
        retryCount: 0,
    });

const queueNote = (id: string, note: string, ts: number) =>
    mem.notes.set(id, { id, sessionId: SESSION, blockExerciseId: 55, athleteNote: note, ts, retryCount: 0 });

function makeAdapter(overrides: Partial<AthleteSessionSyncAdapter> = {}) {
    const calls: string[] = [];
    const adapter: AthleteSessionSyncAdapter = {
        updateExercise: vi.fn(async () => undefined),
        completeSession: vi.fn(async () => {
            calls.push("complete");
        }),
        postExecution: vi.fn(async (p: AthleteRunExecutionCreate) => {
            calls.push(`exec:${p.step_key}:${p.weight_kg}`);
        }),
        postTimedResult: vi.fn(async () => undefined),
        putExerciseNote: vi.fn(async (p) => {
            calls.push(`note:${p.athlete_note}`);
        }),
        ...overrides,
    };
    return { adapter, calls };
}

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    mem.executions.clear();
    mem.timed.clear();
    mem.notes.clear();
    mem.logs.clear();
    mem.completes.clear();
    mem.snapshots.clear();
    mem.online = true;
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("cola offline — notas de ejercicio reeditadas (DBG-E-01)", () => {
    it("tras dos reconexiones solo se envia la ultima nota, nunca la anterior", async () => {
        queueNote("n1", "rodilla molesta", 100);
        queueNote("n2", "rodilla bien", 200);
        const { adapter, calls } = makeAdapter();

        const { rerender } = renderHook(() =>
            useOfflineSessionLog({
                sessionId: SESSION,
                clientId: 3,
                sessionName: "Audit",
                flatExercises: [],
                adapter,
            })
        );
        await waitFor(() => expect(calls).toContain("note:rodilla bien"));

        mem.online = false;
        rerender();
        await act(flushMicrotasks);
        mem.online = true;
        rerender();
        await act(flushMicrotasks);
        await act(flushMicrotasks);

        expect(calls.filter((c) => c.startsWith("note:"))).toEqual(["note:rodilla bien"]);
        expect(mem.notes.size).toBe(0);
    });
});

describe("cola offline — error permanente en cabeza (DBG-E-02)", () => {
    it("un 422 en la primera serie no bloquea el envio de la segunda", async () => {
        queueExecution("e1", "block-1-single-0-r1-S3-S1-1", 60, 100);
        queueExecution("e2", "block-1-single-0-r1-S3-S2-2", 62.5, 200);
        const { adapter, calls } = makeAdapter({
            postExecution: vi.fn(async (p: AthleteRunExecutionCreate) => {
                if (p.step_key.endsWith("S1-1")) {
                    throw { status: 422, data: { detail: "invalid" } };
                }
                calls.push(`exec:${p.step_key}:${p.weight_kg}`);
            }),
        });

        await flushPendingSessionSync(SESSION, adapter).catch(() => undefined);

        expect(calls).toEqual(["exec:block-1-single-0-r1-S3-S2-2:62.5"]);
        expect([...mem.executions.keys()]).toEqual(["e1"]);
    });

    it("un error de red detiene el drenaje y conserva todo para reintentar", async () => {
        queueExecution("e1", "block-1-single-0-r1-S3-S1-1", 60, 100);
        queueExecution("e2", "block-1-single-0-r1-S3-S2-2", 62.5, 200);
        const postExecution = vi.fn(async () => {
            throw { status: "FETCH_ERROR", error: "TypeError: Failed to fetch" };
        });
        const { adapter } = makeAdapter({ postExecution });

        await expect(flushPendingSessionSync(SESSION, adapter)).rejects.toBeDefined();

        expect(postExecution).toHaveBeenCalledTimes(1);
        expect(mem.executions.size).toBe(2);
    });
});

describe("cola offline — dos pestanas drenan a la vez (DBG-E-03)", () => {
    it("con Web Locks del navegador cada elemento se envia una sola vez", async () => {
        const held = new Map<string, Promise<unknown>>();
        vi.stubGlobal("navigator", {
            ...navigator,
            locks: {
                request: (name: string, cb: () => Promise<unknown>) => {
                    const prev = held.get(name) ?? Promise.resolve();
                    const next = prev.then(cb, cb);
                    held.set(name, next.catch(() => undefined));
                    return next;
                },
            },
        });
        queueExecution("e1", "block-1-single-0-r1-S3-S1-1", 60, 100);
        queueExecution("e2", "block-1-single-0-r1-S3-S2-2", 62.5, 200);
        mem.completes.set(SESSION, { sessionId: SESSION, ts: 300 });
        const { adapter, calls } = makeAdapter();

        await Promise.all([
            flushPendingSessionSync(SESSION, adapter),
            flushPendingSessionSync(SESSION, adapter),
        ]);

        expect(calls).toEqual([
            "exec:block-1-single-0-r1-S3-S1-1:60",
            "exec:block-1-single-0-r1-S3-S2-2:62.5",
            "complete",
        ]);
    });
});
