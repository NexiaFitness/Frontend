/**
 * E2E Auth: Login fallido (credenciales inválidas)
 *
 * Flujo: ir a login → rellenar email/contraseña incorrectos → enviar.
 * Assertions: mensaje de error visible (ServerErrorBanner), sigue en /auth/login.
 * APIs: POST /auth/login (401 o detalle del backend).
 */

import { test, expect } from "@playwright/test";
import { demoUser } from "../fixtures/test-data";

test.describe("Auth — Login failure", () => {
  test("invalid credentials show error and stay on login page", async ({
    page,
  }) => {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.getByRole("textbox", { name: /email|correo/i }).fill(demoUser);
    await page
      .getByRole("textbox", { name: /contraseña|password/i })
      .fill("WrongPassword123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 });
    // Backend devuelve 400 con detail en inglés; frontend lo muestra en ServerErrorBanner (ver DIAGNOSTICO_E2E Error 3)
    await expect(
      page.getByText(
        /incorrect email or password|correo o contraseña incorrectos|incorrectos|error/i
      )
    ).toBeVisible({ timeout: 10_000 });
  });
});
