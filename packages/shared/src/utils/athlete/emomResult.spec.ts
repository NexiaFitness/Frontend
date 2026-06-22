import { describe, expect, it } from "vitest";
import type { AthleteEmomInterval } from "./buildAthleteRunSteps";
import {
    buildEmomSavePayloads,
    buildInitialEmomOverrides,
    formatEmomCompletionNotation,
    formatEmomMinuteLabel,
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
        minuteTotal: 2,
        roundIndex: minuteIndex,
        roundTotal: 2,
        slots: [{ ...SLOT, stepKey: `${key}-s1` }],
    };
}

describe("emomResult", () => {
    it("formatEmomMinuteLabel — minuto vs intervalo", () => {
        expect(formatEmomMinuteLabel(60, 2, 4)).toBe("Minutos 2 de 4");
        expect(formatEmomMinuteLabel(90, 1, 3)).toBe("Intervalos 1 de 3");
    });

    it("resolveEmomSlotReps — prescrito o override", () => {
        const slot = { ...SLOT };
        expect(resolveEmomSlotReps(slot, true, {}, "i1")).toBe(10);
        expect(
            resolveEmomSlotReps(slot, false, { i1: { s1: 6 } }, "i1")
        ).toBe(6);
    });

    it("formatEmomCompletionNotation", () => {
        const intervals = [interval(1, "i1"), interval(2, "i2")];
        expect(formatEmomCompletionNotation(intervals, true, {})).toBe("2/2");
        const overrides = buildInitialEmomOverrides(intervals);
        overrides.i2 = { "i2-s1": 0 };
        expect(formatEmomCompletionNotation(intervals, false, overrides)).toBe("1/2");
    });

    it("buildEmomSavePayloads — un log por intervalo y ejercicio", () => {
        const intervals = [interval(1, "i1"), interval(2, "i2")];
        const payloads = buildEmomSavePayloads({
            intervals,
            asPlanned: true,
            overrides: {},
            roundRpe: 8,
        });

        expect(payloads).toHaveLength(2);
        expect(payloads[0]?.data.actual_reps).toBe("10");
        expect(payloads[0]?.data.notes).toBe("2/2");
        expect(payloads[1]?.data.actual_effort_value).toBe(8);
    });
});
