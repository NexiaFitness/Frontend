/**
 * athleteLoggingUtils.spec.ts — FE-4 utilidades de logging atleta.
 */

import { describe, expect, it } from "vitest";
import {
    distributeAmrapPartialReps,
    formatAmrapIncompleteRoundBreakdown,
    resolveWeightIncrementStepKg,
    shouldCommitNumericDraftOnChange,
} from "./athleteLoggingUtils";

describe("resolveWeightIncrementStepKg", () => {
    it("usa 2.5 kg para cargas múltiplos de barra", () => {
        expect(resolveWeightIncrementStepKg({ currentKg: 80, plannedKg: 100 })).toBe(2.5);
    });

    it("usa 1 kg cuando el peso programado no encaja en 2.5", () => {
        expect(resolveWeightIncrementStepKg({ currentKg: 0, plannedKg: 14 })).toBe(1);
    });
});

describe("distributeAmrapPartialReps", () => {
    const slots = [
        { stepKey: "a", maxReps: 10, exerciseName: "sentadillas" },
        { stepKey: "b", maxReps: 5, exerciseName: "dominadas" },
    ];

    it("reparte en orden secuencial", () => {
        const { partialBySlot, suggestsExtraFullRound } = distributeAmrapPartialReps(
            slots,
            12
        );
        expect(partialBySlot).toEqual({ a: 10, b: 2 });
        expect(suggestsExtraFullRound).toBe(false);
    });

    it("marca E17 cuando el parcial cubre una ronda entera", () => {
        const { suggestsExtraFullRound } = distributeAmrapPartialReps(slots, 15);
        expect(suggestsExtraFullRound).toBe(true);
    });
});

describe("formatAmrapIncompleteRoundBreakdown", () => {
    it("formatea reparto legible", () => {
        const text = formatAmrapIncompleteRoundBreakdown(
            [
                { stepKey: "a", maxReps: 10, exerciseName: "sentadillas" },
                { stepKey: "b", maxReps: 5, exerciseName: "dominadas" },
            ],
            { a: 10, b: 2 }
        );
        expect(text).toBe("= 10 sentadillas + 2 dominadas");
    });
});

describe("shouldCommitNumericDraftOnChange", () => {
    it("confirma enteros completos", () => {
        expect(shouldCommitNumericDraftOnChange("12", false)).toBe(true);
        expect(shouldCommitNumericDraftOnChange("12a", false)).toBe(false);
    });

    it("confirma decimales completos y rechaza borrador con coma/punto final", () => {
        expect(shouldCommitNumericDraftOnChange("12.5", true)).toBe(true);
        expect(shouldCommitNumericDraftOnChange("12,5", true)).toBe(true);
        expect(shouldCommitNumericDraftOnChange("12.", true)).toBe(false);
        expect(shouldCommitNumericDraftOnChange("12,", true)).toBe(false);
    });
});
