import { describe, expect, it } from "vitest";
import {
    buildRunLoggerFieldTouchKey,
    isRunLoggerSlotConfirmValid,
    mergeRoundRpeWithDefaults,
    mergeSingleLoggerWithDefaults,
    mergeSlotLogWithDefaults,
    resolveApplicableSlotWeight,
    resolveInitialSlotWeight,
    runLoggerReferenceTokenForSlot,
    runLoggerSlotHydrationToken,
} from "./runLoggerHydrationPolicy";

describe("runLoggerHydrationPolicy (D-LOG-TOUCH-01)", () => {
    const slotKey = "g1-round-1-slot-a";
    const defaults = { weight: 41, reps: 12, rpe: 7 as number | null };

    it("R-LOG-01: touched weight ignores new reference", () => {
        const touched = new Set([
            buildRunLoggerFieldTouchKey("slot", slotKey, "weight"),
        ]);
        const result = mergeSlotLogWithDefaults({
            prev: { weight: 33, reps: 9 },
            defaults,
            touched,
            slotStepKey: slotKey,
            prescribedDefaultWeight: 0,
            prescribedDefaultReps: 12,
        });
        expect(result.weight).toBe(33);
        expect(result.reps).toBe(12);
    });

    it("R-LOG-02: untouched applies reference when defaults arrive", () => {
        const result = mergeSlotLogWithDefaults({
            prev: { weight: null, reps: 12 },
            defaults,
            touched: new Set(),
            slotStepKey: slotKey,
            prescribedDefaultWeight: 0,
            prescribedDefaultReps: 12,
        });
        expect(result.weight).toBe(41);
    });

    it("R-LOG-03: staggered ref on slot B does not reset touched slot A", () => {
        const touched = new Set([
            buildRunLoggerFieldTouchKey("slot", "slot-a", "weight"),
        ]);
        const a = mergeSlotLogWithDefaults({
            prev: { weight: 33, reps: 9 },
            defaults: { weight: 41, reps: 12, rpe: null },
            touched,
            slotStepKey: "slot-a",
            prescribedDefaultWeight: 0,
            prescribedDefaultReps: 12,
        });
        const b = mergeSlotLogWithDefaults({
            prev: { weight: null, reps: 12 },
            defaults: { weight: 45, reps: 12, rpe: null },
            touched,
            slotStepKey: "slot-b",
            prescribedDefaultWeight: 0,
            prescribedDefaultReps: 12,
        });
        expect(a.weight).toBe(33);
        expect(b.weight).toBe(45);
    });

    it("R-LOG-04: no zero over empty or prescription-only prev", () => {
        expect(
            resolveApplicableSlotWeight(
                { weight: 0, reps: 8, rpe: null },
                0,
                null
            )
        ).toBeNull();
        expect(
            resolveApplicableSlotWeight(
                { weight: 0, reps: 8, rpe: null },
                40,
                null
            )
        ).toBe(40);
        expect(
            resolveApplicableSlotWeight(
                { weight: 0, reps: 8, rpe: null },
                0,
                36
            )
        ).toBe(36);
    });

    it("R-LOG-05: round RPE touched is preserved", () => {
        const stepKey = "g1-round-2";
        const touched = new Set([
            buildRunLoggerFieldTouchKey("round", stepKey, "roundRpe"),
        ]);
        expect(
            mergeRoundRpeWithDefaults(8, 7, stepKey, touched)
        ).toBe(8);
        expect(
            mergeRoundRpeWithDefaults(null, 7, stepKey, new Set())
        ).toBe(7);
    });

    it("R-LOG-07: confirm ok con peso null y reps (fallback reps_only)", () => {
        expect(
            isRunLoggerSlotConfirmValid({ weight: null, reps: 10 })
        ).toBe(true);
        expect(
            isRunLoggerSlotConfirmValid({ weight: 40, reps: 10 })
        ).toBe(true);
    });

    it("initial weight uses prescription or null", () => {
        expect(resolveInitialSlotWeight(41)).toBe(41);
        expect(resolveInitialSlotWeight(0)).toBeNull();
    });

    it("reference token pending vs value", () => {
        expect(runLoggerReferenceTokenForSlot(null, null)).toBe("pending");
        expect(runLoggerReferenceTokenForSlot(41, null)).toBe("41");
    });

    it("slot hydration token includes RPE without weight", () => {
        expect(runLoggerSlotHydrationToken(null, null)).toBe("pw:pr");
        expect(
            runLoggerSlotHydrationToken(
                { rpe: 8, weight_kg: null } as Parameters<
                    typeof runLoggerSlotHydrationToken
                >[0],
                null
            )
        ).toBe("pw:8");
    });

    it("R-LOG-07 single: touched weight ignores late reference", () => {
        const stepKey = "block-single-1";
        const touched = new Set([
            buildRunLoggerFieldTouchKey("single", stepKey, "weight"),
        ]);
        const merged = mergeSingleLoggerWithDefaults({
            prev: { weight: 33, reps: 9, rpe: null },
            defaults: { weight: 41, reps: 12, rpe: 7 },
            touched,
            stepKey,
            prescribedDefaultWeight: 0,
            plannedWeight: null,
            seriesPosition: 1,
            seriesAutofillWeight: null,
            durationFallbackReps: 9,
            inputMode: "weight_reps",
            allowCarryPrevWeight: true,
        });
        expect(merged.weight).toBe(33);
        expect(merged.reps).toBe(12);
    });

    it("S1: peso vaciado (null) tocado no recupera prescripción 25", () => {
        const touched = new Set([
            buildRunLoggerFieldTouchKey("slot", slotKey, "weight"),
        ]);
        const result = mergeSlotLogWithDefaults({
            prev: { weight: null, reps: 10 },
            defaults: { weight: 41, reps: 12, rpe: null },
            touched,
            slotStepKey: slotKey,
            prescribedDefaultWeight: 25,
            prescribedDefaultReps: 10,
        });
        expect(result.weight).toBeNull();
    });

    it("S2: cambio de ejercicio no arrastra 80 kg sin carry", () => {
        const stepKey = "block-single-2";
        const merged = mergeSingleLoggerWithDefaults({
            prev: { weight: 80, reps: 8, rpe: null },
            defaults: { weight: 0, reps: 10, rpe: null },
            touched: new Set(),
            stepKey,
            prescribedDefaultWeight: 0,
            plannedWeight: null,
            seriesPosition: 1,
            seriesAutofillWeight: null,
            durationFallbackReps: 10,
            inputMode: "weight_reps",
            allowCarryPrevWeight: false,
        });
        expect(merged.weight).toBeNull();
    });

    it("S3/S4: reps_only válido sin peso", () => {
        expect(
            isRunLoggerSlotConfirmValid({ weight: null, reps: 8 }, "reps_only")
        ).toBe(true);
    });
});
