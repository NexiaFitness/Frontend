/**
 * E2E Client Management: Lista de clientes
 *
 * Flujo: Login → sidebar "Clientes" → listado.
 * Assertions: heading "Clientes", tabla o estado vacío ("No se encontraron clientes").
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

    await expect(
      page.getByText(/no se encontraron clientes|gestiona y monitoriza/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
