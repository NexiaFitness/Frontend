/**
 * E2E Client Management: Lista de clientes
 *
 * Flujo: Login → sidebar "Clientes" → listado.
 * Assertions: heading "Clientes"; contenido es tabla/grid o estado vacío (VISTA_CLIENTES_SPEC).
 * APIs: getClientsWithMetrics, getRecentActivity.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";

test.describe("Clients — List", () => {
  test("clients list shows heading and either table or empty state", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await expect(
      page.getByRole("heading", { name: /clientes/i })
    ).toBeVisible({ timeout: 10_000 });

    // Contenido: estado vacío ("Aún no tienes clientes registrados") o header con total
    await expect(
      page.getByText(/aún no tienes clientes registrados|total/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
