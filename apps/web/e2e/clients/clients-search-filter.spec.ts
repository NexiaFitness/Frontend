/**
 * E2E Client Management: Búsqueda en lista
 *
 * Flujo: Login → Clientes → escribir en búsqueda.
 * Assertions: lista se filtra (o muestra "No se encontraron clientes" si no hay coincidencias).
 * La búsqueda es en tiempo real (frontend o backend según implementación).
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

    const searchInput = page.getByRole("textbox", { name: /buscar cliente/i });
    await searchInput.fill("E2E_NOMBRE_QUE_NO_EXISTE");

    // ClientList muestra "No se encontraron clientes con ese criterio" cuando hay búsqueda sin resultados
    await expect(
      page.getByText(/no se encontraron clientes con ese criterio/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
