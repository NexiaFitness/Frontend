import { describe, expect, it } from "vitest";
import type { AthleteEmomInterval } from "./buildAthleteRunSteps";
import {
    buildEmomFailureEntryDefaults,
    buildEmomOverridesFromFailures,
    buildEmomSavePayloads,
    formatEmomCompletionNotation,
    formatEmomIntervalLabel,
    isEmomCompletionValid,
    resizeEmomFailureEntries,
    resolveEmomSlotReps,
} from "./emomResult";

const SLOT = {
    stepKey: "s1",
    slotLabel: "V1",
    exerciseId: 1,
    exerciseName: "Bike",
    setLabel: "V1",
    plannedLabel: "10 reps",
    blockExerciseId: 10,
    inputMode: "reps_only" as const,
    defaultWeight: 0,
    defaultReps: 10,
    defaultRpe: null,
    loggedSets: 0,
};

function interval(minuteIndex: number, key: string): AthleteEmomInterval {
    return {
        intervalKey: key,
        minuteIndex,
        minuteTotal: 4,
        roundIndex: minuteIndex,
        roundTotal: 4,
        slots: [{ ...SLOT, stepKey: `${key}-s1` }],
    };
}

describe("emomResult", () => {
    it("formatEmomIntervalLabel — intervalo + duración", () => {
        expect(formatEmomIntervalLabel(60, 2, 4)).toBe("Intervalos 2 de 4 · 60 s");
        expect(formatEmomIntervalLabel(90, 1, 3)).toBe("Intervalos 1 de 3 · 90 s");
        expect(formatEmomIntervalLabel(null, 1, 1)).toBe("Intervalo 1 de 1");
    });

    it("resolveEmomSlotReps — prescrito o override", () => {
        const slot = { ...SLOT };
        expect(resolveEmomSlotReps(slot, true, {}, "i1")).toBe(10);
        expect(resolveEmomSlotReps(slot, false, { i1: { s1: 6 } }, "i1")).toBe(6);
        expect(resolveEmomSlotReps(slot, false, {}, "i1")).toBe(10);
    });

    it("formatEmomCompletionNotation — score por conteo de fallos", () => {
        const intervals = [interval(1, "i1"), interval(2, "i2"), interval(3, "i3"), interval(4, "i4")];
        expect(formatEmomCompletionNotation(intervals, true)).toBe("4/4");
        expect(formatEmomCompletionNotation(intervals, false, 2)).toBe("2/4");
    });

    it("buildEmomOverridesFromFailures — últimos N intervalos", () => {
        const intervals = [
            interval(1, "i1"),
            interval(2, "i2"),
            interval(3, "i3"),
            interval(4, "i4"),
        ];
        const templateSlots = intervals[0].slots;
        const overrides = buildEmomOverridesFromFailures({
            intervals,
            failedCount: 2,
            failureEntries: [{ "i1-s1": 7 }, { "i1-s1": 5 }],
            templateSlots,
        });
        expect(overrides.i1).toBeUndefined();
        expect(overrides.i2).toBeUndefined();
        expect(overrides.i3?.["i3-s1"]).toBe(7);
        expect(overrides.i4?.["i4-s1"]).toBe(5);
    });

    it("isEmomCompletionValid", () => {
        const intervals = [interval(1, "i1"), interval(2, "i2")];
        const templateSlots = intervals[0].slots;
        const entry = buildEmomFailureEntryDefaults(templateSlots);
        expect(
            isEmomCompletionValid({
                asPlanned: true,
                failedCount: 0,
                failureEntries: [],
                intervals,
                templateSlots,
            })
        ).toBe(true);
        expect(
            isEmomCompletionValid({
                asPlanned: false,
                failedCount: 1,
                failureEntries: [entry],
                intervals,
                templateSlots,
            })
        ).toBe(true);
    });

    it("resizeEmomFailureEntries", () => {
        const templateSlots = [{ ...SLOT }];
        expect(resizeEmomFailureEntries([], 2, templateSlots)).toHaveLength(2);
    });

    it("buildEmomSavePayloads — nota y reps en fallos", () => {
        const intervals = [interval(1, "i1"), interval(2, "i2")];
        const templateSlots = intervals[0].slots;
        const payloads = buildEmomSavePayloads({
            intervals,
            asPlanned: false,
            failedCount: 1,
            failureEntries: [{ "i1-s1": 6 }],
            templateSlots,
            roundRpe: 8,
        });

        expect(payloads).toHaveLength(2);
        expect(payloads[0]?.data.actual_reps).toBe("10");
        expect(payloads[0]?.data.notes).toBe("1/2");
        expect(payloads[1]?.data.actual_reps).toBe("6");
        expect(payloads[1]?.data.actual_effort_value).toBe(8);
    });
});
