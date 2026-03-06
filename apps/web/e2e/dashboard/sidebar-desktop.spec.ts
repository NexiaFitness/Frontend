/**
 * E2E Sidebar — Vista desktop del sidebar colapsable
 *
 * Escenarios: tras login, sidebar visible en viewport desktop; contiene enlace Clientes.
 * Requiere backend (login real). No simula hover ni toggle (cubierto por unit tests).
 *
 * @see SIDE_MENU_COLAPSABLE_PLAN_Y_PROMPT.md Fase 4
 * @see e2e/fixtures/auth.ts loginAsTrainer
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("Sidebar — Vista desktop", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("sidebar visible y contiene enlace Clientes tras login", async ({ page }) => {
        await loginAsTrainer(page);

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

        const sidebar = page.getByTestId("dashboard-nav-sidebar");
        await expect(sidebar).toBeVisible({ timeout: 10_000 });

        const clientsLink = sidebar.getByRole("link", { name: /clientes/i });
        await expect(clientsLink).toBeVisible();
    });
});
