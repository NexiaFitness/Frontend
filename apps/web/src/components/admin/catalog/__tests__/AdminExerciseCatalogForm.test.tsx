/**
 * AdminExerciseCatalogForm.test.tsx — Ficha Admin: render, validación, 409, historial.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
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
} from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminExerciseCatalogForm } from "../AdminExerciseCatalogForm";
import { ADMIN_CATALOG_COPY } from "../adminCatalogPresentation";

describe("AdminExerciseCatalogForm", () => {
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

    it("carga ficha edit y abre historial vacío", async () => {
        server.use(getCatalogHistoryEmptyHandler);
        const user = userEvent.setup();

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        expect(await screen.findByText(/squat_back/i)).toBeInTheDocument();
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
