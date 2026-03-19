/**
 * E2E Training Plans: Overrides semanales en tab Planificación
 *
 * Flujo: Login → Planes → detalle → tab Planificación → crear baseline mensual (si hace falta) →
 * crear override semanal (week_id, cualidades) → override listado en "Overrides semanales".
 * Assertions: sección Overrides semanales visible; tras Añadir, el week_id y cualidades visibles.
 * APIs: getTrainingPlan, getMonthlyPlans, createMonthlyPlan, getWeeklyOverrides, createWeeklyOverride.
 * Dependencias: 1 plan (ensureOnPlanDetail); baseline creado en test si no hay.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Overrides (weekly)", () => {
  test("plan detail → Planificación tab → create monthly baseline then weekly override and see it in list", async ({
    page,
  }) => {
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

    // Si no hay baselines, la sección "Overrides semanales" no aparece. Crear un baseline primero.
    const overridesSection = page.getByRole("heading", { name: /overrides semanales/i });
    const hasOverridesSection = await overridesSection
      .waitFor({ state: "visible", timeout: 3_000 })
      .then(() => true)
      .catch(() => false);

    if (!hasOverridesSection) {
      const monthInput = page.getByLabel(/mes \(yyyy-mm\)/i);
      await monthInput.fill(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
      );
      await page.locator("#planning-baseline-add").selectOption({ label: "Fuerza máxima" });
      await page.getByLabel(/fuerza máxima pct/i).fill("50");
      await page.locator("#planning-baseline-add").selectOption({ label: "Resistencia aeróbica" });
      await page.getByLabel(/resistencia aeróbica pct/i).fill("50");
      await page.getByRole("button", { name: /^crear$/i }).click();
      await expect(
        page.getByRole("heading", { name: /overrides semanales/i })
      ).toBeVisible({ timeout: 10_000 });
    }

    const weekId = `${new Date().getFullYear()}-02-W1`;
    await page.getByLabel(/week_id \(ej\./i).fill(weekId);
    // QualitiesEditor: añadir Fuerza máxima al 80% (último input si hay baseline con cualidades)
    await page.locator("#planning-weekly-add").selectOption({ label: "Fuerza máxima" });
    await page.getByLabel(/fuerza máxima pct/i).last().fill("80");

    await page.getByRole("button", { name: /añadir override semanal/i }).click();

    // Varios nodos pueden mostrar week_id/cualidades; acotamos al primero visible en la lista.
    await expect(
      page.getByText(new RegExp(weekId.replace("-", "\\-"), "i")).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/fuerza.*80|80%.*fuerza/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
