import { describe, expect, it } from "vitest";
import {
    applyAmrapPartialChange,
    buildAmrapSavePayloads,
    computeAmrapExerciseTotalReps,
    computeAmrapPartialTotal,
    formatAmrapResultSummary,
    formatAmrapScoreNotation,
    hasAmrapPartialProgress,
} from "./amrapResult";

const SLOTS = [
    { stepKey: "a", maxReps: 12 },
    { stepKey: "b", maxReps: 10 },
] as const;

describe("amrapResult", () => {
    it("computeAmrapExerciseTotalReps — rondas completas + parcial", () => {
        expect(computeAmrapExerciseTotalReps(5, 12, 0)).toBe(60);
        expect(computeAmrapExerciseTotalReps(5, 12, 12)).toBe(72);
        expect(computeAmrapExerciseTotalReps(5, 10, 7)).toBe(57);
    });

    it("formatAmrapScoreNotation y summary", () => {
        expect(formatAmrapScoreNotation(5, 19)).toBe("5+19");
        expect(formatAmrapScoreNotation(5, 0)).toBe("5");
        expect(formatAmrapResultSummary(5, 19)).toBe("5 rondas + 19 reps");
        expect(formatAmrapResultSummary(1, 0)).toBe("1 ronda completa");
    });

    it("applyAmrapPartialChange — secuencia ordenada", () => {
        let partial = { a: 0, b: 0 };

        partial = applyAmrapPartialChange(partial, SLOTS, "b", 7);
        expect(partial).toEqual({ a: 12, b: 7 });

        partial = applyAmrapPartialChange(partial, SLOTS, "a", 8);
        expect(partial).toEqual({ a: 8, b: 0 });

        partial = applyAmrapPartialChange(partial, SLOTS, "a", 12);
        expect(partial).toEqual({ a: 12, b: 0 });
    });

    it("hasAmrapPartialProgress", () => {
        expect(hasAmrapPartialProgress({ a: 0, b: 0 })).toBe(false);
        expect(hasAmrapPartialProgress({ a: 12, b: 0 })).toBe(true);
    });

    it("buildAmrapSavePayloads — reps totales y nota en líder", () => {
        const payloads = buildAmrapSavePayloads({
            fullRounds: 5,
            slots: [
                {
                    stepKey: "a",
                    blockExerciseId: 1,
                    plannedRepsPerRound: 12,
                    defaultWeight: 0,
                    loggedSets: 0,
                },
                {
                    stepKey: "b",
                    blockExerciseId: 2,
                    plannedRepsPerRound: 10,
                    defaultWeight: 0,
                    loggedSets: 0,
                },
            ],
            partialReps: { a: 12, b: 7 },
            roundRpe: 8,
            getNextActualSets: () => 1,
        });

        expect(payloads[0]?.data.actual_reps).toBe("72");
        expect(payloads[0]?.data.notes).toBe("5+19");
        expect(payloads[1]?.data.actual_reps).toBe("57");
        expect(payloads[1]?.data.notes).toBeUndefined();
        expect(computeAmrapPartialTotal([12, 7])).toBe(19);
    });
});
