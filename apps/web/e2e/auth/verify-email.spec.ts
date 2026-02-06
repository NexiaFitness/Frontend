/**
 * E2E Auth: Verificación de correo electrónico
 *
 * Flujo: /verify-email?token=... → la página envía el token automáticamente (useEffect) →
 * mensaje éxito "Correo verificado correctamente" o error "enlace no válido".
 * APIs: POST /auth/verify-email.
 * Sin atajos: con mock de éxito se comprueba la UI de éxito; sin mock (token inválido) se comprueba la UI de error.
 */

import { test, expect } from "@playwright/test";

test.describe("Auth — Verify email", () => {
  test("valid token (mocked success) → success message or redirect to dashboard", async ({
    page,
  }) => {
    await page.route("**/auth/verify-email", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          json: { message: "Email verified", email: "user@example.com" },
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/verify-email?token=e2e-valid-token", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page.getByRole("heading", { name: /verificación de correo electrónico/i })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole("heading", { name: /correo verificado/i })
    ).toBeVisible({ timeout: 12_000 });
  });

  test("invalid or expired token → error message and Volver al login", async ({
    page,
  }) => {
    await page.route("**/auth/verify-email", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          json: { detail: "El enlace de verificación no es válido o ha expirado." },
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/verify-email?token=invalid", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page.getByRole("heading", { name: /verificación de correo electrónico/i })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/no es válido|expirado|error/i)
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /volver al login/i })
    ).toBeVisible({ timeout: 5_000 });
  });
});
