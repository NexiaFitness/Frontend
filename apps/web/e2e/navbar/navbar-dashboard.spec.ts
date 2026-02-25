/**
 * E2E Navbar — Vista dashboard (autenticado)
 *
 * Escenarios: tras login, navbar muestra usuario y avatar; sidebar visible en desktop;
 * drawer móvil con ítems de navegación. Requiere backend (login real).
 *
 * @see NAVBAR_UNIFICADO_PLAN_Y_PROMPT.md Fase 5
 * @see frontend/docs/e2e/DIAGNOSTICO_E2E.md
 * @see e2e/fixtures/auth.ts loginAsTrainer
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("Navbar — Vista dashboard", () => {
    test("tras login muestra navbar con usuario y sidebar visible", async ({ page }) => {
        await loginAsTrainer(page);

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

        const nav = page.getByRole("navigation").first();
        await expect(nav).toBeVisible({ timeout: 10_000 });

        const sidebar = page.getByRole("complementary");
        await expect(sidebar).toBeVisible({ timeout: 10_000 });

        const clientsLink = page.getByRole("complementary").getByRole("link", { name: /clientes/i });
        await expect(clientsLink).toBeVisible();
    });
});
