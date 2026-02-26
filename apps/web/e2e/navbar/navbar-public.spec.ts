/**
 * E2E Navbar — Vista pública (home, auth)
 *
 * Escenarios: navbar visible con logo y enlaces Iniciar sesión/Registrarse;
 * drawer móvil abre/cierra. Viewport desktop por defecto (Playwright Desktop Chrome).
 *
 * Locators acotados a la región "Navegación pública" (aria-label del navbar desktop)
 * para evitar strict mode cuando el drawer móvil también contiene enlaces duplicados.
 *
 * @see NAVBAR_UNIFICADO_PLAN_Y_PROMPT.md Fase 5
 * @see frontend/docs/e2e/DIAGNOSTICO_E2E.md
 */

import { test, expect, type Page } from "@playwright/test";

/** Región del navbar desktop con enlaces públicos (NavbarPublicActions, aria-label). */
const getPublicNav = (page: Page) =>
    page.getByRole("navigation", { name: /navegación pública/i });

test.describe("Navbar — Vista pública", () => {
    test("home muestra navbar con logo y enlaces de navegación", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        const nav = getPublicNav(page);
        await expect(nav).toBeVisible({ timeout: 10_000 });

        const logoLink = page.getByRole("link", { name: /nexia/i });
        await expect(logoLink).toBeVisible();
        await expect(logoLink).toHaveAttribute("href", "/");

        await expect(nav.getByRole("link", { name: /iniciar sesión/i })).toBeVisible();
        await expect(nav.getByRole("link", { name: /registrarse/i })).toBeVisible();
    });

    test("login link navega a /auth/login", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });
        await getPublicNav(page).getByRole("link", { name: /iniciar sesión/i }).click();
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });
});
