/**
 * E2E Edge: Error de red / servidor
 *
 * Flujo: Interceptar API con 500 → navegar a lista que la usa → mensaje de error visible.
 * Assertions: UI muestra error (Alert/Banner) o texto "Error al cargar" / "intenta de nuevo".
 * No parchea: si la app no muestra error ante 500, es bug de app (documentar).
 *
 * Requisitos: backend no necesario para el request interceptado (mock 500).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";

test.describe("Edge — Network error", () => {
  test("when clients API returns 500, error message is visible", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    await page.route("**/api/v1/clients/with-metrics*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal Server Error" }),
      });
    });

    await navigateToClients(page);

    await expect(
      page.getByText(/error al cargar clientes|error desconocido|intenta de nuevo/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
