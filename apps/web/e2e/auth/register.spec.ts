/**
 * E2E Auth: Registro de cuenta
 *
 * Flujo: /auth/register → rellenar formulario (email, nombre, apellidos, tipo de cuenta, contraseña) →
 * submit → redirect a dashboard (autologin) o mensaje de éxito/validación.
 * Assertions: con registro exitoso (mock), URL /dashboard; con datos inválidos, mensaje de validación y permanece en /auth/register.
 * APIs: POST /auth/register.
 * Sin atajos: locators por rol/label; no force, no timeouts arbitrarios.
 */

import { test, expect } from "@playwright/test";

const validRegisterUser = {
  email: `e2e.register.${Date.now()}@example.com`,
  nombre: "E2E",
  apellidos: "Register Test",
  password: "ValidPass.123",
  confirmPassword: "ValidPass.123",
};

const registerSuccessResponse = {
  access_token: "e2e-mock-token",
  token_type: "bearer",
  expires_in: 3600,
  user: {
    id: 1,
    email: validRegisterUser.email,
    nombre: validRegisterUser.nombre,
    apellidos: validRegisterUser.apellidos,
    role: "trainer",
    is_active: true,
    is_verified: false,
    created_at: new Date().toISOString(),
  },
  message: "Usuario creado correctamente",
};

test.describe("Auth — Register", () => {
  test("valid form and successful API → redirect to dashboard (autologin)", async ({
    page,
  }) => {
    await page.route("**/auth/register", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 201, json: registerSuccessResponse });
        return;
      }
      await route.continue();
    });

    await page.goto("/auth/register", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page.getByRole("heading", { name: /únete a nexi/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/correo electrónico/i).fill(validRegisterUser.email);
    await page.getByLabel(/nombre/i).fill(validRegisterUser.nombre);
    await page.getByLabel(/apellidos/i).fill(validRegisterUser.apellidos);
    await page.getByLabel(/tipo de cuenta/i).selectOption({ label: "Entrenador Personal" });
    await page.getByLabel(/^contraseña\s*\*?$/i).fill(validRegisterUser.password);
    await page.getByLabel(/confirmar contraseña/i).fill(validRegisterUser.confirmPassword);

    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("submit without required fields → validation or error visible, stay on register", async ({
    page,
  }) => {
    await page.goto("/auth/register", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page.getByRole("heading", { name: /únete a nexi/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/correo electrónico/i).fill("invalid-email");
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5_000 });
    await expect(
      page.getByText("Introduce un correo válido")
    ).toBeVisible({ timeout: 8_000 });
  });
});
