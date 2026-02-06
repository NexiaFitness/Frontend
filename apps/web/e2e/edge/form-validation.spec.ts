/**
 * E2E Edge: Validación de formularios
 *
 * Flujo: Login / Register con datos inválidos o vacíos → mensaje de validación visible, no submit.
 * Assertions: permanece en la página, texto de error/validación visible.
 *
 * Requisitos: ninguno (no se envía al backend o backend devuelve 422).
 */

import { test, expect } from "@playwright/test";

test.describe("Edge — Form validation", () => {
  test("login with empty fields does not submit and shows validation or error", async ({
    page,
  }) => {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 });
    await expect(
      page.getByText("El correo es obligatorio")
    ).toBeVisible({ timeout: 8_000 });
  });

  test("register with invalid email shows validation and stays on register", async ({
    page,
  }) => {
    await page.goto("/auth/register", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.getByLabel(/correo electrónico/i).fill("not-an-email");
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5_000 });
    await expect(
      page.getByText(/correo válido|válido|inválido|error/i)
    ).toBeVisible({ timeout: 8_000 });
  });
});
