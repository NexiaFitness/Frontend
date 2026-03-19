/**
 * E2E Client Management: Tabs en detalle de cliente
 *
 * Flujo: Crear cliente → en detalle abrir tab "Progreso", "Resumen" o "Planificación".
 * Assertions: contenido del tab visible (heading o texto característico).
 * APIs: getClient, getClientProgress, etc.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Detail tabs", () => {
  test("detail page has tabs and switching shows content", async ({
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

    // Tabs: Resumen, Sesiones, Coherencia Diaria, Tests, Progreso, Planificación, Lesiones
    const nav = page.getByRole("navigation", { name: /tabs/i });
    await expect(nav.getByRole("button", { name: /resumen/i })).toBeVisible({ timeout: 5_000 });
    await expect(nav.getByRole("button", { name: /planificación/i })).toBeVisible({ timeout: 5_000 });

    // Tab Progreso
    await nav.getByRole("button", { name: /progreso/i }).click();
    await expect(
      page.getByText(/progreso|registro|métricas|historial/i)
    ).toBeVisible({ timeout: 10_000 });

    // Tab Planificación (cliente sin plan → estado vacío "Sin plan activo" + CTA "Crear plan")
    await nav.getByRole("button", { name: /planificación/i }).click();
    await expect(
      page.getByText(/sin plan activo/i)
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /crear plan/i })
    ).toBeVisible({ timeout: 5_000 });
  });
});
