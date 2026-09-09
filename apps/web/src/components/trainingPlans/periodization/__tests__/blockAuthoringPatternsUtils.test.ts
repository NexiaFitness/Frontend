/**
 * blockAuthoringPatternsUtils.test.ts — Propagación D-ST en wizard.
 */

import { describe, expect, it } from "vitest";

import {
    allActiveDaysHavePatterns,
    countConfiguredPatternDays,
    getPatternsForDayFromWeek1,
    togglePatternOnRecurringDay,
} from "../blockAuthoringPatternsUtils";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

const baseStructure: WeeklyStructureWeekCreate[] = [
    {
        week_ordinal: 1,
        label: null,
        days: [
            { day_of_week: 1, patterns: [] },
            { day_of_week: 3, patterns: [] },
        ],
    },
    {
        week_ordinal: 2,
        label: null,
        days: [
            { day_of_week: 1, patterns: [] },
            { day_of_week: 3, patterns: [] },
        ],
    },
];

describe("blockAuthoringPatternsUtils", () => {
    it("togglePatternOnRecurringDay propaga a semanas heredadas", () => {
        const next = togglePatternOnRecurringDay(baseStructure, 1, 5);
        expect(getPatternsForDayFromWeek1(next, 1)).toEqual([
            { movement_pattern_id: 5, sub_pattern: null },
        ]);
        const week2 = next.find((w) => w.week_ordinal === 2);
        expect(week2?.days.find((d) => d.day_of_week === 1)?.patterns).toEqual([
            { movement_pattern_id: 5, sub_pattern: null },
        ]);
        expect(week2?.days.find((d) => d.day_of_week === 3)?.patterns).toEqual([]);
    });

    it("togglePatternOnRecurringDay respeta semana personalizada", () => {
        const personalized: WeeklyStructureWeekCreate[] = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [{ movement_pattern_id: 2, sub_pattern: null }],
                    },
                ],
            },
            {
                week_ordinal: 2,
                label: null,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [{ movement_pattern_id: 9, sub_pattern: null }],
                    },
                ],
            },
        ];
        const next = togglePatternOnRecurringDay(personalized, 1, 5);
        const week2 = next.find((w) => w.week_ordinal === 2);
        expect(week2?.days[0].patterns).toEqual([
            { movement_pattern_id: 9, sub_pattern: null },
        ]);
        expect(getPatternsForDayFromWeek1(next, 1)).toEqual([
            { movement_pattern_id: 2, sub_pattern: null },
            { movement_pattern_id: 5, sub_pattern: null },
        ]);
    });

    it("allActiveDaysHavePatterns exige patrón en cada día activo", () => {
        const partial = togglePatternOnRecurringDay(baseStructure, 1, 3);
        expect(allActiveDaysHavePatterns(partial, [1, 3])).toBe(false);
        const complete = togglePatternOnRecurringDay(partial, 3, 7);
        expect(allActiveDaysHavePatterns(complete, [1, 3])).toBe(true);
        expect(countConfiguredPatternDays(complete, [1, 3])).toBe(2);
    });
});
