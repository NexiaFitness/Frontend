/**
 * E2E Training Plans: Planificación en ficha de cliente
 *
 * Flujo: Login → Planes → Ver Detalles → redirect a cliente → tab Planificación con periodización.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Detail tabs", () => {
  test("opens client planning after plan detail link", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 15_000 });
    await expect(page.getByTestId("client-planning-tab")).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.getByRole("heading", { name: /editor de periodización del plan/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/progresión planificada|bloques configurados/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
