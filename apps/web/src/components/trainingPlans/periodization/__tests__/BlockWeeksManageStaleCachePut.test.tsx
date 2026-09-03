/**
 * BlockWeeksManageStaleCachePut.test.tsx — Caché RTK stale + baseline fresh → PUT (D-ST / D-PRES).
 */

import type { PropsWithChildren } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Provider } from "react-redux";

import { server } from "@/test-utils/utils/msw";
import { createTestStore } from "@/test-utils/utils/store";
import { ToastProvider } from "@/components/ui/feedback";
import { useGetWeeklyStructureQuery } from "@nexia/shared/api/weeklyStructureApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { BlockWeeksManageSurface } from "../BlockWeeksManageSurface";

const STRUCTURE_URL = "*/training-plans/526/period-blocks/42/weekly-structure";

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

const templateWeekDays = [
    {
        day_of_week: 1,
        patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
    },
    {
        day_of_week: 2,
        patterns: [{ movement_pattern_id: 3, sub_pattern: null }],
    },
];

const CACHED_STRUCTURE: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [
        { id: 47, week_ordinal: 1, label: null, days: templateWeekDays },
        { id: 48, week_ordinal: 2, label: null, days: templateWeekDays },
    ],
};

const FRESH_STRUCTURE: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [
        { id: 47, week_ordinal: 1, label: null, days: templateWeekDays },
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
        { id: 47, week_ordinal: 1, label: null, days: templateWeekDays },
        { id: 48, week_ordinal: 2, label: null, days: templateWeekDays },
    ],
};

const WeeklyStructureProbe = () => {
    const { data } = useGetWeeklyStructureQuery({ planId: 526, blockId: 42 });
    return <div data-testid="probe">{data ? "cached" : "loading"}</div>;
};

describe("BlockWeeksManageSurface — caché stale + restore + PUT", () => {
    it("emite PUT /weeks/48 aunque RTK cache coincida con draft restaurado", async () => {
        const user = userEvent.setup();
        let payload: WeeklyStructureOut = CACHED_STRUCTURE;
        let putCalls = 0;
        let putBody: Record<string, unknown> | null = null;

        server.use(
            http.get(STRUCTURE_URL, () => HttpResponse.json(payload)),
            http.put(`${STRUCTURE_URL}/weeks/48`, async ({ request }) => {
                putCalls += 1;
                putBody = (await request.json()) as Record<string, unknown>;
                payload = RESTORED_STRUCTURE;
                return HttpResponse.json({
                    id: 48,
                    week_ordinal: 2,
                    label: null,
                    days: putBody.days,
                });
            }),
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => (
            <Provider store={store}>
                <ToastProvider>{children}</ToastProvider>
            </Provider>
        );

        const { rerender } = render(<WeeklyStructureProbe />, { wrapper });
        await screen.findByText("cached");

        payload = FRESH_STRUCTURE;

        rerender(
            <BlockWeeksManageSurface
                planId={526}
                block={BLOCK}
                patternsCatalog={[]}
                onExit={vi.fn()}
            />,
        );

        await screen.findByTestId("block-weeks-manage-surface");
        await waitFor(() => {
            expect(
                screen.queryAllByText(/Restaurar semana tipo/i),
            ).toHaveLength(1);
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

        const days = putBody!.days as Array<{
            day_of_week: number;
            patterns: Array<{ movement_pattern_id: number }>;
        }>;
        const day1 = days.find((d) => d.day_of_week === 1);
        expect(day1?.patterns.map((p) => p.movement_pattern_id)).toEqual([1]);
    });
});
