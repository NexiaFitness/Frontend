/**
 * E2E Edge: Eliminar cuenta (flujo con mock)
 *
 * Flujo: Login → Mi cuenta → Eliminar cuenta → confirmar en modal.
 * Mock: DELETE /auth/me responde 200 para no borrar la cuenta demo.
 * Assertions: tras confirmar, redirect a /auth/login (logout).
 *
 * Requisitos: cuenta demo; el test no ejecuta delete real (intercept 200).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToAccount } from "../fixtures/navigation";

test.describe("Edge — Account delete", () => {
  test("delete account flow: confirm in modal → mock success → redirect to login", async ({
    page,
  }) => {
    await page.route("**/api/v1/auth/me", (route) => {
      if (route.request().method() === "DELETE") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Account deleted" }),
        });
      } else {
        route.continue();
      }
    });

    await loginAsTrainer(page);
    await navigateToAccount(page);

    await expect(
      page.getByRole("heading", { name: /mi cuenta/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /eliminar cuenta/i }).click();

    await expect(
      page.getByRole("heading", { name: /eliminar cuenta/i })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .getByRole("dialog")
      .getByRole("button", { name: /eliminar cuenta/i })
      .click();

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
