/**
 * E2E User Journey: Weekly planning (login → plan detail → Planificación → baseline + override)
 *
 * Flujo completo: Login → Planes de entrenamiento → detalle de un plan (o crear uno) →
 * tab Planificación → crear baseline mensual (si no hay) → crear override semanal →
 * baseline y override visibles en la UI.
 *
 * Assertions: sección Baselines mensuales y Overrides semanales con contenido; week_id y cualidades visibles.
 * APIs: getTrainingPlans, getTrainingPlan, getMonthlyPlans, createMonthlyPlan, getWeeklyOverrides, createWeeklyOverride.
 *
 * Requisitos: backend con planning; cuenta demo; ensureOnPlanDetail crea plan si la lista está vacía.
 *
 * Si el test falla: documentar causa raíz (§3.5). Si es bug de app, corregir la app; no parchear el test.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Journey — Weekly planning", () => {
  test("login → plans → detail → Planificación tab → baseline + weekly override visible", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await expect(
      page.getByTestId("training-plan-detail")
    ).toBeVisible({ timeout: 15_000 });

    const nav = page.getByRole("navigation", { name: /tabs/i });
    await expect(nav).toBeVisible({ timeout: 5_000 });
    await nav.getByRole("button", { name: /planificación/i }).click();

    await expect(
      page.getByText(/nuevo baseline mensual|baselines mensuales|overrides semanales/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const overridesHeading = page.getByRole("heading", { name: /overrides semanales/i });
    const hasOverridesSection = await overridesHeading
      .waitFor({ state: "visible", timeout: 3_000 })
      .then(() => true)
      .catch(() => false);

    if (!hasOverridesSection) {
      const monthInput = page.getByLabel(/mes \(yyyy-mm\)/i);
      await monthInput.fill(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
      );
      const qualitiesInput = page.getByLabel(/cualidades/i).first();
      await qualitiesInput.fill("Fuerza: 50, Resistencia: 50");
      await page.getByRole("button", { name: /^crear$/i }).click();
      await expect(overridesHeading).toBeVisible({ timeout: 10_000 });
    }

    const weekId = `${new Date().getFullYear()}-02-W1`;
    await page.getByLabel(/week_id \(ej\./i).fill(weekId);
    await page.getByPlaceholder("Fuerza: 80").fill("Fuerza: 80");
    await page.getByRole("button", { name: /añadir override semanal/i }).click();

    await expect(
      page.getByText(/baselines mensuales/i).first()
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByText(new RegExp(weekId.replace(/-/g, "\\-"), "i")).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/fuerza:\s*80/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
