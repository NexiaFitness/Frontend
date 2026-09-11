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
            evaluation_binding: null,
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
                    structureBaseline: [],
                    structureReady: false,
                    isStructureDirty: false,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
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
                    structureBaseline: [],
                    structureReady: false,
                    isStructureDirty: false,
                    canPersist: true,
                    activeDayCount: 0,
                    patternsComplete: false,
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
        const refetchWeeklyStructure = vi.fn().mockResolvedValue({
            data: {
                plan_period_block_id: 42,
                weeks: [
                    {
                        id: 5,
                        week_ordinal: 1,
                        label: null,
                        days: [
                            {
                                day_of_week: 1,
                                patterns: [
                                    {
                                        movement_pattern_id: 3,
                                        sub_pattern: null,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        });
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
            http.post(
                "*/training-plans/:planId/period-blocks/:blockId/weekly-structure/sync-recurring",
                () =>
                    HttpResponse.json({
                        applied_week_ordinals: [],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [],
                    }),
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "edit",
                    blockId: 42,
                    form: {
                        startDate: "2026-02-03",
                        endDate: "2026-02-08",
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
                    blocks: [
                        {
                            ...BASE_BLOCK,
                            start_date: "2026-02-03",
                            end_date: "2026-02-08",
                        },
                    ],
                    existingStructure,
                    structureBaseline: [
                        {
                            week_ordinal: 1,
                            label: null,
                            days: [{ day_of_week: 1, patterns: [] }],
                        },
                    ],
                    structureReady: true,
                    isStructureDirty: true,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                    refetchWeeklyStructure,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(markPersisted).toHaveBeenCalled();
        });
        expect(refetchWeeklyStructure).toHaveBeenCalled();
    });

    it("edit multi-semana: sync-recurring al cambiar patrones de semana tipo", async () => {
        const markPersisted = vi.fn();
        const refetchWeeklyStructure = vi.fn().mockResolvedValue({
            data: {
                plan_period_block_id: 42,
                weeks: [
                    {
                        id: 47,
                        week_ordinal: 1,
                        label: null,
                        days: [
                            {
                                day_of_week: 2,
                                patterns: [
                                    { movement_pattern_id: 3, sub_pattern: null },
                                    { movement_pattern_id: 7, sub_pattern: null },
                                ],
                            },
                        ],
                    },
                    {
                        id: 48,
                        week_ordinal: 2,
                        label: null,
                        days: [
                            {
                                day_of_week: 2,
                                patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                            },
                        ],
                    },
                ],
            },
        });
        const syncRecurringCalls: unknown[] = [];

        server.use(
            http.post(
                "*/training-plans/:planId/period-blocks/:blockId/weekly-structure/sync-recurring",
                async ({ request }) => {
                    syncRecurringCalls.push(await request.json());
                    return HttpResponse.json({
                        applied_week_ordinals: [2],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [],
                    });
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
                        startDate: "2026-09-22",
                        endDate: "2026-09-28",
                        volumeLevel: 5,
                        intensityLevel: 5,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [
                            {
                                week_ordinal: 1,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 2,
                                        patterns: [
                                            { movement_pattern_id: 3, sub_pattern: null },
                                            { movement_pattern_id: 7, sub_pattern: null },
                                        ],
                                    },
                                ],
                            },
                            {
                                week_ordinal: 2,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 2,
                                        patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                                    },
                                ],
                            },
                        ],
                    },
                    blocks: [
                        {
                            ...BASE_BLOCK,
                            start_date: "2026-09-22",
                            end_date: "2026-09-28",
                        },
                    ],
                    existingStructure: {
                        plan_period_block_id: 42,
                        weeks: [
                            {
                                id: 47,
                                week_ordinal: 1,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 2,
                                        patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                                    },
                                ],
                            },
                            {
                                id: 48,
                                week_ordinal: 2,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 1,
                                        patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                                    },
                                    {
                                        day_of_week: 2,
                                        patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                                    },
                                ],
                            },
                        ],
                    },
                    structureBaseline: [
                        {
                            week_ordinal: 1,
                            label: null,
                            days: [
                                {
                                    day_of_week: 2,
                                    patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                                },
                            ],
                        },
                        {
                            week_ordinal: 2,
                            label: null,
                            days: [
                                {
                                    day_of_week: 1,
                                    patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                                },
                                {
                                    day_of_week: 2,
                                    patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                                },
                            ],
                        },
                    ],
                    structureReady: true,
                    isStructureDirty: true,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                    refetchWeeklyStructure,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(markPersisted).toHaveBeenCalled();
        });
        expect(syncRecurringCalls).toHaveLength(1);
        expect(syncRecurringCalls[0]).toMatchObject({
            template_week: expect.objectContaining({ week_ordinal: 1 }),
        });
        expect(refetchWeeklyStructure).toHaveBeenCalled();
    });

    it("edit no marca persistido si refetch no refleja el draft de structure", async () => {
        const markPersisted = vi.fn();
        const refetchWeeklyStructure = vi.fn().mockResolvedValue({
            data: {
                plan_period_block_id: 42,
                weeks: [
                    {
                        id: 5,
                        week_ordinal: 1,
                        label: null,
                        days: [{ day_of_week: 1, patterns: [] }],
                    },
                ],
            },
        });
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
            http.post(
                "*/training-plans/:planId/period-blocks/:blockId/weekly-structure/sync-recurring",
                () =>
                    HttpResponse.json({
                        applied_week_ordinals: [],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [],
                    }),
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "edit",
                    blockId: 42,
                    form: {
                        startDate: "2026-02-03",
                        endDate: "2026-02-08",
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
                    blocks: [
                        {
                            ...BASE_BLOCK,
                            start_date: "2026-02-03",
                            end_date: "2026-02-08",
                        },
                    ],
                    existingStructure,
                    structureBaseline: [
                        {
                            week_ordinal: 1,
                            label: null,
                            days: [{ day_of_week: 1, patterns: [] }],
                        },
                    ],
                    structureReady: true,
                    isStructureDirty: true,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                    refetchWeeklyStructure,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        await waitFor(() => {
            expect(refetchWeeklyStructure).toHaveBeenCalled();
        });
        expect(markPersisted).not.toHaveBeenCalled();
    });

    it("edit no persiste solo campos de bloque si la estructura sigue dirty", async () => {
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
                        },
                        { status: 200 },
                    );
                },
            ),
            http.post(
                "*/training-plans/:planId/period-blocks/:blockId/weekly-structure/sync-recurring",
                () =>
                    HttpResponse.json({
                        applied_week_ordinals: [],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [],
                    }),
            ),
        );

        const { result } = renderHook(
            () =>
                useBlockAuthoringPersistence({
                    planId: 10,
                    mode: "edit",
                    blockId: 42,
                    form: {
                        startDate: "2026-02-03",
                        endDate: "2026-02-08",
                        volumeLevel: 7,
                        intensityLevel: 5,
                        qualities: [{ physical_quality_id: 1, percentage: 100 }],
                        weeklyStructure: [
                            {
                                week_ordinal: 1,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 2,
                                        patterns: [
                                            { movement_pattern_id: 3, sub_pattern: null },
                                            { movement_pattern_id: 7, sub_pattern: null },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    blocks: [BASE_BLOCK],
                    existingStructure: {
                        plan_period_block_id: 42,
                        weeks: [
                            {
                                id: 47,
                                week_ordinal: 1,
                                label: null,
                                days: [
                                    {
                                        day_of_week: 2,
                                        patterns: [
                                            { movement_pattern_id: 3, sub_pattern: null },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    structureBaseline: [
                        {
                            week_ordinal: 1,
                            label: null,
                            days: [
                                {
                                    day_of_week: 2,
                                    patterns: [
                                        { movement_pattern_id: 3, sub_pattern: null },
                                    ],
                                },
                            ],
                        },
                    ],
                    structureReady: true,
                    isStructureDirty: true,
                    canPersist: true,
                    activeDayCount: 1,
                    patternsComplete: true,
                    markPersisted,
                    onCreateSuccess: vi.fn(),
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.save();
        });

        expect(markPersisted).not.toHaveBeenCalled();
    });
});
