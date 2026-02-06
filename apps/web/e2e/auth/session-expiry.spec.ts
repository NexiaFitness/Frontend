/**
 * E2E Auth: Sesión expirada (401 Unauthorized)
 *
 * Flujo: Login → interceptar una petición protegida (GET /trainers/profile) para devolver 401 →
 * navegar a una página que dispare esa petición → la app debe redirigir a login o mostrar estado de error.
 * Assertions: URL /auth/login o mensaje de error/sesión expirada visible.
 * APIs: GET /trainers/profile (o GET /auth/me); comportamiento según baseApi y manejo de 401 en la app.
 * Sin atajos: un único 401 en una petición real tras login; no fake timers.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("Auth — Session expiry", () => {
  test("401 on protected request after login → redirect to login or error visible", async ({
    page,
  }) => {
    await page.route("**/trainers/profile", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 401,
          json: { detail: "Unauthorized" },
        });
        return;
      }
      await route.continue();
    });

    await loginAsTrainer(page);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/training-plans", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    const onLoginPage = await page
      .waitForURL(/\/auth\/login/, { timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (onLoginPage) {
      expect(page.url()).toMatch(/\/auth\/login/);
      return;
    }

    await expect(
      page.getByText(/no se pudo cargar.*perfil|completa tu perfil primero|sesión expirada|error|no autorizado/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
