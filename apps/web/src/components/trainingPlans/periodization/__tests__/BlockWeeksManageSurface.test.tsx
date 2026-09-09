/**
 * BlockWeeksManageSurface.test.tsx — Restore + save persiste PUT (D-ST / D-PRES).
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { BlockWeeksManageSurface } from "../BlockWeeksManageSurface";

const BLOCK: PlanPeriodBlock = {
    id: 42,
    training_plan_id: 526,
    name: null,
    goal: null,
    start_date: "2026-09-22",
    end_date: "2026-09-28",
    volume_level: 5,
    intensity_level: 5,
    sort_order: null,
    qualities: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: true,
};

const INITIAL_STRUCTURE: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [
        {
            id: 47,
            week_ordinal: 1,
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
        {
            id: 48,
            week_ordinal: 2,
            label: null,
            days: [
                {
                    day_of_week: 1,
                    patterns: [
                        { movement_pattern_id: 1, sub_pattern: null },
                        { movement_pattern_id: 2, sub_pattern: null },
                    ],
                },
                {
                    day_of_week: 2,
                    patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
                },
            ],
        },
    ],
};

const RESTORED_STRUCTURE: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [
        INITIAL_STRUCTURE.weeks[0]!,
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
};

describe("BlockWeeksManageSurface", () => {
    it("restaurar semana 2 y guardar envía PUT con estructura de semana tipo", async () => {
        const user = userEvent.setup();
        let putBody: Record<string, unknown> | null = null;
        let getPayload: WeeklyStructureOut = INITIAL_STRUCTURE;

        server.use(
            http.get(
                "*/training-plans/526/period-blocks/42/weekly-structure",
                () => HttpResponse.json(getPayload),
            ),
            http.put(
                "*/training-plans/526/period-blocks/42/weekly-structure/weeks/48",
                async ({ request }) => {
                    putBody = (await request.json()) as Record<string, unknown>;
                    getPayload = RESTORED_STRUCTURE;
                    return HttpResponse.json({
                        id: 48,
                        week_ordinal: 2,
                        label: null,
                        days: putBody.days,
                    });
                },
            ),
        );

        render(
            <TestProviders>
                <BlockWeeksManageSurface
                    planId={526}
                    block={BLOCK}
                    patternsCatalog={[]}
                    onExit={vi.fn()}
                />
            </TestProviders>,
        );

        await screen.findByTestId("block-weeks-manage-surface");

        await waitFor(() => {
            expect(screen.getAllByText(/Restaurar semana tipo/i).length).toBeGreaterThan(0);
        });

        await user.click(screen.getAllByText(/Restaurar semana tipo/i)[0]!);

        const saveBtn = screen.getByRole("button", { name: /Guardar semanas/i });
        await waitFor(() => {
            expect(saveBtn).toBeEnabled();
        });

        await user.click(saveBtn);

        await waitFor(() => {
            expect(putBody).not.toBeNull();
        });

        const days = putBody!.days as Array<{
            day_of_week: number;
            patterns: Array<{ movement_pattern_id: number }>;
        }>;
        const day1 = days.find((d) => d.day_of_week === 1);
        expect(day1?.patterns.map((p) => p.movement_pattern_id)).toEqual([1]);

        await waitFor(() => {
            expect(
                screen.getByText(/Semanas guardadas correctamente/i),
            ).toBeInTheDocument();
        });
        expect(
            screen.getByRole("button", { name: /Guardar semanas/i }),
        ).toBeDisabled();
    });

    it("no marca guardado si el refetch no refleja el borrador enviado", async () => {
        const user = userEvent.setup();
        let putCalls = 0;

        server.use(
            http.get(
                "*/training-plans/526/period-blocks/42/weekly-structure",
                () => HttpResponse.json(INITIAL_STRUCTURE),
            ),
            http.put(
                "*/training-plans/526/period-blocks/42/weekly-structure/weeks/48",
                async () => {
                    putCalls += 1;
                    return HttpResponse.json({
                        id: 48,
                        week_ordinal: 2,
                        label: null,
                        days: [],
                    });
                },
            ),
        );

        render(
            <TestProviders>
                <BlockWeeksManageSurface
                    planId={526}
                    block={BLOCK}
                    patternsCatalog={[]}
                    onExit={vi.fn()}
                />
            </TestProviders>,
        );

        await screen.findByTestId("block-weeks-manage-surface");
        await waitFor(() => {
            expect(
                screen.getAllByText(/Restaurar semana tipo/i).length,
            ).toBeGreaterThan(0);
        });

        await user.click(screen.getAllByText(/Restaurar semana tipo/i)[0]!);

        const saveBtn = screen.getByRole("button", {
            name: /Guardar semanas/i,
        });
        await waitFor(() => {
            expect(saveBtn).toBeEnabled();
        });
        await user.click(saveBtn);

        await waitFor(() => {
            expect(putCalls).toBe(1);
        });

        expect(
            screen.queryByText(/Semanas guardadas correctamente/i),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(/El servidor no reflejó los cambios/i),
        ).toBeInTheDocument();
        expect(saveBtn).toBeEnabled();
        expect(screen.queryAllByText(/Restaurar semana tipo/i)).toHaveLength(0);
    });
});
