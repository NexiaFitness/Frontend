/**
 * Tests unitarios: computeTargetWeeklySets (contrato §6.1 SPEC).
 */

import { describe, expect, it } from "vitest";
import { computeTargetWeeklySets } from "./weeklyVolumeTarget";

describe("computeTargetWeeklySets", () => {
    describe("tabla normativa §6.1", () => {
        it.each([
            [20, 10, 20],
            [20, 5, 10],
            [20, 1, 2],
            [3, 1, 1],
            [22, 3, 7],
            [1, 1, 1],
        ] as const)("maxSets=%i volumeLevel=%i → %i", (maxSets, volumeLevel, expected) => {
            expect(computeTargetWeeklySets(maxSets, volumeLevel)).toBe(expected);
        });
    });

    describe("entradas inválidas → null (§6.1, §10 Fase 2)", () => {
        it("maxSets no finito o NaN", () => {
            expect(computeTargetWeeklySets(NaN, 5)).toBeNull();
            expect(computeTargetWeeklySets(Number.POSITIVE_INFINITY, 5)).toBeNull();
        });

        it("volumeLevel no finito", () => {
            expect(computeTargetWeeklySets(20, NaN)).toBeNull();
        });

        it("maxSets < 1 o no entero", () => {
            expect(computeTargetWeeklySets(0, 5)).toBeNull();
            expect(computeTargetWeeklySets(-1, 5)).toBeNull();
            expect(computeTargetWeeklySets(20.5, 5)).toBeNull();
        });

        it("volumeLevel fuera de [1, 10] o no entero", () => {
            expect(computeTargetWeeklySets(20, 0)).toBeNull();
            expect(computeTargetWeeklySets(20, 11)).toBeNull();
            expect(computeTargetWeeklySets(20, 5.5)).toBeNull();
        });
    });
});
