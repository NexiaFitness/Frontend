/**
 * AdminCatalogReviewPage.test.tsx — Lista, filtros, una fila, bloque, 409 y vacío.
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearRouterMocks, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { AdminCatalogReviewPage } from "../AdminCatalogReviewPage";
import { ADMIN_CATALOG_REVIEW_COPY } from "@/components/admin/catalog/adminCatalogReviewPresentation";

const remo = {
    exercise_pk: 1,
    exercise_code: "remo",
    nombre: "Remo",
    is_active: true,
    review_status: "pending",
    quality_flags: ["OK"],
    axial_load: "low",
    axial_load_review: "rubric",
    nivel: "beginner",
    nivel_review: "reviewed",
    catalog_review_note: "La rúbrica empata en tirón.",
    axial_load_tiebreak: true,
    nivel_tiebreak: false,
    primary_pattern: "Tirón",
    equipment: ["Barra"],
    updated_at: "2026-11-04T10:00:00",
};

const press = {
    ...remo,
    exercise_pk: 2,
    exercise_code: "press",
    nombre: "Press",
    axial_load: "medium",
    axial_load_review: "pending_review",
    axial_load_tiebreak: false,
    catalog_review_note: null,
    primary_pattern: "Empuje",
    equipment: ["Mancuernas"],
    updated_at: "2026-11-04T11:00:00",
};

function listHandler() {
    return http.get("*/admin/catalog/exercises", ({ request }) => {
        const review = new URL(request.url).searchParams.get("review");
        const items = review === "pending" ? [press] : [remo, press];
        return HttpResponse.json({
            items,
            total: items.length,
            skip: 0,
            limit: 50,
            review_progress: { reviewed_count: 0, active_count: 2, queue_count: 2 },
        });
    });
}

describe("AdminCatalogReviewPage", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
    });

    it("lista las filas y filtra pendientes", async () => {
        server.use(listHandler());
        const user = userEvent.setup();
        render(<AdminCatalogReviewPage />);

        expect(await screen.findByText("Remo")).toBeInTheDocument();
        expect(screen.getByText("Tirón · Barra")).toBeInTheDocument();
        expect(screen.getByText("Carga: Rúbrica")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Pendientes" }));

        await waitFor(() => {
            expect(screen.queryByText("Remo")).not.toBeInTheDocument();
        });
        expect(screen.getByText("Press")).toBeInTheDocument();
        expect(screen.getByText("Carga: Pendiente")).toBeInTheDocument();
    });

    it("marca una fila con el valor cambiado en el desplegable", async () => {
        const posted = { body: null as unknown };
        server.use(
            listHandler(),
            http.post("*/admin/catalog/review", async ({ request }) => {
                posted.body = await request.json();
                return HttpResponse.json({ updated_count: 1 });
            })
        );
        const user = userEvent.setup();
        render(<AdminCatalogReviewPage />);
        await screen.findByText("Remo");

        const axialButtons = screen.getAllByRole("button", { name: "Carga axial" });
        await user.click(axialButtons[0]);
        await user.click(screen.getByRole("option", { name: "Alta" }));

        const reviewButtons = screen.getAllByRole("button", { name: ADMIN_CATALOG_REVIEW_COPY.reviewOne });
        await user.click(reviewButtons[0]);
        const dialog = await screen.findByTestId("catalog-review-confirm");
        expect(within(dialog).getByText("Remo")).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: "Marcar revisadas (1)" }));

        await waitFor(() => {
            expect(posted.body).toEqual({
                items: [
                    {
                        exercise_pk: 1,
                        axial_load: "high",
                        nivel: "beginner",
                        expected_updated_at: "2026-11-04T10:00:00",
                    },
                ],
            });
        });
    });

    it("marca en bloque las filas seleccionadas", async () => {
        const posted = { body: null as unknown };
        server.use(
            listHandler(),
            http.post("*/admin/catalog/review", async ({ request }) => {
                posted.body = await request.json();
                return HttpResponse.json({ updated_count: 2 });
            })
        );
        const user = userEvent.setup();
        render(<AdminCatalogReviewPage />);
        await screen.findByText("Remo");
        await user.click(screen.getByRole("checkbox", { name: "Seleccionar Remo" }));
        await user.click(screen.getByRole("checkbox", { name: "Seleccionar Press" }));
        await user.click(screen.getByRole("button", { name: "Marcar revisadas (2)" }));
        const dialog = screen.getByTestId("catalog-review-confirm");
        expect(within(dialog).getByText("Remo")).toBeInTheDocument();
        expect(within(dialog).getByText("Press")).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: "Marcar revisadas (2)" }));

        await waitFor(() => {
            expect(posted.body).toMatchObject({
                items: [{ exercise_pk: 1 }, { exercise_pk: 2 }],
            });
        });
    });

    it("un 409 nombra los ejercicios y vuelve a cargar", async () => {
        let loads = 0;
        server.use(
            http.get("*/admin/catalog/exercises", () => {
                loads += 1;
                return HttpResponse.json({
                    items: [remo],
                    total: 1,
                    skip: 0,
                    limit: 50,
                    review_progress: { reviewed_count: 0, active_count: 1, queue_count: 1 },
                });
            }),
            http.post("*/admin/catalog/review", () =>
                HttpResponse.json(
                    {
                        detail: {
                            code: "CONCURRENT_MODIFICATION",
                            conflicts: [{ exercise_pk: 1, nombre: "Remo", server_updated_at: null }],
                        },
                    },
                    { status: 409 }
                )
            )
        );
        const user = userEvent.setup();
        render(<AdminCatalogReviewPage />);
        await screen.findByText("Remo");
        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_REVIEW_COPY.reviewOne }));
        await user.click(screen.getByRole("button", { name: "Marcar revisadas (1)" }));

        expect(
            await screen.findByText(/Estos ejercicios cambiaron y no se aplicó ninguno: Remo/)
        ).toBeInTheDocument();
        expect(loads).toBeGreaterThan(1);
    });

    it("muestra el vacío", async () => {
        server.use(
            http.get("*/admin/catalog/exercises", () =>
                HttpResponse.json({
                    items: [],
                    total: 0,
                    skip: 0,
                    limit: 50,
                    review_progress: { reviewed_count: 0, active_count: 0, queue_count: 0 },
                })
            )
        );
        render(<AdminCatalogReviewPage />);
        expect(await screen.findByText(ADMIN_CATALOG_REVIEW_COPY.emptyTitle)).toBeInTheDocument();
    });

    it("muestra el motivo del desempate al tocar el chip", async () => {
        server.use(listHandler());
        const user = userEvent.setup();
        render(<AdminCatalogReviewPage />);
        await screen.findByText("Remo");
        expect(screen.queryByText("La rúbrica empata en tirón.")).not.toBeInTheDocument();
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_REVIEW_COPY.tiebreakChip, exact: true })
        );
        expect(screen.getByText("La rúbrica empata en tirón.")).toBeInTheDocument();
    });
});
