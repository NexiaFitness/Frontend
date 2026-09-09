import { describe, expect, it } from "vitest";

import {
    buildPhaseReadinessChecklist,
    canActivatePhase,
    canPersistBlock,
    derivePhaseUxLabel,
} from "../phaseReadiness";

const baseInput = {
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    qualities: [{ physical_quality_id: 1, percentage: 100 }],
    volumeLevel: 5,
    intensityLevel: 5,
    weeklyStructure: [
        {
            week_ordinal: 1,
            label: null,
            days: [
                { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                { day_of_week: 4, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] },
                { day_of_week: 6, patterns: [{ movement_pattern_id: 3, sub_pattern: null }] },
            ],
        },
        {
            week_ordinal: 2,
            label: null,
            days: [
                { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                { day_of_week: 4, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] },
                { day_of_week: 6, patterns: [{ movement_pattern_id: 3, sub_pattern: null }] },
            ],
        },
    ],
    trainingDays: ["Tuesday", "Thursday", "Saturday"] as const,
};

describe("phaseReadiness", () => {
    it("derivePhaseUxLabel: borrador sin blockId o dirty", () => {
        expect(derivePhaseUxLabel({ ...baseInput, blockId: null })).toBe("borrador");
        expect(
            derivePhaseUxLabel({ ...baseInput, blockId: 1, isDirty: true }),
        ).toBe("borrador");
    });

    it("derivePhaseUxLabel: lista cuando completa y limpia", () => {
        expect(
            derivePhaseUxLabel({
                ...baseInput,
                blockId: 1,
                isDirty: false,
            }),
        ).toBe("lista");
    });

    it("canPersistBlock no exige estructura completa", () => {
        expect(
            canPersistBlock({
                ...baseInput,
                weeklyStructure: [],
            }),
        ).toBe(true);
    });

    it("canActivatePhase exige blockId, !dirty y estructura", () => {
        expect(canActivatePhase({ ...baseInput, blockId: 1, isDirty: false })).toBe(
            true,
        );
        expect(
            canActivatePhase({ ...baseInput, blockId: 1, isDirty: true }),
        ).toBe(false);
        expect(
            canActivatePhase({ ...baseInput, blockId: 1, weeklyStructure: [] }),
        ).toBe(false);
    });

    it("buildPhaseReadinessChecklist marca structureComplete", () => {
        const checklist = buildPhaseReadinessChecklist(baseInput);
        expect(checklist.datesValid).toBe(true);
        expect(checklist.qualitiesComplete).toBe(true);
        expect(checklist.structureComplete).toBe(true);
    });
});
