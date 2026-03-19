/**
 * E2E Training Plans: Editar plan
 *
 * Flujo: Login → Planes → Ver Detalles del primer plan → Editar Plan → cambiar nombre → Guardar Cambios → detalle con nuevo nombre.
 * Assertions: URL detalle, heading con nombre actualizado.
 * APIs: getTrainingPlan, updateTrainingPlan.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Edit", () => {
  test("edit plan name and see change in detail", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await page.getByRole("button", { name: /editar plan/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+\/edit/);

    const newName = "E2E Plan Edit " + Date.now();
    await page.getByLabel(/nombre del programa|nombre/i).fill(newName);
    await page.getByRole("button", { name: /guardar cambios/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+$/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: newName })
    ).toBeVisible({ timeout: 10_000 });
  });
});
