/**
 * E2E Training Plans: Tabs del detalle
 *
 * Flujo: Login → Planes → Ver Detalles → comprobar tabs (Sesiones, Planificación, Hitos, Gráficos) y contenido al cambiar.
 * Assertions: nav con tabs visible; al hacer click en Planificación, contenido del tab visible.
 * APIs: getTrainingPlan.
 * Nota: Tabs son <button> en <nav aria-label="Tabs">, no role="tab"; acotar por navigation.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Detail tabs", () => {
  test("detail page has tabs and switching shows content", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    const nav = page.getByRole("navigation", { name: /tabs/i });
    await expect(nav).toBeVisible({ timeout: 8_000 });
    await expect(nav.getByRole("button", { name: /sesiones/i })).toBeVisible();
    await expect(nav.getByRole("button", { name: /planificación/i })).toBeVisible();

    await nav.getByRole("button", { name: /planificación/i }).click();
    await expect(
      page
        .getByText(/nuevo baseline mensual|calendario de planificación|baselines mensuales/i)
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
