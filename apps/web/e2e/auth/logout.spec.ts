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

    // Sidebar empieza colapsado: el LogoutButton solo se renderiza cuando está expandido.
    // Hover sobre el sidebar de navegación para expandirlo y revelar el botón.
    const navSidebar = page.getByTestId("dashboard-nav-sidebar");
    await navSidebar.hover();

    await navSidebar.getByRole("button", { name: /cerrar sesión/i }).click();

    // Modal de confirmación tiene title "¿Cerrar sesión?" — acotar para evitar strict mode
    // (el drawer "Menú de navegación" también tiene un botón "Cerrar sesión").
    const confirmModal = page.getByRole("dialog", { name: /¿cerrar sesión\?/i });
    await expect(
      confirmModal.getByRole("button", { name: /cerrar sesión/i })
    ).toBeVisible({ timeout: 5_000 });
    await confirmModal.getByRole("button", { name: /cerrar sesión/i }).click();

    await expect(page).not.toHaveURL(/\/dashboard/);
    await expect(
      page
    ).toHaveURL(/(\/|\/auth\/login)(\?.*)?$/, { timeout: 15_000 });
  });
});
