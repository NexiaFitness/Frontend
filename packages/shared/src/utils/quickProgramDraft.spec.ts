import { describe, expect, it } from "vitest";
import type { PhaseDraft, QuickProgramDraft } from "../types/quickProgramDraft";
import {
    addPhaseToDraft,
    applyDerivedPhaseDates,
    copyStructureFromPreviousPhase,
    createQuickProgramDraft,
    detectDraftPhaseScheduleIssues,
    draftToMaterializePayload,
    removePhaseFromDraft,
    setPhaseWeekCountInDraft,
    updatePhaseInDraft,
} from "./quickProgramDraft";
import { dayAfterLocal, deriveBlockEndFromWeekCount } from "./quickProgramDates";
import { canMaterializeProgram } from "./quickProgramReadiness";

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

function twoPhaseContiguousDraft(): QuickProgramDraft {
    const phase1 = readyPhase({ localId: "p1", sortOrder: 0, weekCount: 3 });
    const phase2 = readyPhase({
        localId: "p2",
        sortOrder: 1,
        weekCount: 3,
        startDate: dayAfterLocal(phase1.endDate),
        endDate: deriveBlockEndFromWeekCount(dayAfterLocal(phase1.endDate), 3),
    });
    return applyDerivedPhaseDates({
        programLocalId: "prog",
        planId: 526,
        programStartDate: "2026-01-06",
        totalWeeks: 6,
        phases: [phase1, phase2],
        activePhaseId: "p1",
        createdAt: 1,
        clientRequestId: "550e8400-e29b-41d4-a716-446655440000",
    });
}

describe("quickProgramDraft operations", () => {
    it("clientRequestId stays stable across draft mutations", () => {
        let draft = createQuickProgramDraft(526, {
            programStartDate: "2026-01-06",
            clientRequestId: "stable-req-id",
        });
        const original = draft.clientRequestId;

        draft = addPhaseToDraft(draft);
        draft = setPhaseWeekCountInDraft(draft, draft.phases[0].localId, 5);
        draft = updatePhaseInDraft(draft, draft.phases[0].localId, {
            volumeLevel: 8,
        });

        expect(draft.clientRequestId).toBe(original);
        expect(draftToMaterializePayload(draft).client_request_id).toBe(original);
    });

    it("addPhase inserts contiguous phase inheriting weekCount", () => {
        const draft = createQuickProgramDraft(526, {
            programStartDate: "2026-01-06",
            defaultWeekCount: 3,
        });
        const withTwo = addPhaseToDraft(draft, {
            trainingDays: ["Monday", "Wednesday"],
        });
        expect(withTwo.phases).toHaveLength(2);
        expect(withTwo.phases[1].weekCount).toBe(3);
        expect(withTwo.totalWeeks).toBe(6);
        expect(withTwo.phases[1].startDate).toBe(
            dayAfterLocal(withTwo.phases[0].endDate),
        );
    });

    it("setPhaseWeekCount recalculates downstream phase dates", () => {
        const draft = twoPhaseContiguousDraft();
        const updated = setPhaseWeekCountInDraft(draft, "p1", 4);
        expect(updated.phases[0].endDate).toBe(
            deriveBlockEndFromWeekCount("2026-01-06", 4),
        );
        expect(updated.phases[1].startDate).toBe(
            dayAfterLocal(updated.phases[0].endDate),
        );
    });

    it("removePhaseFromDraft reindexes sortOrder and recalculates dates", () => {
        const draft = twoPhaseContiguousDraft();
        const withMiddle = addPhaseToDraft(draft);
        const middleId = withMiddle.phases[1].localId;
        const trimmed = removePhaseFromDraft(withMiddle, middleId);

        expect(trimmed.phases).toHaveLength(2);
        expect(trimmed.phases.map((p) => p.sortOrder)).toEqual([0, 1]);
        expect(trimmed.phases[1].startDate).toBe(
            dayAfterLocal(trimmed.phases[0].endDate),
        );
    });

    it("detectDraftPhaseScheduleIssues finds gap and overlap", () => {
        const gapDraft = twoPhaseContiguousDraft();
        const gapped = {
            ...gapDraft,
            phases: [
                gapDraft.phases[0],
                {
                    ...gapDraft.phases[1],
                    startDate: "2026-02-10",
                },
            ],
        };
        expect(
            detectDraftPhaseScheduleIssues(
                gapped.programStartDate,
                gapped.phases,
            ).some((i) => i.kind === "gap"),
        ).toBe(true);

        const overlapDraft = {
            ...gapDraft,
            phases: [
                gapDraft.phases[0],
                {
                    ...gapDraft.phases[1],
                    startDate: gapDraft.phases[0].startDate,
                },
            ],
        };
        expect(
            detectDraftPhaseScheduleIssues(
                overlapDraft.programStartDate,
                overlapDraft.phases,
            ).some((i) => i.kind === "overlap"),
        ).toBe(true);
    });

    it("copyStructureFromPrevious deep-clones week1 (mutation isolated)", () => {
        const phase1 = readyPhase({
            localId: "p1",
            sortOrder: 0,
            weeklyStructure: [
                {
                    week_ordinal: 1,
                    days: [
                        {
                            day_of_week: 2,
                            patterns: [{ movement_pattern_id: 9 }],
                        },
                    ],
                },
            ],
        });
        const phase2 = readyPhase({
            localId: "p2",
            sortOrder: 1,
            startDate: "2026-01-26",
            endDate: "2026-02-15",
            weeklyStructure: [],
        });

        const draft: QuickProgramDraft = applyDerivedPhaseDates({
            programLocalId: "prog",
            planId: 526,
            programStartDate: "2026-01-06",
            totalWeeks: 6,
            phases: [phase1, phase2],
            activePhaseId: "p2",
            createdAt: 1,
            clientRequestId: "req-1",
        });

        const copied = copyStructureFromPreviousPhase(draft, "p2");
        copied.phases[1].weeklyStructure[0].days[0].patterns[0].movement_pattern_id = 999;

        expect(
            draft.phases[1].weeklyStructure[0]?.days[0]?.patterns[0]
                ?.movement_pattern_id,
        ).toBeUndefined();
        expect(
            draft.phases[0].weeklyStructure[0].days[0].patterns[0]
                .movement_pattern_id,
        ).toBe(9);
    });

    it("draftToMaterializePayload matches O9 shape (snake_case, no local ids)", () => {
        const draft = twoPhaseContiguousDraft();
        const payload = draftToMaterializePayload(draft);

        expect(payload.client_request_id).toBe(draft.clientRequestId);
        expect(payload.program_start_date).toBe("2026-01-06");
        expect(payload.phases).toHaveLength(2);
        expect(payload.phases[0].sort_order).toBe(0);
        expect(payload.phases[1].sort_order).toBe(1);
        expect(payload.phases[0].apply_template_to_remaining_weeks).toBe(true);
        expect(payload.phases[0].template_week?.week_ordinal).toBe(1);
        expect(payload.phases[0]).not.toHaveProperty("localId");
        expect(payload.phases[0]).not.toHaveProperty("blockId");
    });

    it("canMaterializeProgram true for two contiguous ready phases", () => {
        const draft = twoPhaseContiguousDraft();
        expect(
            canMaterializeProgram({
                draft,
                existingBlocks: [],
                planStartDate: "2026-01-01",
                planEndDate: "2026-12-31",
            }),
        ).toBe(true);
    });
});
