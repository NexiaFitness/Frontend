/**
 * sessionStructureLoading.spec.ts — Carga de ejercicios por bloque tras cambiar de sesion (DBG-G-02).
 *
 * Proposito: "ejercicios cargados" debe referirse a los bloques actuales, no a un recuento de entradas
 * que pueden ser de los bloques de la sesion anterior.
 * Contexto: useSessionStructureView no reinicia blockExercisesByBlock al cambiar sessionId.
 * Notas: funcion pura; complementa apps/web/src/hooks/athlete/useSessionStructureView.sessionChange.spec.tsx.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { describe, expect, it } from "vitest";

import type { SessionBlockExercise } from "../../types/sessionProgramming";
import type { SessionExercise } from "../../types/trainingSessions";
import {
    areBlockExercisesLoaded,
    blockExerciseIds,
    isBlockStructureLoading,
    legacyExerciseIdsWithoutName,
} from "./sessionStructureLoading";

const rows = (blockId: number): SessionBlockExercise[] =>
    [{ id: blockId * 10, session_block_id: blockId } as SessionBlockExercise];

// Sesion anterior: bloques 7 y 8. Sesion nueva: bloque 1 (dos entradas >= un bloque si solo se cuentan).
const previousSessionMap: Record<number, SessionBlockExercise[]> = { 7: rows(7), 8: rows(8) };

describe("areBlockExercisesLoaded (DBG-G-02)", () => {
    it("no da por cargado el bloque 1 con ejercicios de los bloques 7 y 8", () => {
        expect(areBlockExercisesLoaded([1], previousSessionMap)).toBe(false);
    });

    it("da por cargados los bloques actuales cuando todos tienen entrada", () => {
        expect(areBlockExercisesLoaded([7, 8], previousSessionMap)).toBe(true);
        expect(areBlockExercisesLoaded([], {})).toBe(true);
    });
});

describe("isBlockStructureLoading (DBG-G-02)", () => {
    it("sigue cargando si los ejercicios del mapa son de otros bloques", () => {
        expect(
            isBlockStructureLoading({
                isLoadingBlocks: false,
                blockIds: [1],
                blockExercisesByBlock: previousSessionMap,
                isLoadingBlockTypes: false,
                isLoadingExerciseNames: false,
            })
        ).toBe(true);
    });

    it("sigue cargando mientras llegan los nombres de los ejercicios", () => {
        expect(
            isBlockStructureLoading({
                isLoadingBlocks: false,
                blockIds: [7],
                blockExercisesByBlock: previousSessionMap,
                isLoadingBlockTypes: false,
                isLoadingExerciseNames: true,
            })
        ).toBe(true);
    });
});

describe("ids que se piden a /exercises/lookup (PERF-7)", () => {
    const withExercise = (blockId: number, exerciseIds: number[]): SessionBlockExercise[] =>
        exerciseIds.map(
            (exerciseId, i) =>
                ({ id: blockId * 10 + i, session_block_id: blockId, exercise_id: exerciseId }) as SessionBlockExercise
        );

    it("solo pide los ejercicios de los bloques actuales", () => {
        const map = { 1: withExercise(1, [5, 6]), 2: withExercise(2, [9]), 7: withExercise(7, [99]) };
        expect(blockExerciseIds([1, 2], map)).toEqual([5, 6, 9]);
    });

    it("en legacy solo pide los ejercicios que no traen nombre", () => {
        const legacy: SessionExercise[] = [
            { exercise_id: 1, exercise: { nombre: "Sentadilla" } } as SessionExercise,
            { exercise_id: 2, exercise: { nombre: "  " } } as SessionExercise,
            { exercise_id: 3 } as SessionExercise,
        ];
        expect(legacyExerciseIdsWithoutName(legacy)).toEqual([2, 3]);
    });
});
