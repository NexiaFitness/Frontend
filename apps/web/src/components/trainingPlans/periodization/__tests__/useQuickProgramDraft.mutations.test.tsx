/**
 * useQuickProgramDraft.mutations.test.tsx — cero persistencia F2 durante QP local.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const createWithStructure = vi.fn();
const updateBlock = vi.fn();
const createWeek = vi.fn();
const applyTemplate = vi.fn();

vi.mock("@nexia/shared/api/periodBlocksApi", () => ({
    useCreatePeriodBlockWithStructureMutation: () => [
        createWithStructure,
        { isLoading: false },
    ],
    useUpdatePeriodBlockMutation: () => [updateBlock, { isLoading: false }],
    useCreatePeriodBlockMutation: () => [vi.fn(), { isLoading: false }],
    useDeletePeriodBlockMutation: () => [vi.fn(), { isLoading: false }],
    useGetPeriodBlocksQuery: () => ({ data: [] }),
    useGetPeriodBlockQuery: () => ({ data: undefined }),
}));

vi.mock("@nexia/shared/api/weeklyStructureApi", () => ({
    useCreateWeeklyStructureWeekMutation: () => [createWeek, { isLoading: false }],
    useUpdateWeeklyStructureWeekMutation: () => [vi.fn(), { isLoading: false }],
    useApplyWeeklyStructureTemplateMutation: () => [applyTemplate, { isLoading: false }],
    useGetWeeklyStructureQuery: () => ({ data: undefined }),
    weeklyStructureApi: { endpoints: { getWeeklyStructure: { initiate: vi.fn() } } },
}));

vi.mock("@nexia/shared/api/exercisesApi", () => ({
    useGetMovementPatternsQuery: () => ({
        data: [],
        isLoading: false,
        isError: false,
    }),
}));

import { useBlockAuthoringPersistence } from "../useBlockAuthoringPersistence";
import { TestProviders } from "@/test-utils/TestProviders";

function wrapper({ children }: { children: React.ReactNode }) {
    return <TestProviders>{children}</TestProviders>;
}

describe("Quick Program local persistence guard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("useBlockAuthoringPersistence enabled=false never calls mutations", async () => {
        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 526,
                    mode: "create",
                    blockId: null,
                    form: {
                        startDate: "2026-01-06",
                        endDate: "2026-01-25",
                        volumeLevel: 5,
                        intensityLevel: 5,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [],
                    },
                    blocks: [],
                    existingStructure: undefined,
                    structureBaseline: [],
                    structureReady: true,
                    isStructureDirty: false,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
                    markPersisted: vi.fn(),
                    onCreateSuccess: vi.fn(),
                    enabled: false,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        expect(createWithStructure).not.toHaveBeenCalled();
        expect(updateBlock).not.toHaveBeenCalled();
        expect(createWeek).not.toHaveBeenCalled();
        expect(applyTemplate).not.toHaveBeenCalled();
    });
});
