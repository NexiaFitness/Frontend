/**
 * BlockWeeksManageTemplateEdit.test.tsx — Edición de semana tipo en «Gestionar semanas» (APB-03).
 *
 * Contexto: el servidor (sync-recurring) propaga la semana tipo a las heredadas; el draft
 * debe hacer lo mismo para que la verificación post-guardado no falle, y una heredada
 * editada en el mismo guardado viaja como excepción (D-REP-4).
 * Notas: el editor se sustituye por un stub; su UI tiene tests propios. Aquí se prueba
 * el cableado superficie → persistencia → verificación.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type {
    WeeklyStructureOut,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

import { BlockWeeksManageSurface } from "../BlockWeeksManageSurface";

vi.mock("../PeriodizationWeeklyStructureEditor", () => ({
    PeriodizationWeeklyStructureEditor: (props: {
        value: WeeklyStructureWeekCreate[];
        onChange: (next: WeeklyStructureWeekCreate[]) => void;
    }) => {
        const withPatterns = (ordinal: number, ids: number[]) =>
            props.value.map((w) =>
                w.week_ordinal === ordinal
                    ? {
                          ...w,
                          days: [
                              {
                                  day_of_week: 1,
                                  patterns: ids.map((id) => ({
                                      movement_pattern_id: id,
                                      sub_pattern: null,
                                  })),
                              },
                          ],
                      }
                    : w,
            );
        return (
            <div>
                <button type="button" onClick={() => props.onChange(withPatterns(1, [1, 9]))}>
                    stub-edit-template
                </button>
                <button type="button" onClick={() => props.onChange(withPatterns(2, [5]))}>
                    stub-edit-week-2
                </button>
            </div>
        );
    },
}));

const BLOCK: PlanPeriodBlock = {
    id: 42,
    training_plan_id: 526,
    name: null,
    goal: null,
    start_date: "2026-09-21",
    end_date: "2026-10-04",
    volume_level: 5,
    intensity_level: 5,
    sort_order: null,
    qualities: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: true,
};

const week = (id: number, ordinal: number, ids: number[]) => ({
    id,
    week_ordinal: ordinal,
    label: null,
    days: [
        {
            day_of_week: 1,
            patterns: ids.map((p) => ({ movement_pattern_id: p, sub_pattern: null })),
        },
    ],
});

const INHERITED: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [week(47, 1, [1]), week(48, 2, [1])],
};

function renderSurface() {
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
}

async function save(user: ReturnType<typeof userEvent.setup>) {
    const saveBtn = screen.getByRole("button", { name: /Guardar semanas/i });
    await waitFor(() => expect(saveBtn).toBeEnabled());
    await user.click(saveBtn);
}

describe("BlockWeeksManageSurface — edición de semana tipo (APB-03)", () => {
    it("propaga a la heredada y el guardado se confirma contra el servidor", async () => {
        const user = userEvent.setup();
        let getPayload = INHERITED;
        let syncBody: Record<string, unknown> | null = null;

        server.use(
            http.get("*/training-plans/526/period-blocks/42/weekly-structure", () =>
                HttpResponse.json(getPayload),
            ),
            http.post(
                "*/training-plans/526/period-blocks/42/weekly-structure/sync-recurring",
                async ({ request }) => {
                    syncBody = (await request.json()) as Record<string, unknown>;
                    // Servidor real: propaga la semana tipo a la heredada.
                    getPayload = {
                        plan_period_block_id: 42,
                        weeks: [week(47, 1, [1, 9]), week(49, 2, [1, 9])],
                    };
                    return HttpResponse.json({
                        applied_week_ordinals: [2],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [],
                    });
                },
            ),
        );

        renderSurface();
        await user.click(await screen.findByText("stub-edit-template"));
        await save(user);

        await waitFor(() =>
            expect(screen.getByText(/Semanas guardadas correctamente/i)).toBeInTheDocument(),
        );
        expect(screen.queryByText(/El servidor no reflejó los cambios/i)).not.toBeInTheDocument();
        expect(syncBody).not.toBeNull();
        expect(syncBody!.personalized_week_updates).toBeUndefined();
    });

    it("heredada editada en el mismo guardado viaja como excepción y no se pisa", async () => {
        const user = userEvent.setup();
        let getPayload = INHERITED;
        let syncBody: {
            personalized_week_updates?: Array<{ week_ordinal: number }>;
        } | null = null;

        server.use(
            http.get("*/training-plans/526/period-blocks/42/weekly-structure", () =>
                HttpResponse.json(getPayload),
            ),
            http.post(
                "*/training-plans/526/period-blocks/42/weekly-structure/sync-recurring",
                async ({ request }) => {
                    syncBody = (await request.json()) as typeof syncBody;
                    getPayload = {
                        plan_period_block_id: 42,
                        weeks: [week(47, 1, [1, 9]), week(48, 2, [5])],
                    };
                    return HttpResponse.json({
                        applied_week_ordinals: [],
                        preserved_week_ordinals: [],
                        updated_personalized_ordinals: [2],
                    });
                },
            ),
        );

        renderSurface();
        await user.click(await screen.findByText("stub-edit-week-2"));
        await user.click(screen.getByText("stub-edit-template"));
        await save(user);

        await waitFor(() =>
            expect(screen.getByText(/Semanas guardadas correctamente/i)).toBeInTheDocument(),
        );
        expect(syncBody!.personalized_week_updates?.map((w) => w.week_ordinal)).toEqual([2]);
    });
});
