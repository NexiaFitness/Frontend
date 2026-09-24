/**
 * AdminCatalogListPage.test.tsx — Listado Admin: progreso, filtros, cola y estados.
 *
 * Contexto: cubre los criterios §3.1 de 13_UX_ADMIN_CATALOGO.md sobre el
 * contrato `GET /api/v1/admin/catalog/exercises` (MSW).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearRouterMocks, mockNavigate, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import {
    listAdminCatalogEmptyHandler,
    listAdminCatalogErrorHandler,
} from "@/test-utils/mocks/handlers/adminCatalog";
import { getAdminCatalogQueue } from "@nexia/shared";
import { AdminCatalogListPage } from "../AdminCatalogListPage";
import { ADMIN_CATALOG_COPY } from "@/components/admin/catalog/adminCatalogPresentation";

describe("AdminCatalogListPage", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it("muestra progreso de revisión y las filas activas con su calidad", async () => {
        render(<AdminCatalogListPage />);

        expect(await screen.findByTestId("admin-catalog-row-11")).toBeInTheDocument();
        expect(
            screen.getByText(ADMIN_CATALOG_COPY.progressLabel(34, 107))
        ).toBeInTheDocument();
        // Tabla (>= md) y cards (< md) coexisten en el DOM; se alternan por CSS.
        expect(screen.getAllByText("Sentadilla trasera").length).toBeGreaterThan(0);
        expect(screen.getAllByText(/squat_back/).length).toBeGreaterThan(0);
        expect(screen.getAllByText("OK").length).toBeGreaterThan(0);
        // Sin «incluir inactivos» el backend no devuelve el ejercicio inactivo.
        expect(screen.queryByTestId("admin-catalog-row-97")).not.toBeInTheDocument();
    });

    it("el filtro «incluir inactivos» trae las filas inactivas con sus flags", async () => {
        const user = userEvent.setup();
        render(<AdminCatalogListPage />);

        await screen.findByTestId("admin-catalog-row-11");
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.filterIncludeInactive })
        );

        expect(await screen.findByTestId("admin-catalog-row-97")).toBeInTheDocument();
        expect(screen.getAllByText(ADMIN_CATALOG_COPY.inactiveBadge).length).toBeGreaterThan(0);
        expect(screen.getAllByText("Sin PM").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Prioridades PM").length).toBeGreaterThan(0);
    });

    it("al abrir una fila guarda la cola y navega a la ficha", async () => {
        const user = userEvent.setup();
        render(<AdminCatalogListPage />);

        await user.click(await screen.findByTestId("admin-catalog-row-11"));

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog/11");
        expect(getAdminCatalogQueue()).toEqual([11]);
    });

    it("navega a nuevo ejercicio e importación desde el header", async () => {
        const user = userEvent.setup();
        render(<AdminCatalogListPage />);

        await screen.findByTestId("admin-catalog-row-11");

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.listNew }));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog/new");

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.listImport }));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog/import");
    });

    it("estado vacío con filtros activos permite limpiarlos", async () => {
        server.use(listAdminCatalogEmptyHandler);
        const user = userEvent.setup();
        render(<AdminCatalogListPage />);

        expect(
            await screen.findByText(ADMIN_CATALOG_COPY.listEmptyTitle)
        ).toBeInTheDocument();

        const pendingFilter = screen.getByRole("button", {
            name: ADMIN_CATALOG_COPY.filterPending,
        });
        await user.click(pendingFilter);
        expect(pendingFilter).toHaveAttribute("aria-pressed", "true");

        await user.click(
            await screen.findByRole("button", { name: ADMIN_CATALOG_COPY.listClearFilters })
        );

        await waitFor(() => {
            expect(pendingFilter).toHaveAttribute("aria-pressed", "false");
        });
    });

    it("muestra alerta de error con reintento", async () => {
        server.use(listAdminCatalogErrorHandler);
        render(<AdminCatalogListPage />);

        expect(await screen.findByText(ADMIN_CATALOG_COPY.listError)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.retry })
        ).toBeInTheDocument();
    });
});
