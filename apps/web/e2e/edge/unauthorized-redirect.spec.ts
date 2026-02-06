/**
 * E2E Edge: Redirección sin autenticación
 *
 * Flujo: sin token (contexto limpio) → ir a /dashboard.
 * Assertions: tras hidratación, redirige a /auth/login (no debe redirigir antes de hidratar).
 * Valida ProtectedRoute: espera isLoading antes de decidir (ver Error 1 en DIAGNOSTICO_E2E).
 */

import { test, expect } from "@playwright/test";

test.describe("Edge — Unauthorized redirect", () => {
  test("unauthenticated access to /dashboard redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 20_000 });
  });
});
