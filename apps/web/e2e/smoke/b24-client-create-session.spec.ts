/**
 * B-24 — Cliente sin plan: Crear sesión debe abrir el constructor (no quedarse en la ficha).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

test.describe("B-24 cliente sin plan activo", () => {
  test("tab Sesiones → día 13 → Crear sesión muestra constructor", async ({ page }) => {
    await loginAsTrainer(page);
    await page.goto("/dashboard/clients/354?tab=sessions", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "13", exact: true }).click();
    await page.getByRole("button", { name: "Crear sesión", exact: true }).click();

    await expect(page).toHaveURL(/create-session/, { timeout: 15_000 });
    await expect(page.getByText("Datos de la sesión")).toBeVisible({ timeout: 25_000 });
    await expect(page.getByRole("heading", { name: "QA Manual Browser QA", level: 1 })).toHaveCount(
      0,
    );
  });
});
