/**
 * E2E User Journey: Planificación en ficha de cliente (post-consolidación)
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Journey — Weekly planning", () => {
  test("login → plans → client planning with periodization", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
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
      page.getByText(/editor de periodización|bloques configurados/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
