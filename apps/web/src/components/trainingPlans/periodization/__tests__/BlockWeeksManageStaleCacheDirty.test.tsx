/**
 * BlockWeeksManageStaleCacheDirty.test.tsx — Respuesta fresca no pisa draft local dirty.
 */

import type { PropsWithChildren } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Provider } from "react-redux";

import { server } from "@/test-utils/utils/msw";
import { createTestStore } from "@/test-utils/utils/store";
import { ToastProvider } from "@/components/ui/feedback";
import { weeklyStructureApi } from "@nexia/shared/api/weeklyStructureApi";
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

const PERSONALIZED_STRUCTURE: WeeklyStructureOut = {
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

/** Servidor cambia mientras el usuario tiene cambios locales sin guardar. */
const SERVER_DRIFT_STRUCTURE: WeeklyStructureOut = {
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
                        { movement_pattern_id: 99, sub_pattern: null },
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

describe("BlockWeeksManageSurface — dirty local + respuesta fresca", () => {
    it("no sobrescribe el draft local cuando llega una respuesta fresca del servidor", async () => {
        const user = userEvent.setup();
        let payload: WeeklyStructureOut = PERSONALIZED_STRUCTURE;

        server.use(
            http.get(STRUCTURE_URL, () => HttpResponse.json(payload)),
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => (
            <Provider store={store}>
                <ToastProvider>{children}</ToastProvider>
            </Provider>
        );

        render(
            <BlockWeeksManageSurface
                planId={526}
                block={BLOCK}
                patternsCatalog={[]}
                onExit={vi.fn()}
            />,
            { wrapper },
        );

        await screen.findByTestId("block-weeks-manage-surface");
        await waitFor(() => {
            expect(
                screen.getAllByText(/Restaurar semana tipo/i).length,
            ).toBeGreaterThan(0);
        });

        await user.click(screen.getAllByText(/Restaurar semana tipo/i)[0]!);

        await waitFor(() => {
            expect(
                screen.queryAllByText(/Restaurar semana tipo/i),
            ).toHaveLength(0);
        });

        payload = SERVER_DRIFT_STRUCTURE;
        await store.dispatch(
            weeklyStructureApi.endpoints.getWeeklyStructure.initiate(
                { planId: 526, blockId: 42 },
                { forceRefetch: true },
            ),
        );

        await waitFor(() => {
            expect(
                screen.queryAllByText(/Restaurar semana tipo/i),
            ).toHaveLength(0);
        });
    });
});
