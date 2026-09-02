/**
 * useBlockAuthoringPersistence.test.ts — Persistencia create/edit D-PAP (F2).
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { useBlockAuthoringPersistence } from "../useBlockAuthoringPersistence";

const BASE_BLOCK: PlanPeriodBlock = {
    id: 42,
    training_plan_id: 10,
    name: null,
    goal: null,
    start_date: "2026-02-01",
    end_date: "2026-02-28",
    volume_level: 5,
    intensity_level: 5,
    sort_order: null,
    qualities: [
        {
            id: 1,
            physical_quality_id: 1,
            percentage: 100,
            physical_quality_name: "Fuerza",
            physical_quality_slug: "strength",
        },
    ],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: true,
};

function wrapper({ children }: { children: React.ReactNode }) {
    return <TestProviders>{children}</TestProviders>;
}

describe("useBlockAuthoringPersistence", () => {
    it("create llama POST with-recurring-structure y onCreateSuccess", async () => {
        const onCreateSuccess = vi.fn();
        const markPersisted = vi.fn();

        server.use(
            http.post(
                "*/training-plans/:planId/period-blocks/with-recurring-structure",
                async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>;
                    return HttpResponse.json(
                        {
                            block: {
                                ...BASE_BLOCK,
                                id: 99,
                                start_date: body.start_date,
                                end_date: body.end_date,
                            },
                            template_week_ordinal: 1,
                            applied_week_ordinals: [2],
                        },
                        { status: 201 },
                    );
                },
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "create",
                    blockId: null,
                    form: {
                        startDate: "2026-02-01",
                        endDate: "2026-02-28",
                        volumeLevel: 5,
                        intensityLevel: 6,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [
                            {
                                week_ordinal: 1,
                                label: null,
                                days: [{ day_of_week: 1, patterns: [] }],
                            },
                        ],
                    },
                    blocks: [],
                    existingStructure: undefined,
                    structureReady: false,
                    canPersist: true,
                    activeDayCount: 1,
                    markPersisted,
                    onCreateSuccess,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(onCreateSuccess).toHaveBeenCalled();
        });
        expect(markPersisted).toHaveBeenCalledWith(
            expect.objectContaining({ id: 99 }),
            expect.any(Array),
        );
    });

    it("edit actualiza bloque cuando cambian campos escalares", async () => {
        const markPersisted = vi.fn();

        server.use(
            http.put(
                "*/training-plans/:planId/period-blocks/:blockId",
                async ({ request }) => {
                    const body = (await request.json()) as Record<string, unknown>;
                    return HttpResponse.json(
                        {
                            ...BASE_BLOCK,
                            volume_level: body.volume_level,
                            intensity_level: body.intensity_level,
                        },
                        { status: 200 },
                    );
                },
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "edit",
                    blockId: 42,
                    form: {
                        startDate: "2026-02-01",
                        endDate: "2026-02-28",
                        volumeLevel: 7,
                        intensityLevel: 5,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [],
                    },
                    blocks: [BASE_BLOCK],
                    existingStructure: undefined,
                    structureReady: false,
                    canPersist: true,
                    activeDayCount: 0,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(markPersisted).toHaveBeenCalledWith(
                expect.objectContaining({ volume_level: 7 }),
                [],
            );
        });
    });

    it("edit persiste structure incremental cuando structureReady", async () => {
        const markPersisted = vi.fn();
        const existingStructure: WeeklyStructureOut = {
            plan_period_block_id: 42,
            weeks: [
                {
                    id: 5,
                    week_ordinal: 1,
                    label: null,
                    days: [{ day_of_week: 1, patterns: [] }],
                },
            ],
        };

        server.use(
            http.put(
                "*/training-plans/:planId/period-blocks/:blockId/weekly-structure/weeks/:weekId",
                () => HttpResponse.json({ id: 5, week_ordinal: 1, label: null, days: [] }, { status: 200 }),
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "edit",
                    blockId: 42,
                    form: {
                        startDate: "2026-02-01",
                        endDate: "2026-02-28",
                        volumeLevel: 5,
                        intensityLevel: 5,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [
                            {
                                week_ordinal: 1,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 1,
                                        patterns: [
                                            { movement_pattern_id: 3, sub_pattern: null },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    blocks: [BASE_BLOCK],
                    existingStructure,
                    structureReady: true,
                    canPersist: true,
                    activeDayCount: 1,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(markPersisted).toHaveBeenCalled();
        });
    });
});
