import { describe, expect, it } from "vitest";
import type { PhaseDraft, QuickProgramDraft } from "../types/quickProgramDraft";
import {
    canMaterializeProgram,
    isPhaseDraftReady,
} from "./quickProgramReadiness";

function baseDraft(phases: PhaseDraft[]): QuickProgramDraft {
    const totalWeeks = phases.reduce((acc, p) => acc + p.weekCount, 0);
    return {
        programLocalId: "prog",
        planId: 526,
        programStartDate: phases[0]?.startDate ?? "2026-01-06",
        totalWeeks,
        phases,
        activePhaseId: phases[0]?.localId ?? "",
        createdAt: 1,
        clientRequestId: "550e8400-e29b-41d4-a716-446655440000",
    };
}

function readyPhase(overrides: Partial<PhaseDraft> = {}): PhaseDraft {
    return {
        localId: "phase-a",
        sortOrder: 0,
        weekCount: 3,
        startDate: "2026-01-06",
        endDate: "2026-01-25",
        qualities: [
            { physical_quality_id: 1, percentage: 50 },
            { physical_quality_id: 2, percentage: 50 },
        ],
        volumeLevel: 5,
        intensityLevel: 5,
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
        maxReachedStep: "summary",
        ...overrides,
    };
}

describe("isPhaseDraftReady", () => {
    it("returns true when checklist complete", () => {
        expect(isPhaseDraftReady(readyPhase())).toBe(true);
    });

    it("returns false when qualities incomplete", () => {
        expect(
            isPhaseDraftReady(
                readyPhase({
                    qualities: [{ physical_quality_id: 1, percentage: 60 }],
                }),
            ),
        ).toBe(false);
    });

    it("returns false when structure missing patterns on training day", () => {
        expect(
            isPhaseDraftReady(readyPhase({ weeklyStructure: [] }), {
                trainingDays: ["Tuesday"],
            }),
        ).toBe(false);
    });

    it("returns true for multi-week phase with only template week 1 configured", () => {
        expect(
            isPhaseDraftReady(
                readyPhase({
                    weekCount: 4,
                    endDate: "2026-02-01",
                    weeklyStructure: [
                        {
                            week_ordinal: 1,
                            days: [
                                {
                                    day_of_week: 2,
                                    patterns: [{ movement_pattern_id: 3 }],
                                },
                                {
                                    day_of_week: 4,
                                    patterns: [{ movement_pattern_id: 5 }],
                                },
                                {
                                    day_of_week: 6,
                                    patterns: [{ movement_pattern_id: 7 }],
                                },
                            ],
                        },
                    ],
                }),
                { trainingDays: ["Tuesday", "Thursday", "Saturday"] },
            ),
        ).toBe(true);
    });
});

describe("canMaterializeProgram", () => {
    it("returns true for single ready phase within plan", () => {
        const draft = baseDraft([readyPhase()]);
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [],
                planStartDate: "2026-01-01",
                planEndDate: "2026-12-31",
            }),
        ).toBe(true);
    });

    it("returns false when phase overlaps persisted block", () => {
        const draft = baseDraft([readyPhase()]);
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [
                    {
                        id: 42,
                        start_date: "2026-01-10",
                        end_date: "2026-01-20",
                    },
                ],
            }),
        ).toBe(false);
    });

    it("returns false when draft phases are not contiguous", () => {
        const draft = baseDraft([
            readyPhase({ localId: "p1", sortOrder: 0 }),
            readyPhase({
                localId: "p2",
                sortOrder: 1,
                startDate: "2026-02-01",
                endDate: "2026-02-21",
                weekCount: 3,
            }),
        ]);
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [],
            }),
        ).toBe(false);
    });

    it("returns false when totalWeeks mismatches sum of phase weekCount", () => {
        const draft = {
            ...baseDraft([readyPhase()]),
            totalWeeks: 99,
        };
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [],
            }),
        ).toBe(false);
    });

    it("returns false when load invalid", () => {
        const draft = baseDraft([
            readyPhase({ volumeLevel: 0, intensityLevel: 5 }),
        ]);
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [],
            }),
        ).toBe(false);
    });
});
