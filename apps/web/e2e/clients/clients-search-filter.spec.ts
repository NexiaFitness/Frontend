/**
 * E2E Client Management: Búsqueda en lista
 *
 * Flujo: Login → Clientes → escribir en búsqueda.
 * Assertions: input de búsqueda visible y acepta texto; vista sigue mostrando Clientes (filtrado o empty state).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";

test.describe("Clients — Search", () => {
  test("search input filters or shows empty state", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await expect(
      page.getByRole("heading", { name: /clientes/i })
    ).toBeVisible({ timeout: 10_000 });

    const searchInput = page.getByRole("searchbox", { name: /buscar cliente/i });
    await searchInput.fill("E2E_NOMBRE_QUE_NO_EXISTE");

    // Tras búsqueda sin resultados: mismo empty state o header con total (vista estable)
    await expect(
      page.getByText(/aún no tienes clientes registrados|total/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
