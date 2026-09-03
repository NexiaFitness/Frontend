/**
 * phaseDraftFormBridge.test.ts
 */

import { describe, expect, it } from "vitest";

import type { PhaseDraft } from "@nexia/shared/types/quickProgramDraft";

import {
    mergeFormIntoPhaseDraft,
    periodBlockFormStateFromPhaseDraft,
} from "../phaseDraftFormBridge";

const basePhase: PhaseDraft = {
    localId: "p1",
    sortOrder: 0,
    weekCount: 3,
    startDate: "2026-01-06",
    endDate: "2026-01-25",
    qualities: [{ physical_quality_id: 1, percentage: 100 }],
    volumeLevel: 5,
    intensityLevel: 6,
    weeklyStructure: [
        {
            week_ordinal: 1,
            days: [
                {
                    day_of_week: 2,
                    patterns: [{ movement_pattern_id: 3 }],
                },
            ],
        },
    ],
    maxReachedStep: "patterns",
};

describe("phaseDraftFormBridge", () => {
    it("round-trips phase draft through form state", () => {
        const form = periodBlockFormStateFromPhaseDraft(basePhase);
        const merged = mergeFormIntoPhaseDraft(basePhase, form, "summary");
        expect(merged.volumeLevel).toBe(5);
        expect(merged.qualities).toEqual(basePhase.qualities);
        expect(merged.weeklyStructure[0].days[0].patterns[0].movement_pattern_id).toBe(3);
        expect(merged.maxReachedStep).toBe("summary");
    });

    it("clone isolates weeklyStructure references", () => {
        const form = periodBlockFormStateFromPhaseDraft(basePhase);
        form.weeklyStructure[0].days[0].patterns[0].movement_pattern_id = 99;
        expect(basePhase.weeklyStructure[0].days[0].patterns[0].movement_pattern_id).toBe(3);
    });
});
