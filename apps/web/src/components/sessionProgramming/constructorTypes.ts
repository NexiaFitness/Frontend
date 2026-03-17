/**
 * constructorTypes.ts — Tipos para el Constructor de Sesión
 *
 * Estado local en CreateSession/EditSession antes de persistir.
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 */

import type { SetType, EffortCharacter } from "@nexia/shared/types/sessionProgramming";

export interface ConstructorExercise {
    id: string;
    exerciseId: number;
    exerciseName: string;
    plannedReps: string | null;
    plannedWeight: number | null;
    plannedDuration: number | null;
    effortCharacter: EffortCharacter | null;
    effortValue: number | null;
    notes: string | null;
    /** ID en servidor (para EditSession diff) */
    serverExerciseId?: number;
}

export interface ConstructorRow {
    id: string;
    blockTypeId: number;
    setType: SetType;
    sets: number | null;
    rounds: number | null;
    timeCap: number | null;
    intervalSeconds: number | null;
    exercises: ConstructorExercise[];
    rest: number | null;
    /** ID en servidor (para EditSession diff) */
    serverBlockId?: number;
}
