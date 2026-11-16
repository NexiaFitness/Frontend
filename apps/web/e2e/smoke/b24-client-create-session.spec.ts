/**
 * B-24 — Cliente sin plan: Crear sesión debe abrir el constructor (no quedarse en la ficha).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

/** Cliente demo sin plan activo (mismo que QA B-24 en registro: Bruno 389). */
const CLIENT_WITHOUT_PLAN_ID = "389";

test.describe("B-24 cliente sin plan activo", () => {
  test("tab Sesiones → día del mes → Crear sesión muestra constructor", async ({ page }) => {
    await loginAsTrainer(page);
    const dayOfMonth = String(new Date().getDate());
    await page.goto(
      `/dashboard/clients/${CLIENT_WITHOUT_PLAN_ID}?tab=sessions`,
      { waitUntil: "domcontentloaded" },
    );
    await page.getByRole("button", { name: dayOfMonth, exact: true }).click();
    await page.getByRole("button", { name: "Crear sesión", exact: true }).click();

    await expect(page).toHaveURL(/create-session/, { timeout: 15_000 });
    await expect(page.getByText("Datos de la sesión")).toBeVisible({ timeout: 25_000 });
  });
});
