/**
 * persistWeeklyStructureIncremental.test.ts — Diff baseline vs draft (D-PRES).
 */

import { describe, expect, it, vi } from "vitest";

import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { persistWeeklyStructureIncremental } from "../periodBlockPersistence";

describe("persistWeeklyStructureIncremental", () => {
    const existingStructure: WeeklyStructureOut = {
        plan_period_block_id: 42,
        weeks: [
            {
                id: 48,
                week_ordinal: 2,
                label: null,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [
                            { movement_pattern_id: 1, sub_pattern: null },
                            { movement_pattern_id: 2, sub_pattern: null },
                        ],
                    },
                ],
            },
        ],
    };

    it("PUT cuando draft difiere del baseline local aunque RTK coincida con draft", async () => {
        const updateWeek = vi.fn(() => ({
            unwrap: () =>
                Promise.resolve({
                    id: 48,
                    week_ordinal: 2,
                    label: null,
                    days: [],
                }),
        }));
        const createWeek = vi.fn();

        const saved = await persistWeeklyStructureIncremental(
            526,
            42,
            [
                {
                    week_ordinal: 2,
                    label: null,
                    days: [
                        {
                            day_of_week: 1,
                            patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                        },
                    ],
                },
            ],
            existingStructure,
            updateWeek,
            createWeek,
            [
                {
                    week_ordinal: 2,
                    label: null,
                    days: [
                        {
                            day_of_week: 1,
                            patterns: [
                                { movement_pattern_id: 1, sub_pattern: null },
                                { movement_pattern_id: 2, sub_pattern: null },
                            ],
                        },
                    ],
                },
            ],
        );

        expect(saved).toBe(true);
        expect(updateWeek).toHaveBeenCalledWith(
            expect.objectContaining({
                weekId: 48,
                body: expect.objectContaining({
                    week_ordinal: 2,
                    days: [
                        expect.objectContaining({
                            day_of_week: 1,
                            patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                        }),
                    ],
                }),
            }),
        );
        expect(createWeek).not.toHaveBeenCalled();
    });

    it("skip cuando draft igual al baseline aunque existing difiera (UI ya sincronizada)", async () => {
        const updateWeek = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
        const createWeek = vi.fn();
        const week = {
            week_ordinal: 2,
            label: null,
            days: [
                {
                    day_of_week: 1,
                    patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                },
            ],
        };

        const saved = await persistWeeklyStructureIncremental(
            526,
            42,
            [week],
            existingStructure,
            updateWeek,
            createWeek,
            [week],
        );

        expect(saved).toBe(false);
        expect(updateWeek).not.toHaveBeenCalled();
    });

    it("requireBaselineDiff: no escribe si baseline vacío con draft dirty", async () => {
        const updateWeek = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
        const createWeek = vi.fn();

        const saved = await persistWeeklyStructureIncremental(
            526,
            42,
            [
                {
                    week_ordinal: 2,
                    label: null,
                    days: [
                        {
                            day_of_week: 1,
                            patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                        },
                    ],
                },
            ],
            existingStructure,
            updateWeek,
            createWeek,
            [],
            { requireBaselineDiff: true },
        );

        expect(saved).toBe(false);
        expect(updateWeek).not.toHaveBeenCalled();
        expect(createWeek).not.toHaveBeenCalled();
    });
});
