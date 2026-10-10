/**
 * ArchivedPeriodBlocksSection.test.tsx — «Bloques archivados» con «Reactivar» (D-BLQ-5).
 *
 * Contexto: R-20 (el modal dice que las planificadas borradas no vuelven) y R-21
 * (confirmación premium; 409 se muestra sin cerrar en falso) de
 * docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/08_SPEC_REGLAS_Y_CASOS_LIMITE.md.
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { ArchivedPeriodBlocksSection } from "../ArchivedPeriodBlocksSection";

const ARCHIVED: PlanPeriodBlock = {
    id: 42,
    training_plan_id: 10,
    name: "Fuerza base",
    goal: null,
    start_date: "2026-03-02",
    end_date: "2026-03-29",
    volume_level: 5,
    intensity_level: 5,
    sort_order: null,
    qualities: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: false,
};

function renderSection() {
    render(
        <TestProviders>
            <ArchivedPeriodBlocksSection planId={10} />
        </TestProviders>,
    );
}

describe("ArchivedPeriodBlocksSection", () => {
    it("sin archivados no renderiza nada", async () => {
        let calls = 0;
        server.use(
            http.get("*/training-plans/10/period-blocks/archived", () => {
                calls += 1;
                return HttpResponse.json([]);
            }),
        );
        renderSection();
        await waitFor(() => expect(calls).toBe(1));
        expect(screen.queryByTestId("archived-period-blocks")).not.toBeInTheDocument();
    });

    it("reactivar: el modal avisa de que las planificadas no vuelven y llama a reactivate", async () => {
        const user = userEvent.setup();
        let archived: PlanPeriodBlock[] = [ARCHIVED];
        let reactivateCalls = 0;
        server.use(
            http.get("*/training-plans/10/period-blocks/archived", () =>
                HttpResponse.json(archived),
            ),
            http.post("*/training-plans/10/period-blocks/42/reactivate", () => {
                reactivateCalls += 1;
                archived = [];
                return HttpResponse.json({ ...ARCHIVED, is_active: true });
            }),
        );

        renderSection();
        await user.click(
            await screen.findByRole("button", { name: "Reactivar Fuerza base" }),
        );

        const modal = await screen.findByTestId("reactivate-block-modal");
        expect(
            within(modal).getByText(/no se recuperan/i),
        ).toBeInTheDocument();
        await user.click(within(modal).getByRole("button", { name: "Reactivar bloque" }));

        await waitFor(() => expect(reactivateCalls).toBe(1));
        await waitFor(() =>
            expect(screen.queryByTestId("archived-period-blocks")).not.toBeInTheDocument(),
        );
    });

    it("409: muestra el motivo y el modal sigue abierto", async () => {
        const user = userEvent.setup();
        const overlap =
            "Las fechas de este bloque se solapan con «Fuerza máxima». Cambia o elimina ese bloque antes de reactivarlo.";
        server.use(
            http.get("*/training-plans/10/period-blocks/archived", () =>
                HttpResponse.json([ARCHIVED]),
            ),
            http.post("*/training-plans/10/period-blocks/42/reactivate", () =>
                HttpResponse.json({ detail: overlap }, { status: 409 }),
            ),
        );

        renderSection();
        await user.click(
            await screen.findByRole("button", { name: "Reactivar Fuerza base" }),
        );
        const modal = await screen.findByTestId("reactivate-block-modal");
        await user.click(within(modal).getByRole("button", { name: "Reactivar bloque" }));

        expect(await screen.findByText(overlap)).toBeInTheDocument();
        expect(screen.getByTestId("reactivate-block-modal")).toBeInTheDocument();
    });
});
