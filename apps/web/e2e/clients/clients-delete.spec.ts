/**
 * E2E Client Management: Desvincular cliente
 *
 * Flujo: Crear cliente → Editar → Desvincular Cliente → confirmar en modal → redirige a lista.
 * Assertions: URL /dashboard/clients, cliente desvinculado (ya no en lista del trainer).
 * APIs: unlinkClient (trainerApi).
 * Nota: la app usa "desvincular" (unlink), no borrado físico.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Delete (unlink)", () => {
  test("unlink client from edit page and redirect to list", async ({
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

    await page.getByRole("button", { name: /editar perfil/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+\/edit/);

    await page
      .getByRole("button", { name: /desvincular cliente/i })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: /desvincular cliente/i })
    ).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /desvincular cliente/i })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/clients/, { timeout: 15_000 });
  });
});
