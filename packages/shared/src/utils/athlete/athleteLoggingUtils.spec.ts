/**
 * athleteLoggingUtils.spec.ts — FE-4 utilidades de logging atleta.
 */

import { describe, expect, it } from "vitest";
import {
    distributeAmrapPartialReps,
    formatAmrapIncompleteRoundBreakdown,
    createSeriesWeightAutofillStore,
    rememberSeriesWeightAutofill,
    resolveInheritedLogSheetWeight,
    resolveSeriesWeightAutofillKey,
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

describe("series weight autofill store", () => {
    it("rememberSeriesWeightAutofill + resolveInheritedLogSheetWeight", () => {
        const store = createSeriesWeightAutofillStore();
        const scope = {
            groupKind: "single_set",
            groupId: "g-1",
            exerciseId: 42,
            blockExerciseId: 100,
        };
        rememberSeriesWeightAutofill(store, scope, 60);
        expect(
            resolveInheritedLogSheetWeight({
                store,
                scope,
                setIndex: 2,
                skipped: false,
                draftWeight: 0,
            })
        ).toBe(60);
        expect(
            resolveInheritedLogSheetWeight({
                store,
                scope,
                setIndex: 1,
                skipped: false,
                draftWeight: 0,
            })
        ).toBe(0);
    });
});

describe("resolveSeriesWeightAutofillKey", () => {
    it("usa groupId+exerciseId en single_set (cada serie tiene distinto blockExerciseId)", () => {
        const scope = {
            groupKind: "single_set",
            groupId: "g-1",
            exerciseId: 42,
            blockExerciseId: 100,
        };
        expect(resolveSeriesWeightAutofillKey(scope)).toBe("single:g-1:42");
        expect(
            resolveSeriesWeightAutofillKey({ ...scope, blockExerciseId: 101 })
        ).toBe("single:g-1:42");
    });

    it("usa blockExerciseId en group_round / superset", () => {
        expect(
            resolveSeriesWeightAutofillKey({
                groupKind: "superset",
                groupId: "g-2",
                exerciseId: 7,
                blockExerciseId: 55,
            })
        ).toBe("block:55");
    });
});
