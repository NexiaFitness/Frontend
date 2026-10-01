import { describe, expect, it } from "vitest";
import type { AthleteForTimeRound } from "./buildAthleteRunSteps";
import {
    buildForTimeSavePayloads,
    buildForTimeSplitViews,
    clampForTimeTotalSeconds,
    combineForTimeMinSec,
    formatForTimeCompletionNote,
    formatForTimeDuration,
    formatForTimeRoundLabel,
    formatForTimeSegmentDelta,
    isForTimeCompletionValid,
    parseForTimeMmSs,
    splitForTimeTotalSeconds,
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

    it("formatForTimeCompletionNote — total sin splits", () => {
        expect(formatForTimeCompletionNote(754, [])).toBe("12:34");
        expect(formatForTimeCompletionNote(75, [75])).toBe("1:15");
        expect(formatForTimeCompletionNote(155, [75, 155])).toBe("2:35 (1:15 · 2:35)");
    });

    it("isForTimeCompletionValid — solo total > 0", () => {
        expect(isForTimeCompletionValid(754)).toBe(true);
        expect(isForTimeCompletionValid(0)).toBe(false);
        expect(isForTimeCompletionValid(-1)).toBe(false);
    });

    it("splitForTimeTotalSeconds y combineForTimeMinSec", () => {
        expect(splitForTimeTotalSeconds(754)).toEqual({ minutes: 12, seconds: 34 });
        expect(combineForTimeMinSec(12, 34)).toBe(754);
        expect(combineForTimeMinSec(0, 60)).toBeNull();
    });

    it("parseForTimeMmSs y clamp", () => {
        expect(parseForTimeMmSs("12:34")).toBe(754);
        expect(parseForTimeMmSs("bad")).toBe(null);
        expect(clampForTimeTotalSeconds(12.9)).toBe(12);
    });

    it("buildForTimeSavePayloads — 4 rondas, un total, sin splits", () => {
        const rounds = [round(1, 4), round(2, 4), round(3, 4), round(4, 4)];
        const payloads = buildForTimeSavePayloads({
            rounds,
            totalSeconds: 754,
            roundRpe: 7,
            getNextActualSets: () => 1,
        });

        expect(payloads).toHaveLength(4);
        expect(payloads[0]?.data.notes).toBe("12:34");
        expect(payloads[0]?.data.actual_duration).toBe(754);
        expect(payloads[0]?.data.notes).not.toContain("(");
        expect(payloads[3]?.data.actual_effort_value).toBe(7);
    });

    it("buildForTimeSavePayloads — duration y nota con splits legacy", () => {
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
    });
});
