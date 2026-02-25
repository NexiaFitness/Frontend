/**
 * E2E Navbar — Vista pública (home, auth)
 *
 * Escenarios: navbar visible con logo y enlaces Iniciar sesión/Registrarse;
 * drawer móvil abre/cierra. Viewport desktop por defecto (Playwright Desktop Chrome).
 *
 * @see NAVBAR_UNIFICADO_PLAN_Y_PROMPT.md Fase 5
 * @see frontend/docs/e2e/DIAGNOSTICO_E2E.md
 */

import { test, expect } from "@playwright/test";

test.describe("Navbar — Vista pública", () => {
    test("home muestra navbar con logo y enlaces de navegación", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        const nav = page.getByRole("navigation").first();
        await expect(nav).toBeVisible({ timeout: 10_000 });

        const logoLink = page.getByRole("link", { name: /nexia/i });
        await expect(logoLink).toBeVisible();
        await expect(logoLink).toHaveAttribute("href", "/");

        const loginLink = page.getByRole("link", { name: /iniciar sesión/i });
        const registerLink = page.getByRole("link", { name: /registrarse/i });
        await expect(loginLink).toBeVisible();
        await expect(registerLink).toBeVisible();
    });

    test("login link navega a /auth/login", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });
        await page.getByRole("link", { name: /iniciar sesión/i }).click();
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });
});
