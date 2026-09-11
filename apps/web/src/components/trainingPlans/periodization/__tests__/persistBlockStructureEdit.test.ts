/**
 * persistBlockStructureEdit.test.ts — Edit D-PAP: sync-recurring atómico.
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

    it("sync-recurring cuando cambia semana tipo; no PUT directo de semana personalizada", async () => {
        const draft = structuredClone(baseline);
        draft[0].days[1].patterns.push({
            movement_pattern_id: 7,
            sub_pattern: null,
        });

        const updateWeek = vi.fn();
        const createWeek = vi.fn();
        const syncRecurring = vi.fn(() => ({
            unwrap: () =>
                Promise.resolve({
                    applied_week_ordinals: [],
                    preserved_week_ordinals: [2],
                    updated_personalized_ordinals: [],
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
            syncRecurring,
        );

        expect(saved).toBe(true);
        expect(syncRecurring).toHaveBeenCalledWith({
            planId: 526,
            blockId: 42,
            body: {
                template_week: draft[0],
                personalized_week_updates: undefined,
            },
        });
        expect(updateWeek).not.toHaveBeenCalled();
        expect(createWeek).not.toHaveBeenCalled();
    });

    it("sync-recurring en bloque de una semana al cambiar semana tipo", async () => {
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
        const syncRecurring = vi.fn(() => ({
            unwrap: () =>
                Promise.resolve({
                    applied_week_ordinals: [],
                    preserved_week_ordinals: [],
                    updated_personalized_ordinals: [],
                }),
        }));

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
            vi.fn(),
            vi.fn(),
            syncRecurring,
        );

        expect(saved).toBe(true);
        expect(syncRecurring).toHaveBeenCalledTimes(1);
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
        const syncRecurring = vi.fn();

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
            syncRecurring,
        );

        expect(saved).toBe(true);
        expect(updateWeek).toHaveBeenCalledTimes(1);
        expect(updateWeek).toHaveBeenCalledWith(
            expect.objectContaining({ weekId: 48 }),
        );
        expect(syncRecurring).not.toHaveBeenCalled();
    });
});
