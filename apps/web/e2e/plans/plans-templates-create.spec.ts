/**
 * E2E Training Plans: Crear template de plan
 *
 * Flujo: Login → Planes → Crear template (o ir a /templates/create) → nombre + categoría → Crear Template →
 * redirige a lista y template visible en Biblioteca de Templates.
 * Assertions: URL /dashboard/training-plans, nombre del template visible en la página.
 * APIs: createTrainingPlanTemplate, getTrainingPlanTemplates.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";

const TEMPLATE_NAME = `E2E Template ${Date.now()}`;

test.describe("Plans — Templates create", () => {
  test("plans list → create template → form submit → template in list", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);

    await page.waitForURL(/\/dashboard\/training-plans/, { timeout: 10_000 });
    await expect(
      page.getByText(/planificación de entrenamiento|programas activos|biblioteca de templates/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const createTemplateBtn = page.getByRole("button", {
      name: /crear.*(template|plantilla|new template)/i,
    });
    await createTemplateBtn.click();
    await page.waitForURL(/\/dashboard\/training-plans\/templates\/create/, {
      timeout: 10_000,
    });

    await expect(
      page.getByRole("heading", { name: /crear template de plan de entrenamiento/i })
    ).toBeVisible({ timeout: 5_000 });

    await page.getByPlaceholder(/ej: template de fuerza/i).fill(TEMPLATE_NAME);
    // Categoría (goal): opciones en español en la UI (Fuerza, Resistencia, etc.).
    await page.getByRole("combobox").first().selectOption({ label: "Fuerza" });
    await page.getByRole("button", { name: /crear template$/i }).click();

    await page.waitForURL(/\/dashboard\/training-plans(?:\?|$)/, {
      timeout: 15_000,
    });
    await expect(
      page.getByText(TEMPLATE_NAME).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
