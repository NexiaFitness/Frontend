/**
 * AdminExerciseCatalogForm.test.tsx — Ficha Admin: render, validación, 409, historial.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import {
    clearRouterMocks,
    mockNavigate,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import {
    mockCatalogExercise,
    updateExerciseCatalogConflictHandler,
    getCatalogHistoryEmptyHandler,
    getExerciseCatalogInactiveHandler,
} from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminExerciseCatalogForm } from "../AdminExerciseCatalogForm";
import { ADMIN_CATALOG_COPY } from "../adminCatalogPresentation";
import {
    AXIAL_PENDING_CONFIRM,
    PENDING_REVIEW_HINT,
    RUBRIC_CONFIRM_HINT,
} from "../adminCatalogFieldOptions";

describe("AdminExerciseCatalogForm", { timeout: 45_000 }, () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        vi.clearAllMocks();
    });

    it("renderiza ficha create con secciones y primary Revisado y siguiente", async () => {
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);

        expect(await screen.findByTestId("admin-exercise-catalog-form")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: ADMIN_CATALOG_COPY.createTitle })).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.reviewedAndNext })
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: ADMIN_CATALOG_COPY.sectionDatos })).toBeInTheDocument();
    });

    it("muestra errores de validación al guardar vacío", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);

        await screen.findByTestId("admin-exercise-catalog-form");
        const nombre = screen.getByRole("textbox", { name: /^nombre$/i });
        await user.clear(nombre);
        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() => {
            expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
        });
    });

    it("alta nueva: carga axial, nivel y objetivo empiezan vacíos y son obligatorios", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);

        await screen.findByTestId("admin-exercise-catalog-form");
        expect(screen.getByText("Selecciona la carga axial")).toBeInTheDocument();
        expect(screen.getByText("Selecciona el nivel")).toBeInTheDocument();
        expect(screen.getByText("Selecciona el objetivo")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() => {
            expect(screen.getByText("La carga axial es obligatoria")).toBeInTheDocument();
        });
        expect(screen.getByText("El nivel es obligatorio")).toBeInTheDocument();
        expect(screen.getByText("El objetivo de entrenamiento es obligatorio")).toBeInTheDocument();
    });

    it("edición: muestra el objetivo guardado y no pide confirmar revisiones legacy", async () => {
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        expect(await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 })).toBeInTheDocument();
        expect(screen.getByText("Fuerza")).toBeInTheDocument();
        expect(screen.queryByLabelText("Confirmo la carga axial propuesta")).not.toBeInTheDocument();
    });

    it("carga ficha edit y abre historial vacío", async () => {
        server.use(getCatalogHistoryEmptyHandler);
        const user = userEvent.setup();

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        expect(
            await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 })
        ).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_COPY.reviewPending)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.history }));

        expect(await screen.findByTestId("admin-catalog-history-modal")).toBeInTheDocument();
        expect(await screen.findByText(ADMIN_CATALOG_COPY.historyEmpty)).toBeInTheDocument();
    });

    it("en 409 muestra modal solo-recargar y no navega", async () => {
        server.use(updateExerciseCatalogConflictHandler);
        const user = userEvent.setup();

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        const nombre = await screen.findByRole("textbox", { name: /^nombre$/i });
        expect(nombre).toHaveValue(mockCatalogExercise.nombre);
        await user.clear(nombre);
        await user.type(nombre, "Sentadilla modificada");

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        expect(await screen.findByTestId("admin-catalog-conflict-modal")).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_COPY.conflictTitle)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.conflictReload })
        ).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("marca Revisado y siguiente sin cola vuelve al listado", async () => {
        const user = userEvent.setup();
        sessionStorage.clear();

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        await screen.findByRole("textbox", { name: /^nombre$/i });
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.reviewedAndNext })
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog");
        });
    });

    it("desactiva el ejercicio tras confirmar y pasa a ofrecer Reactivar", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        await screen.findByRole("textbox", { name: /^nombre$/i });
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.deactivate })
        );

        const modal = await screen.findByTestId("admin-catalog-deactivate-modal");
        await user.click(
            within(modal).getByRole("button", { name: ADMIN_CATALOG_COPY.deactivateConfirm })
        );

        expect(
            await screen.findByRole("button", { name: ADMIN_CATALOG_COPY.reactivate })
        ).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_COPY.inactiveBadge)).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: ADMIN_CATALOG_COPY.deactivate })
        ).not.toBeInTheDocument();
    });

    it("ficha inactiva ofrece Reactivar con confirmación", async () => {
        server.use(getExerciseCatalogInactiveHandler);
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        await screen.findByRole("textbox", { name: /^nombre$/i });
        expect(screen.getByText(ADMIN_CATALOG_COPY.inactiveBadge)).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.reactivate })
        );
        expect(await screen.findByTestId("admin-catalog-reactivate-modal")).toBeInTheDocument();
        expect(
            screen.getByText(ADMIN_CATALOG_COPY.reactivateBody)
        ).toBeInTheDocument();
    });

    it("rúbrica: confirmar la carga axial la envía como reviewed sin cambiar el valor", async () => {
        const user = userEvent.setup();
        let saved: {
            core?: {
                axial_load?: string;
                nivel?: string;
                axial_load_review?: string | null;
                nivel_review?: string | null;
            };
        } | null = null;
        server.use(
            http.get("*/exercises/:id/catalog", () =>
                HttpResponse.json({
                    ...mockCatalogExercise,
                    id: 168,
                    nombre: "Remo Pendlay",
                    axial_load: "high",
                    nivel: "intermediate",
                    axial_load_review: "rubric",
                    nivel_review: "rubric",
                })
            ),
            http.put("*/exercises/:id/catalog", async ({ request }) => {
                saved = (await request.json()) as NonNullable<typeof saved>;
                return HttpResponse.json({
                    ...mockCatalogExercise,
                    id: 168,
                    nombre: "Remo Pendlay",
                    axial_load: "high",
                    nivel: "intermediate",
                    axial_load_review: "reviewed",
                    nivel_review: "rubric",
                    updated_at: "2026-09-24T13:00:00.000Z",
                });
            })
        );

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={168} />);

        expect(
            await screen.findByRole("checkbox", { name: AXIAL_PENDING_CONFIRM })
        ).toBeInTheDocument();
        expect(screen.getAllByText(RUBRIC_CONFIRM_HINT)).toHaveLength(2);
        expect(screen.queryByText(PENDING_REVIEW_HINT)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: AXIAL_PENDING_CONFIRM }));
        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() => {
            expect(saved?.core?.axial_load_review).toBe("reviewed");
        });
        expect(saved?.core?.axial_load).toBe("high");
        expect(saved?.core?.nivel).toBe("intermediate");
        expect(saved?.core?.nivel_review ?? null).toBeNull();
    });
});

describe("AdminExerciseCatalogForm loading/error", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
    });

    it("muestra error si falla GET catalog", async () => {
        server.use(
            http.get("*/exercises/:id/catalog", () =>
                HttpResponse.json({ detail: "not found" }, { status: 404 })
            )
        );

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={99} />);

        expect(
            await screen.findByText(/no se pudo cargar la ficha del catálogo/i)
        ).toBeInTheDocument();
    });
});
