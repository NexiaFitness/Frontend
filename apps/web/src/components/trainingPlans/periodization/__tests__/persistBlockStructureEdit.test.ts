/**
 * persistBlockStructureEdit.test.ts — Edit D-PAP: PUT template + apply-template.
 */

import { describe, expect, it, vi } from "vitest";

import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { persistBlockStructureEdit } from "../periodBlockPersistence";

const baseline = [
    {
        week_ordinal: 1,
        label: null,
        days: [
            {
                day_of_week: 1,
                patterns: [
                    { movement_pattern_id: 1, sub_pattern: null },
                    { movement_pattern_id: 2, sub_pattern: null },
                ],
            },
            {
                day_of_week: 2,
                patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
            },
            {
                day_of_week: 4,
                patterns: [{ movement_pattern_id: 5, sub_pattern: null }],
            },
        ],
    },
    {
        week_ordinal: 2,
        label: null,
        days: [
            {
                day_of_week: 1,
                patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
            },
            {
                day_of_week: 2,
                patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
            },
            {
                day_of_week: 4,
                patterns: [{ movement_pattern_id: 5, sub_pattern: null }],
            },
        ],
    },
];

describe("persistBlockStructureEdit", () => {
    const existingStructure: WeeklyStructureOut = {
        plan_period_block_id: 42,
        weeks: [
            { id: 47, ...baseline[0] },
            { id: 48, ...baseline[1] },
        ],
    };

    it("PUT semana tipo + apply-template cuando cambia patrón recurrente; no PUT S2 personalizada", async () => {
        const draft = structuredClone(baseline);
        draft[0].days[1].patterns.push({
            movement_pattern_id: 7,
            sub_pattern: null,
        });

        const updateWeek = vi.fn(({ weekId }: { weekId: number }) => ({
            unwrap: () =>
                Promise.resolve({
                    id: weekId,
                    week_ordinal: weekId === 47 ? 1 : 2,
                    label: null,
                    days: [],
                }),
        }));
        const createWeek = vi.fn();
        const applyTemplate = vi.fn(() => ({
            unwrap: () =>
                Promise.resolve({
                    applied_week_ordinals: [],
                    skipped_week_ordinals: [2],
                }),
        }));

        const saved = await persistBlockStructureEdit(
            526,
            42,
            "2026-09-22",
            "2026-09-28",
            draft,
            baseline,
            existingStructure,
            updateWeek,
            createWeek,
            applyTemplate,
        );

        expect(saved).toBe(true);
        expect(updateWeek).toHaveBeenCalledTimes(1);
        expect(updateWeek).toHaveBeenCalledWith(
            expect.objectContaining({
                weekId: 47,
                body: expect.objectContaining({
                    week_ordinal: 1,
                    days: expect.arrayContaining([
                        expect.objectContaining({
                            day_of_week: 2,
                            patterns: expect.arrayContaining([
                                { movement_pattern_id: 3, sub_pattern: null },
                                { movement_pattern_id: 7, sub_pattern: null },
                            ]),
                        }),
                    ]),
                }),
            }),
        );
        expect(applyTemplate).toHaveBeenCalledWith({
            planId: 526,
            blockId: 42,
            body: { source_week_ordinal: 1, respect_exceptions: true },
        });
        expect(createWeek).not.toHaveBeenCalled();
    });

    it("solo PUT semana tipo en bloque de una semana (sin apply-template)", async () => {
        const draft = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                    },
                ],
            },
        ];
        const singleBaseline = [
            {
                week_ordinal: 1,
                label: null,
                days: [{ day_of_week: 1, patterns: [] }],
            },
        ];
        const updateWeek = vi.fn(() => ({
            unwrap: () => Promise.resolve({ id: 5, week_ordinal: 1, label: null, days: [] }),
        }));
        const applyTemplate = vi.fn();

        const saved = await persistBlockStructureEdit(
            526,
            42,
            "2026-09-22",
            "2026-09-22",
            draft,
            singleBaseline,
            {
                plan_period_block_id: 42,
                weeks: [{ id: 5, ...singleBaseline[0] }],
            },
            updateWeek,
            vi.fn(),
            applyTemplate,
        );

        expect(saved).toBe(true);
        expect(updateWeek).toHaveBeenCalledTimes(1);
        expect(applyTemplate).not.toHaveBeenCalled();
    });

    it("PUT semana personalizada cuando cambia sin tocar semana tipo", async () => {
        const draft = structuredClone(baseline);
        draft[1].days[0].patterns.push({
            movement_pattern_id: 2,
            sub_pattern: null,
        });

        const updateWeek = vi.fn(({ weekId }: { weekId: number }) => ({
            unwrap: () =>
                Promise.resolve({ id: weekId, week_ordinal: 2, label: null, days: [] }),
        }));
        const applyTemplate = vi.fn();

        const saved = await persistBlockStructureEdit(
            526,
            42,
            "2026-09-22",
            "2026-09-28",
            draft,
            baseline,
            existingStructure,
            updateWeek,
            vi.fn(),
            applyTemplate,
        );

        expect(saved).toBe(true);
        expect(updateWeek).toHaveBeenCalledTimes(1);
        expect(updateWeek).toHaveBeenCalledWith(
            expect.objectContaining({ weekId: 48 }),
        );
        expect(applyTemplate).not.toHaveBeenCalled();
    });
});
