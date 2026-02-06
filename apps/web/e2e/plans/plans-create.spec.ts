/**
 * E2E Training Plans: Crear plan
 *
 * Flujo: Login → Planes → Crear (Nuevo Programa o Crear Primer Plan) → rellenar nombre, categoría, fechas → Siguiente → detalle con nombre.
 * Assertions: URL /dashboard/training-plans/:id, nombre del plan visible en heading.
 * APIs: createTrainingPlan, getTrainingPlan.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { createMinimalPlanData } from "../fixtures/test-data";

test.describe("Plans — Create", () => {
  test("can create a new plan and reach detail", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);

    // Ir a crear: botón "Nuevo Programa" (sección activos) o "Crear Primer Plan" si está vacío
    const createBtn = page
      .getByRole("button", { name: /nuevo programa|crear primer plan/i })
      .first();
    await createBtn.click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans\/create/);

    const data = createMinimalPlanData();
    await page
      .getByPlaceholder(/ej: programa de fuerza/i)
      .fill(data.name);
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
    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: data.name })
    ).toBeVisible({ timeout: 10_000 });
  });
});
