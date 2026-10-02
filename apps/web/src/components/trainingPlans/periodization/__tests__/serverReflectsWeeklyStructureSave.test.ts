/**
 * serverReflectsWeeklyStructureSave.test.ts — Verificación post-guardado D-PRES bootstrap.
 */

import { describe, expect, it } from "vitest";

import { serverReflectsWeeklyStructureSave } from "../periodBlockPersistence";

describe("serverReflectsWeeklyStructureSave", () => {
    const draft = [
        {
            week_ordinal: 1,
            label: null,
            days: [
                {
                    day_of_week: 6,
                    patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                },
            ],
        },
    ];

    it("baseline no vacío: exige igualdad total draft vs synced", () => {
        const synced = structuredClone(draft);
        expect(
            serverReflectsWeeklyStructureSave(synced, draft, false),
        ).toBe(true);

        const diverged = structuredClone(draft);
        diverged[0].days[0].patterns.push({
            movement_pattern_id: 2,
            sub_pattern: null,
        });
        expect(
            serverReflectsWeeklyStructureSave(diverged, draft, false),
        ).toBe(false);
    });

    it("baseline vacío (bootstrap): paridad solo en ordinales del draft", () => {
        const synced = [
            ...draft,
            {
                week_ordinal: 2,
                label: null,
                days: structuredClone(draft[0].days),
            },
        ];
        expect(
            serverReflectsWeeklyStructureSave(synced, draft, true),
        ).toBe(true);
    });

    it("baseline vacío: falla si el servidor no reflejó un ordinal del draft", () => {
        const syncedMissingWeek = [
            {
                week_ordinal: 2,
                label: null,
                days: structuredClone(draft[0].days),
            },
        ];
        expect(
            serverReflectsWeeklyStructureSave(syncedMissingWeek, draft, true),
        ).toBe(false);

        const syncedWrongPatterns = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    {
                        day_of_week: 6,
                        patterns: [],
                    },
                ],
            },
        ];
        expect(
            serverReflectsWeeklyStructureSave(syncedWrongPatterns, draft, true),
        ).toBe(false);
    });
});
