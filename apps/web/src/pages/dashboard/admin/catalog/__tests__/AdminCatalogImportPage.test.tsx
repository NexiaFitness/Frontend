/**
 * AdminCatalogImportPage.test.tsx — Wizard import/export: validar, bloquear, confirmar.
 *
 * Contexto: cubre §3.4 de 13_UX_ADMIN_CATALOGO.md sobre los contratos
 * `/admin/catalog/import/validate` y `/admin/catalog/import/confirm` (MSW).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearRouterMocks, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { validateCatalogImportBlockedHandler } from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminCatalogImportPage } from "../AdminCatalogImportPage";
import { ADMIN_CATALOG_COPY } from "@/components/admin/catalog/adminCatalogPresentation";

function xlsxFile(): File {
    return new File(["contenido"], "catalogo.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}

describe("AdminCatalogImportPage", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        vi.clearAllMocks();
    });

    it("sin archivo no permite validar", () => {
        render(<AdminCatalogImportPage />);

        expect(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.importValidateAction })
        ).toBeDisabled();
        expect(screen.queryByTestId("admin-catalog-import-summary")).not.toBeInTheDocument();
    });

    it("valida el archivo, muestra el resumen y confirma el import", async () => {
        const user = userEvent.setup();
        render(<AdminCatalogImportPage />);

        await user.upload(
            screen.getByLabelText(ADMIN_CATALOG_COPY.importFileLabel),
            xlsxFile()
        );
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.importValidateAction })
        );

        expect(await screen.findByTestId("admin-catalog-import-summary")).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_COPY.importSummaryNew)).toBeInTheDocument();
        expect(screen.getByText(/squat_back/)).toBeInTheDocument();

        const confirmButton = screen.getByRole("button", {
            name: ADMIN_CATALOG_COPY.importConfirmAction,
        });
        expect(confirmButton).toBeEnabled();
        await user.click(confirmButton);

        expect(
            await screen.findByText(ADMIN_CATALOG_COPY.importConfirmedBody(2))
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: ADMIN_CATALOG_COPY.importConfirmAction })
        ).not.toBeInTheDocument();
    });

    it("con violaciones no ofrece confirmar y lista el informe", async () => {
        server.use(validateCatalogImportBlockedHandler);
        const user = userEvent.setup();
        render(<AdminCatalogImportPage />);

        await user.upload(
            screen.getByLabelText(ADMIN_CATALOG_COPY.importFileLabel),
            xlsxFile()
        );
        await user.click(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.importValidateAction })
        );

        expect(
            await screen.findByTestId("admin-catalog-import-violations")
        ).toBeInTheDocument();
        expect(
            screen.getByText("El ejercicio no tiene prime mover")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: ADMIN_CATALOG_COPY.importConfirmAction })
        ).toBeDisabled();
    });
});
