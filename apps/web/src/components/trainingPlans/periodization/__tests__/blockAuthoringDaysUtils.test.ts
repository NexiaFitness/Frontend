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

    it("setActiveDaysOnWeek1 propagates day rule only to inherited weeks", () => {
        const baseline = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [] },
                    { day_of_week: 4, patterns: [] },
                    { day_of_week: 6, patterns: [] },
                ],
            },
            {
                week_ordinal: 2,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [] },
                    { day_of_week: 4, patterns: [] },
                    { day_of_week: 6, patterns: [] },
                ],
            },
            {
                week_ordinal: 3,
                label: null,
                days: [{ day_of_week: 5, patterns: [{ movement_pattern_id: 7, sub_pattern: null }] }],
            },
        ];
        const weeklyStructure = structuredClone(baseline);

        const next = setActiveDaysOnWeek1([1, 2, 4], weeklyStructure, baseline);

        expect(next.find((week) => week.week_ordinal === 1)?.days.map((d) => d.day_of_week)).toEqual(
            [1, 2, 4],
        );
        expect(next.find((week) => week.week_ordinal === 2)?.days.map((d) => d.day_of_week)).toEqual(
            [1, 2, 4],
        );
        expect(next.find((week) => week.week_ordinal === 3)).toEqual(baseline[2]);
    });
});
