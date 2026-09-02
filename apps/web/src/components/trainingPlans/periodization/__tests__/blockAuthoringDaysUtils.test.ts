/**
 * blockAuthoringDaysUtils.test.ts
 */

import { describe, expect, it } from "vitest";

import {
    getActiveDaysFromWeek1,
    setActiveDaysOnWeek1,
    trainingDaysToIsoSet,
} from "../blockAuthoringDaysUtils";

describe("blockAuthoringDaysUtils", () => {
    it("trainingDaysToIsoSet maps English days to ISO 1-7", () => {
        expect(
            trainingDaysToIsoSet(["Monday", "Wednesday", "Friday"]),
        ).toEqual([1, 3, 5]);
    });

    it("setActiveDaysOnWeek1 preserves patterns for retained days", () => {
        const next = setActiveDaysOnWeek1([1, 3], [
            {
                week_ordinal: 1,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [{ movement_pattern_id: 9, sub_pattern: null }],
                    },
                    { day_of_week: 5, patterns: [] },
                ],
            },
        ]);
        expect(getActiveDaysFromWeek1(next)).toEqual([1, 3]);
        expect(next[0].days.find((d) => d.day_of_week === 1)?.patterns[0]
            .movement_pattern_id).toBe(9);
    });
});
