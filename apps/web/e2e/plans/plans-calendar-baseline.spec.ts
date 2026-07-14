/**
 * E2E Training Plans: Periodización en ficha de cliente (post-consolidación)
 *
 * Flujo: Login → Planes → detalle → redirect cliente → editor de periodización visible.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Calendar / periodization", () => {
  test("plan detail redirects to client planning with periodization editor", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 15_000 });

    const clientNav = page.getByRole("navigation", { name: /tabs del cliente/i });
    await clientNav.getByRole("button", { name: /planificación/i }).click();

    await expect(page.getByTestId("client-planning-tab")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: /editor de periodización del plan/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/crear bloque de periodización|bloques configurados/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
