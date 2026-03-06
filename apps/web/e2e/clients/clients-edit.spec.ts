/**
 * E2E Client Management: Editar cliente
 *
 * Flujo: Crear cliente → desde detalle "Editar Perfil" → cambiar nombre → Guardar cambios → ver detalle con nuevo nombre.
 * Assertions: cambio de nombre visible en detalle.
 * APIs: getClient, updateClient.
 * Dependencia: cliente recién creado en el mismo test (autocontenido).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Edit", () => {
  test("edit client name and see change in detail", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();

    // Navega a onboarding (la app solo bloquea si, tras cargar, el perfil está incompleto).
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/, {
      timeout: 15_000,
    });

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

    const newName = "E2E Edit " + Date.now();
    await page.getByPlaceholder(/ej: juan/i).fill(newName);
    // Sección con role="region" y nombre accesible (aria-labelledby) — locator semántico y accesible.
    await page
      .getByRole("region", { name: /información personal/i })
      .getByRole("button", { name: /guardar cambios/i })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+$/, {
      timeout: 15_000,
    });
    // Acotar al heading del detalle: el nombre aparece en breadcrumb y en h1; strict mode exige un único elemento
    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: newName })
    ).toBeVisible({ timeout: 10_000 });
  });
});
