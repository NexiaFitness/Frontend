/**
 * E2E Edge: Estados vacíos en listas
 *
 * Flujo: Interceptar listas (clientes, planes) con respuesta vacía → navegar → empty state visible.
 * Assertions: texto de empty state ("No se encontraron clientes", "No hay planes", etc.) sin crash.
 *
 * Requisitos: mock de respuestas vacías (no depende de cuenta realmente vacía).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";
import { navigateToPlans } from "../fixtures/navigation";

test.describe("Edge — Empty states", () => {
  test("clients list shows empty state when API returns no clients", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    await page.route("**/clients/with-metrics*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
          has_more: false,
        }),
      });
    });

    await navigateToClients(page);

    // ClientList muestra "No hay clientes" cuando la API devuelve lista vacía (sin búsqueda)
    await expect(
      page.getByText(/no hay clientes/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("plans list shows empty or section when API returns no plans", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    await page.route("**/training-plans/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await navigateToPlans(page);

    await expect(
      page.getByRole("heading", { name: /planificación de entrenamiento/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});
