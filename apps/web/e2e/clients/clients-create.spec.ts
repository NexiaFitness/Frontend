/**
 * E2E Client Management: Crear cliente (onboarding wizard)
 *
 * Flujo: Login → Clientes → Agregar Nuevo Cliente → rellenar datos mínimos → Siguiente → Crear Perfil.
 * Assertions: URL /dashboard/clients/:id, nombre del cliente visible en detalle.
 * APIs: createClient.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Create", () => {
  test("can create a new client via onboarding and reach detail", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/);

    const data = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(data.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(data.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(data.mail);

    await page.getByRole("button", { name: /siguiente/i }).click();

    await expect(
      page.getByRole("button", { name: /crear perfil/i })
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, {
      timeout: 20_000,
    });
    // Error 4: acotar al heading del detalle (evita strict mode con breadcrumb/toast/email)
    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: data.nombre })
    ).toBeVisible({ timeout: 10_000 });
  });
});
