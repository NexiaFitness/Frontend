/**
 * athleteSessionQueueDedupe.ts — Last-write-wins y poda de la cola offline del atleta por clave.
 * Contexto: extraido de athleteSessionSync.ts (agent.md 7.1: superaba 600 lineas y no puede crecer);
 * el drenaje (flushPendingSessionSync) poda aqui los superados antes de enviar (DBG-E-01).
 * Notas de mantenimiento: claves = (sessionId, stepKey) en ejecuciones y timed, (sessionId,
 * blockExerciseId) en notas, blockExerciseId en logs legacy. Orden de envio = orden por ts.
 * @author Frontend Team / Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import {
    getPendingExecutions,
    getPendingExerciseNotes,
    getPendingLogs,
    getPendingTimedResults,
    isIndexedDbAvailable,
    removePendingExecution,
    removePendingExerciseNote,
    removePendingLog,
    removePendingTimedResult,
} from "./athleteSessionDb";
import type {
    PendingAthleteExerciseNoteLog,
    PendingExecutionLog,
    PendingExerciseLog,
    PendingTimedResultLog,
} from "./athleteSessionTypes";

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
/** Last-write-wins por (sessionId, blockExerciseId) — D6. */
export function dedupePendingExerciseNotes(
    logs: PendingAthleteExerciseNoteLog[]
): PendingAthleteExerciseNoteLog[] {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    const bySlot = new Map<string, PendingAthleteExerciseNoteLog>();
    for (const log of sorted) {
        bySlot.set(`${log.sessionId}:${log.blockExerciseId}`, log);
    }
    return [...bySlot.values()].sort((a, b) => a.ts - b.ts);
}

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

export async function pruneSupersededExerciseNotes(sessionId: number): Promise<void> {
    if (!isIndexedDbAvailable()) return;
    const raw = await getPendingExerciseNotes(sessionId);
    const winners = new Set(dedupePendingExerciseNotes(raw).map((l) => l.id));
    for (const log of raw) {
        if (!winners.has(log.id)) {
            await removePendingExerciseNote(log.id);
        }
    }
}
