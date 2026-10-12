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
import { areBlockExercisesLoaded, isBlockStructureLoading } from "./sessionStructureLoading";

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
                isLoadingExerciseCatalog: false,
            })
        ).toBe(true);
    });
});
