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

/** Modo de la columna Reps/Tiempo: Reps o Tiempo (AMRAP es tipo de serie, no modo reps) */
export type RepsTipo = "reps" | "tiempo";

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
    /** Modo Reps/Tiempo: Reps, Tiempo, RPE, AMRAP — determina inputs de la columna */
    repsTipo?: RepsTipo;
    /** ID en servidor (para EditSession diff) */
    serverBlockId?: number;
}
