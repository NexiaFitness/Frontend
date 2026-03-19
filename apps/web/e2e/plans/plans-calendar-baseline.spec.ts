/**
 * E2E Training Plans: Crear baseline mensual en tab Planificación
 *
 * Flujo: Login → Planes → detalle de un plan → tab Planificación → rellenar mes y cualidades → Crear → baseline en lista.
 * Assertions: sección "Baselines mensuales" muestra el mes creado (o el texto de cualidades).
 * APIs: getTrainingPlan, getMonthlyPlans, createMonthlyPlan.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Calendar / Baseline", () => {
  test("plan detail → Planificación tab → create monthly baseline and see it in list", async ({
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

    // Varios nodos pueden mostrar este texto; acotamos al primero visible.
    await expect(
      page.getByText(/nuevo baseline mensual/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const monthInput = page.getByLabel(/mes \(yyyy-mm\)/i);
    await monthInput.fill(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    );

    // QualitiesEditor: añadir cualidades desde catálogo (Fuerza máxima 60%, Resistencia aeróbica 40%)
    await page.locator("#planning-baseline-add").selectOption({ label: "Fuerza máxima" });
    await page.getByLabel(/fuerza máxima pct/i).fill("60");
    await page.locator("#planning-baseline-add").selectOption({ label: "Resistencia aeróbica" });
    await page.getByLabel(/resistencia aeróbica pct/i).fill("40");

    await page.getByRole("button", { name: /^crear$/i }).click();

    // Varios nodos pueden mostrar estos textos; acotamos al primero visible.
    await expect(
      page.getByText(/baselines mensuales/i).first()
    ).toBeVisible({ timeout: 5_000 });
    // Cualidades en lista (slug: fuerza_maxima, resistencia_aerobica) — acepta 60/40 o 50/50 si hay baseline previo
    await expect(
      page.getByText(/fuerza_maxima|resistencia_aerobica/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
