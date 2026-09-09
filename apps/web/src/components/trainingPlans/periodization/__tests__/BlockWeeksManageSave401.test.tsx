/**
 * BlockWeeksManageSave401.test.tsx — Un 401 al guardar no puede simular persistencia (D-ST / D-PRES).
 *
 * Contrato bajo prueba: si el PUT de una semana no es aceptado por el servidor,
 * "Guardar semanas" no puede terminar en éxito, ni adoptar el borrador como
 * baseline, ni limpiar el estado sucio, ni mostrar el toast de guardado.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureOut } from "@nexia/shared/types/weeklyStructure";

import { BlockWeeksManageSurface } from "../BlockWeeksManageSurface";

const STRUCTURE_URL =
    "*/training-plans/526/period-blocks/42/weekly-structure";

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

/** Semana 2 personalizada (patrón extra el lunes) respecto de la semana tipo. */
const PERSISTED_STRUCTURE: WeeklyStructureOut = {
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

describe("BlockWeeksManageSurface — 401 al guardar semanas", () => {
    it("no marca guardado cuando el servidor rechaza el PUT con 401", async () => {
        const user = userEvent.setup();
        let getCalls = 0;
        let putCalls = 0;

        server.use(
            http.get(STRUCTURE_URL, () => {
                getCalls += 1;
                return HttpResponse.json(PERSISTED_STRUCTURE);
            }),
            http.put(`${STRUCTURE_URL}/weeks/48`, () => {
                putCalls += 1;
                return HttpResponse.json(
                    { detail: "Not authenticated" },
                    { status: 401 },
                );
            }),
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

        const getCallsBeforeSave = getCalls;
        await user.click(saveBtn);

        // El intento de persistencia ocurre y el servidor lo rechaza.
        await waitFor(() => {
            expect(putCalls).toBe(1);
        });
        // El flujo de guardado termina (refetch posterior emitido).
        await waitFor(() => {
            expect(getCalls).toBeGreaterThan(getCallsBeforeSave);
        });

        // 1. Sin toast de éxito.
        expect(
            screen.queryByText(/Semanas guardadas correctamente/i),
        ).not.toBeInTheDocument();

        // 2. El estado sigue sucio: se puede reintentar el guardado.
        expect(
            screen.getByRole("button", { name: /Guardar semanas/i }),
        ).toBeEnabled();

        // 3. El baseline no adopta el borrador ni se descarta el trabajo local:
        //    la semana 2 restaurada sigue clasificada como heredada.
        expect(screen.queryAllByText(/Restaurar semana tipo/i)).toHaveLength(0);
    });

    /** Control: aísla el 401 como anomalía; un 5xx sí se propaga como error. */
    it("trata un 500 como error de guardado", async () => {
        const user = userEvent.setup();
        let putCalls = 0;

        server.use(
            http.get(STRUCTURE_URL, () => HttpResponse.json(PERSISTED_STRUCTURE)),
            http.put(`${STRUCTURE_URL}/weeks/48`, () => {
                putCalls += 1;
                return HttpResponse.json(
                    { detail: "Internal error" },
                    { status: 500 },
                );
            }),
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
            screen.getByRole("button", { name: /Guardar semanas/i }),
        ).toBeEnabled();
    });
});
