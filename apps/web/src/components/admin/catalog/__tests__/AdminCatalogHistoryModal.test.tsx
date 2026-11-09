/**
 * AdminCatalogHistoryModal.test.tsx — El historial de la ficha se lee como un admin.
 *
 * Contexto: QA_H8_P_2026-11-07. Con el contrato del servidor (MSW `getCatalogHistoryHandler`),
 * el diálogo pinta quién, qué campo y las frases; nunca una ruta interna, un id ni JSON. Sin
 * consultas a los catálogos de nombres: el servidor ya los resuelve.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { screen, within } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { getCatalogHistoryEmptyHandler, getCatalogHistoryHandler } from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminCatalogHistoryModal } from "../AdminCatalogHistoryModal";
import { ADMIN_CATALOG_COPY } from "../adminCatalogPresentation";

describe("AdminCatalogHistoryModal", () => {
    beforeEach(() => {
        setAuthenticatedUser(validAdminUser);
    });

    it("pinta cada cambio en frases, sin rutas internas ni JSON", async () => {
        server.use(getCatalogHistoryHandler);
        render(
            <AdminCatalogHistoryModal
                isOpen
                onClose={() => undefined}
                exercisePk={98}
                exerciseName="Bird dog"
            />
        );

        const entries = await screen.findAllByTestId("admin-catalog-history-entry");
        expect(entries).toHaveLength(2);
        const migration = within(entries[0]);
        expect(migration.getByText("Músculos")).toBeInTheDocument();
        expect(
            migration.getByText("Erectores espinales · Objetivo: prioridad 0 → 2")
        ).toBeInTheDocument();
        expect(entries[0]).toHaveTextContent("Ajuste automático del catálogo");
        expect(within(entries[1]).getByText("Bilateral → Unilateral")).toBeInTheDocument();
        const modal = screen.getByTestId("admin-catalog-history-modal");
        expect(modal.textContent).not.toMatch(/[{}[\]]|muscle_id|core\.|migration_h8p/);
    });

    it("sin entradas muestra el estado vacío", async () => {
        server.use(getCatalogHistoryEmptyHandler);
        render(
            <AdminCatalogHistoryModal isOpen onClose={() => undefined} exercisePk={1} />
        );
        expect(await screen.findByText(ADMIN_CATALOG_COPY.historyEmpty)).toBeInTheDocument();
    });
});
