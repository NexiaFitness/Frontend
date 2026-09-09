/**
 * BlockWeeksManageStaleCache.test.tsx — Siembra de draft/baseline con caché RTK obsoleta (D-ST / D-PRES).
 *
 * Contrato bajo prueba: al abrir "Ver semanas" con una entrada de caché previa,
 * el baseline efectivo debe ser la respuesta fresca del servidor, no el valor
 * cacheado que RTK Query entrega en el primer render.
 */

import type { PropsWithChildren } from "react";
import { render, screen, waitFor } from "@testing-library/react";
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

/** Estado cacheado: semana 2 idéntica a la semana tipo (heredada). */
const CACHED_STRUCTURE: WeeklyStructureOut = {
    plan_period_block_id: 42,
    weeks: [
        { id: 47, week_ordinal: 1, label: null, days: templateWeekDays },
        { id: 48, week_ordinal: 2, label: null, days: templateWeekDays },
    ],
};

/** Estado real en servidor: semana 2 personalizada (patrón extra el lunes). */
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

/** Consumidor previo de la misma query: deja la entrada en caché. */
const WeeklyStructureProbe = () => {
    const { data } = useGetWeeklyStructureQuery({ planId: 526, blockId: 42 });
    return <div data-testid="probe">{data ? "cached" : "loading"}</div>;
};

describe("BlockWeeksManageSurface — siembra con caché RTK obsoleta", () => {
    it("usa la respuesta fresca del servidor como baseline, no la caché previa", async () => {
        let getCalls = 0;
        let payload: WeeklyStructureOut = CACHED_STRUCTURE;

        server.use(
            http.get(STRUCTURE_URL, () => {
                getCalls += 1;
                return HttpResponse.json(payload);
            }),
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => (
            <Provider store={store}>
                <ToastProvider>{children}</ToastProvider>
            </Provider>
        );

        const { rerender } = render(<WeeklyStructureProbe />, { wrapper });

        // La caché queda poblada con el estado obsoleto.
        await screen.findByText("cached");
        expect(getCalls).toBe(1);

        // El servidor cambia: la semana 2 está personalizada.
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

        // refetchOnMountOrArgChange dispara la lectura fresca.
        await waitFor(() => {
            expect(getCalls).toBeGreaterThanOrEqual(2);
        });

        // El baseline efectivo debe reflejar el servidor: semana 2 personalizada,
        // por tanto con acción de restaurar disponible.
        await waitFor(() => {
            expect(
                screen.queryAllByText(/Restaurar semana tipo/i),
            ).toHaveLength(1);
        });
    });
});
