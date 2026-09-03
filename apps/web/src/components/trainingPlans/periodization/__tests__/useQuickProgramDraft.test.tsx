/**
 * useQuickProgramDraft.test.tsx
 */

import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { dayAfterLocal } from "@nexia/shared";
import { useQuickProgramDraft } from "../useQuickProgramDraft";

describe("useQuickProgramDraft", () => {
    it("creates draft with one phase and stable clientRequestId", () => {
        const { result } = renderHook(() =>
            useQuickProgramDraft({
                planId: 526,
                programStartDate: "2026-01-06",
                existingBlocks: [],
                planStartDate: "2026-01-01",
                planEndDate: "2026-12-31",
            }),
        );

        expect(result.current.draft.phases).toHaveLength(1);
        const reqId = result.current.clientRequestId;

        act(() => {
            result.current.addPhase();
        });

        expect(result.current.draft.phases).toHaveLength(2);
        expect(result.current.clientRequestId).toBe(reqId);
        expect(result.current.draft.phases[1].startDate).toBe(
            dayAfterLocal(result.current.draft.phases[0].endDate),
        );
    });

    it("copyStructureFromPrevious does not share mutable refs", () => {
        const { result } = renderHook(() =>
            useQuickProgramDraft({
                planId: 526,
                programStartDate: "2026-01-06",
                existingBlocks: [],
            }),
        );

        act(() => {
            result.current.replacePhase({
                ...result.current.activePhase,
                qualities: [
                    { physical_quality_id: 1, percentage: 50 },
                    { physical_quality_id: 2, percentage: 50 },
                ],
                weeklyStructure: [
                    {
                        week_ordinal: 1,
                        days: [
                            {
                                day_of_week: 2,
                                patterns: [{ movement_pattern_id: 7 }],
                            },
                        ],
                    },
                ],
            });
            result.current.addPhase();
        });

        const phase2Id = result.current.draft.phases[1].localId;

        act(() => {
            result.current.selectPhase(phase2Id);
            result.current.copyStructureFromPrevious(phase2Id);
        });

        const phase1 = result.current.draft.phases[0];
        const phase2 = result.current.draft.phases[1];
        expect(phase2.weeklyStructure[0]?.days[0]?.patterns[0]?.movement_pattern_id).toBe(7);

        phase2.weeklyStructure[0].days[0].patterns[0].movement_pattern_id = 999;
        expect(phase1.weeklyStructure[0].days[0].patterns[0].movement_pattern_id).toBe(7);
    });

    it("removePhase recalculates sort order", () => {
        const { result } = renderHook(() =>
            useQuickProgramDraft({
                planId: 526,
                programStartDate: "2026-01-06",
                existingBlocks: [],
            }),
        );

        act(() => {
            result.current.addPhase();
            result.current.addPhase();
        });

        const middleId = result.current.sortedPhases[1].localId;

        act(() => {
            result.current.removePhase(middleId);
        });

        expect(result.current.sortedPhases).toHaveLength(2);
        expect(result.current.sortedPhases.map((p) => p.sortOrder)).toEqual([0, 1]);
    });
});
