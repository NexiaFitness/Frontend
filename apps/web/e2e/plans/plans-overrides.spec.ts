/**
 * E2E Training Plans: Periodización en cliente (post-consolidación)
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Overrides (weekly)", () => {
  test("plan detail redirects to client planning tab", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 15_000 });
    await expect(page.getByTestId("client-planning-tab")).toBeVisible({
      timeout: 15_000,
    });
  });
});
