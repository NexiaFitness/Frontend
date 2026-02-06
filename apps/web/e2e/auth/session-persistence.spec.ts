/**
 * E2E Auth: Persistencia de sesión (recarga)
 *
 * Flujo: login → recargar página → sigue en dashboard.
 * Assertions: tras reload, URL /dashboard y contenido del dashboard visible.
 * Valida que la hidratación desde localStorage no redirige a login (ver Error 1 en DIAGNOSTICO_E2E).
 * APIs: GET /auth/me (hidratación).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("Auth — Session persistence", () => {
  test("after reload user remains on dashboard", async ({ page }) => {
    await loginAsTrainer(page);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(
      page.getByRole("complementary").getByRole("link", { name: /clientes/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
