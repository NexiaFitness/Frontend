/**
 * E2E Training Plans: Eliminar plan
 *
 * Flujo: Crear plan en test → Ver Detalles → Eliminar Plan → confirmar en modal → redirige a lista o cliente.
 * Assertions: URL ya no es detalle del plan (lista o cliente).
 * APIs: createTrainingPlan, deleteTrainingPlan.
 * Dependencia: plan creado en el mismo test (autocontenido).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { createMinimalPlanData } from "../fixtures/test-data";

test.describe("Plans — Delete", () => {
  test("delete plan from detail and redirect", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);

    const createBtn = page
      .getByRole("button", { name: /nuevo programa|crear primer plan/i })
      .first();
    await createBtn.click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans\/create/);

    const data = createMinimalPlanData();
    await page.getByPlaceholder(/ej: programa de fuerza/i).fill(data.name);
    await page.getByLabel(/categoría/i).selectOption({ index: 1 });
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    await page
      .getByLabel(/fecha de inicio/i)
      .fill(start.toISOString().slice(0, 10));
    await page
      .getByLabel(/fecha de fin/i)
      .fill(end.toISOString().slice(0, 10));
    await page.getByRole("button", { name: /siguiente/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+/, {
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /eliminar plan/i }).click();
    await expect(
      page.getByRole("dialog").getByText(/estás seguro|eliminar el plan/i)
    ).toBeVisible({ timeout: 5_000 });
    await page.getByRole("dialog").getByRole("button", { name: /^eliminar plan$/i }).click();

    await expect(page).not.toHaveURL(/\/dashboard\/training-plans\/\d+$/);
    await expect(page).toHaveURL(/\/(dashboard\/training-plans|dashboard\/clients\/\d+)/, {
      timeout: 10_000,
    });
  });
});
