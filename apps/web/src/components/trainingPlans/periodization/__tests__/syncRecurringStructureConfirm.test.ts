/**
 * syncRecurringStructureConfirm.test.ts
 */

import { describe, expect, it } from "vitest";

import {
    buildSyncRecurringConfirmMessage,
    getSyncRecurringConfirmOrdinals,
} from "../syncRecurringStructureConfirm";

describe("syncRecurringStructureConfirm", () => {
    const baseline = [
        {
            week_ordinal: 1,
            label: null,
            days: [{ day_of_week: 1, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] }],
        },
        {
            week_ordinal: 2,
            label: null,
            days: [{ day_of_week: 1, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] }],
        },
        {
            week_ordinal: 3,
            label: null,
            days: [{ day_of_week: 5, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] }],
        },
    ];

    it("getSyncRecurringConfirmOrdinals returns empty when template unchanged", () => {
        expect(getSyncRecurringConfirmOrdinals(baseline, baseline)).toEqual([]);
    });

    it("getSyncRecurringConfirmOrdinals lists personalized weeks when template changes", () => {
        const draft = structuredClone(baseline);
        draft[0].days.push({ day_of_week: 6, patterns: [] });

        expect(getSyncRecurringConfirmOrdinals(draft, baseline)).toEqual([3]);
    });

    it("buildSyncRecurringConfirmMessage uses plain language", () => {
        expect(buildSyncRecurringConfirmMessage([4])).toContain("Semana 4");
        expect(buildSyncRecurringConfirmMessage([4])).not.toContain("heredada");
    });
});
