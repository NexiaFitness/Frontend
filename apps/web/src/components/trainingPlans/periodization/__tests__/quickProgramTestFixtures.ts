/**
 * quickProgramTestFixtures.ts — Borradores listos para tests QP (F3).
 */

import {
    applyDerivedPhaseDates,
    createQuickProgramDraft,
    dayAfterLocal,
    deriveBlockEndFromWeekCount,
    updatePhaseInDraft,
} from "@nexia/shared";
import type { PhaseDraft, QuickProgramDraft } from "@nexia/shared/types/quickProgramDraft";

export function readyPhase(overrides: Partial<PhaseDraft> = {}): PhaseDraft {
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

export function twoPhaseMaterializableDraft(): QuickProgramDraft {
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

export function singlePhaseMaterializableDraft(): QuickProgramDraft {
    let draft = createQuickProgramDraft(526, {
        programStartDate: "2026-01-06",
        defaultWeekCount: 3,
    });
    draft = updatePhaseInDraft(draft, draft.phases[0].localId, {
        qualities: readyPhase().qualities,
        volumeLevel: 5,
        intensityLevel: 5,
        weeklyStructure: readyPhase().weeklyStructure,
        maxReachedStep: "summary",
    });
    return applyDerivedPhaseDates(draft);
}
