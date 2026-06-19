/**
 * athleteSessionTypes.ts — Tipos para cola offline de ejecución atleta (F1).
 */

import type { SessionBlockExerciseUpdate } from "../types/sessionProgramming";

export interface AthleteFlatExercise {
    /** ID estable para UI (puede repetir blockExerciseId en multi-serie legacy). */
    stepKey: string;
    blockExerciseId: number;
    /** ID catálogo ejercicio (progress tracking / PR). */
    exerciseId: number;
    name: string;
    blockName: string | null;
    groupKind: string | null;
    setLabel: string;
    setIndex: number;
    totalSetsInSlot: number;
    plannedLabel: string;
    /** Peso planificado de esta serie (kg), null si no prescrito. */
    plannedWeight: number | null;
    defaultWeight: number;
    defaultReps: number;
    restSeconds: number | null;
    defaultRpe: number | null;
    /** URL de vídeo demostrativo (null si no disponible). */
    videoUrl: string | null;
    /** Series ya registradas en backend para esta fila. */
    loggedSets: number;
    /** Contexto V05 Fase B — opcional en snapshots offline antiguos. */
    badgeLabel?: string;
    groupId?: string;
    roundIndex?: number;
    roundTotal?: number | null;
    slotLabel?: string;
    instruction?: string;
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
