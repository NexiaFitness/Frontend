import { describe, expect, it } from "vitest";
import type { AthleteForTimeRound } from "./buildAthleteRunSteps";
import {
    buildForTimeSavePayloads,
    buildForTimeSplitViews,
    formatForTimeCompletionNote,
    formatForTimeDuration,
    formatForTimeRoundLabel,
    formatForTimeSegmentDelta,
    isForTimeCompletionValid,
} from "./forTimeResult";

const SLOT = {
    stepKey: "s1",
    slotLabel: "1",
    exerciseId: 1,
    exerciseName: "Thruster",
    setLabel: "1",
    plannedLabel: "12 reps",
    blockExerciseId: 10,
    inputMode: "weight_reps" as const,
    defaultWeight: 40,
    defaultReps: 12,
    defaultRpe: null,
    loggedSets: 0,
};

function round(index: number, total: number): AthleteForTimeRound {
    return {
        roundKey: `r${index}`,
        roundIndex: index,
        roundTotal: total,
        slots: [{ ...SLOT, stepKey: `r${index}-s1`, blockExerciseId: 10 + index }],
    };
}

describe("forTimeResult", () => {
    it("formatForTimeDuration — mm:ss", () => {
        expect(formatForTimeDuration(0)).toBe("0:00");
        expect(formatForTimeDuration(75)).toBe("1:15");
        expect(formatForTimeDuration(370)).toBe("6:10");
    });

    it("formatForTimeRoundLabel", () => {
        expect(formatForTimeRoundLabel(1, 3)).toBe("Rondas 1 de 3");
        expect(formatForTimeRoundLabel(1, 1)).toBe("Ronda 1 de 1");
    });

    it("buildForTimeSplitViews — acumulado y segmento", () => {
        const views = buildForTimeSplitViews([75, 155]);
        expect(views).toEqual([
            { roundIndex: 1, cumulativeSeconds: 75, segmentSeconds: 75 },
            { roundIndex: 2, cumulativeSeconds: 155, segmentSeconds: 80 },
        ]);
        expect(formatForTimeSegmentDelta(80)).toBe("+1:20");
    });

    it("formatForTimeCompletionNote — total y splits", () => {
        expect(formatForTimeCompletionNote(75, [75])).toBe("1:15");
        expect(formatForTimeCompletionNote(155, [75, 155])).toBe("2:35 (1:15 · 2:35)");
    });

    it("isForTimeCompletionValid", () => {
        expect(isForTimeCompletionValid([75, 155], 2)).toBe(true);
        expect(isForTimeCompletionValid([75], 2)).toBe(false);
        expect(isForTimeCompletionValid([], 0)).toBe(false);
    });

    it("buildForTimeSavePayloads — duration y nota en primer log", () => {
        const rounds = [round(1, 2), round(2, 2)];
        const payloads = buildForTimeSavePayloads({
            rounds,
            cumulativeSplits: [75, 155],
            totalSeconds: 155,
            roundRpe: 8,
            getNextActualSets: () => 1,
        });

        expect(payloads).toHaveLength(2);
        expect(payloads[0]?.data.notes).toBe("2:35 (1:15 · 2:35)");
        expect(payloads[0]?.data.actual_duration).toBe(155);
        expect(payloads[1]?.data.notes).toBeUndefined();
        expect(payloads[1]?.data.actual_effort_value).toBe(8);
    });
});
