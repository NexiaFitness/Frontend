/**
 * E2E Auth: Login exitoso
 *
 * Flujo: / → redirige a login (o ya en login) → rellenar credenciales → enviar → dashboard.
 * Assertions: URL /dashboard, sidebar visible (enlace "Clientes" o "Planes de entrenamiento").
 * APIs: POST /auth/login, GET /auth/me (implícito tras login).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { getDashboardNavSidebar } from "../fixtures/navigation";

test.describe("Auth — Login success", () => {
  test("unauthenticated user can log in and reaches dashboard", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      getDashboardNavSidebar(page).getByRole("link", { name: /clientes/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
