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
    /** Modo Reps/Tiempo por ejercicio (superset: A1/A2 independientes) */
    repsTipo?: RepsTipo;
    /** ID en servidor (para EditSession diff) */
    serverExerciseId?: number;
}

/** Modo de la columna Reps/Tiempo: Reps o Tiempo (AMRAP es tipo de serie, no modo reps) */
export type RepsTipo = "reps" | "tiempo";

/** Carga por sub-fila de serie (single_set / futuro dropset). */
export interface ConstructorSetData {
    id: string;
    plannedReps: string | null;
    plannedWeight: number | null;
    plannedDuration: number | null;
    effortCharacter: EffortCharacter | null;
    effortValue: number | null;
    rest: number | null;
    isManuallyEdited: boolean;
    /** ID en servidor de la línea API (EditSession diff) */
    serverExerciseId?: number;
}

/** Ventana EMOM (V1, V2…) — varios ejercicios en el mismo intervalo de tiempo. */
export interface EmomWindow {
    id: string;
    exercises: ConstructorExercise[];
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
    /** Modo Reps/Tiempo: Reps, Tiempo, RPE, AMRAP — determina inputs de la columna */
    repsTipo?: RepsTipo;
    /** Sub-filas de carga por serie (single_set: length === sets) */
    setData?: ConstructorSetData[];
    /** Ventanas EMOM (V1, V2…); cada una con 1+ ejercicios en el mismo intervalo */
    emomWindows?: EmomWindow[];
    /** ID en servidor (para EditSession diff) */
    serverBlockId?: number;
}

/** Metadatos de bloque a nivel card (evolución hacia estado discriminado por setType). */
export interface ConstructorBlockBase {
    id: string;
    blockTypeId: number;
    setType: SetType;
    notes: string | null;
    serverBlockId?: number;
}

/**
 * Puente S-INF: cada fila legacy del constructor se expone como bloque-card
 * hasta que cada setType tenga su propio constructor (SupersetBlock, …).
 */
export interface LegacyConstructorBlock extends ConstructorBlockBase {
    row: ConstructorRow;
}

export type ConstructorBlock = LegacyConstructorBlock;

export function legacyRowAsBlock(row: ConstructorRow): LegacyConstructorBlock {
    return {
        id: row.id,
        blockTypeId: row.blockTypeId,
        setType: row.setType,
        notes: null,
        serverBlockId: row.serverBlockId,
        row,
    };
}
