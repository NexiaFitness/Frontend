/**
 * athleteSessionTypes.ts — Tipos para cola offline de ejecución atleta (F1).
 */

import type { SessionBlockExerciseUpdate } from "../types/sessionProgramming";

/** Ejercicio aplanado para logger MVP atleta. */
export interface AthleteFlatExercise {
    blockExerciseId: number;
    name: string;
    plannedLabel: string;
    defaultWeight: number;
    defaultReps: number;
}

/** Snapshot de sesión persistido al abrir (lectura offline). */
export interface AthleteSessionSnapshot {
    sessionId: number;
    clientId: number;
    sessionName: string;
    flatExercises: AthleteFlatExercise[];
    savedAt: number;
}

/** Entrada en cola de logs de ejercicio pendientes de sync. */
export interface PendingExerciseLog {
    id: string;
    sessionId: number;
    blockExerciseId: number;
    payload: SessionBlockExerciseUpdate;
    ts: number;
    retryCount: number;
}

/** Sesión marcada como completada offline. */
export interface PendingSessionComplete {
    sessionId: number;
    ts: number;
}

export interface AthleteSessionSyncAdapter {
    updateExercise: (blockExerciseId: number, data: SessionBlockExerciseUpdate) => Promise<void>;
    completeSession: (sessionId: number) => Promise<void>;
}

export class AthleteSyncConflictError extends Error {
    readonly status = 409;

    constructor(message = "Conflicto al sincronizar. Revisa la sesión con tu entrenador.") {
        super(message);
        this.name = "AthleteSyncConflictError";
    }
}
