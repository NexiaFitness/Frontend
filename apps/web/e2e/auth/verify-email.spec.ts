/**
 * E2E Auth: Verificación de correo electrónico
 *
 * Flujo: /verify-email?token=... → la página envía el token automáticamente (useEffect) →
 * mensaje éxito "Correo verificado correctamente" o redirección a dashboard (2.5s).
 * APIs: POST /auth/verify-email.
 * Acepta éxito en página o redirección: evita flakiness por timing del redirect.
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

    // Tras mock éxito: la app muestra la página de verify y luego éxito, o redirige a dashboard en 2.5s.
    // Esperamos una de las dos para no depender del timing exacto.
    const headingVerification = page.getByRole("heading", {
      name: /verificación de correo electrónico/i,
    });
    const headingSuccess = page.getByRole("heading", {
      name: /correo verificado/i,
    });

    const outcome = await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 14_000 }).then(() => "dashboard" as const),
      headingVerification.waitFor({ state: "visible", timeout: 14_000 }).then(() => "page" as const),
    ]).catch(() => "timeout" as const);

    if (outcome === "dashboard") {
      expect(page.url()).toMatch(/\/dashboard/);
      return;
    }
    if (outcome === "page") {
      await expect(headingSuccess).toBeVisible({ timeout: 6_000 });
      return;
    }
    await expect(headingVerification).toBeVisible({ timeout: 1 });
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
