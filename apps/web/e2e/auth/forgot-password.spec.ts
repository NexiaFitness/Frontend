/**
 * E2E Auth: Recuperar contraseña (forgot password)
 *
 * Flujo: /auth/forgot-password → correo electrónico → submit →
 * mensaje "Correo enviado" / "Te hemos enviado un enlace" visible.
 * APIs: POST /auth/forgot-password.
 * Sin atajos: locators por rol/label; respuesta API mockeada para no depender de envío real de email.
 */

import { test, expect } from "@playwright/test";

test.describe("Auth — Forgot password", () => {
  test("submit valid email → success message visible", async ({ page }) => {
    await page.route("**/auth/forgot-password", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 200, json: { message: "OK" } });
        return;
      }
      await route.continue();
    });

    await page.goto("/auth/forgot-password", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page.getByRole("heading", { name: /recuperar contraseña/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/correo electrónico/i).fill("user@example.com");
    await page.getByRole("button", { name: /enviar enlace de recuperación/i }).click();

    await expect(
      page.getByRole("heading", { name: /correo enviado/i })
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /volver al login/i })
    ).toBeVisible({ timeout: 3_000 });
  });
});
