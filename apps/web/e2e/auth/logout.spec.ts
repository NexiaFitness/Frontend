/**
 * E2E Auth: Logout
 *
 * Flujo: login → click "Cerrar sesión" en sidebar → confirmar en modal → redirige fuera del dashboard.
 * Assertions: URL ya no es /dashboard (típicamente / o /auth/login).
 * APIs: POST /auth/logout.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("Auth — Logout", () => {
  test("logged-in user can logout and is redirected", async ({ page }) => {
    await loginAsTrainer(page);
    await expect(page).toHaveURL(/\/dashboard/);

    await page
      .getByRole("complementary")
      .getByRole("button", { name: /cerrar sesión/i })
      .click();

    await expect(
      page.getByRole("dialog").getByRole("button", { name: /cerrar sesión/i })
    ).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /cerrar sesión/i })
      .click();

    await expect(page).not.toHaveURL(/\/dashboard/);
    await expect(
      page
    ).toHaveURL(/(\/|\/auth\/login)(\?.*)?$/, { timeout: 15_000 });
  });
});
