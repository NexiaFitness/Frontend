/**
 * E2E auth helpers — Login y flujo de autenticación
 *
 * Responsabilidad: llevar al usuario a sesión iniciada (dashboard).
 * No incluye navegación post-login (ver fixtures/navigation.ts).
 *
 * Requisitos: frontend servido en baseURL; backend levantado para que el POST
 * login tenga éxito (ver DIAGNOSTICO_E2E.md Error N).
 */

import type { Page } from "@playwright/test";
import { demoUser, demoPassword } from "./test-data";

const LOGIN_FORM_TIMEOUT = 15_000;

/** Asegura sesión de trainer: si no está en dashboard, rellena login y envía. */
export async function loginAsTrainer(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});

  const url = page.url();
  if (url.includes("/dashboard")) return;

  if (!url.includes("/auth/login")) {
    await page.goto("/auth/login", { waitUntil: "load" });
    await page.waitForURL(/\/auth\/login/, { timeout: 10_000 });
  }

  const emailInput = page.getByLabel(/correo electrónico/i);
  const formVisible = await emailInput.waitFor({ state: "visible", timeout: LOGIN_FORM_TIMEOUT }).then(() => true).catch(() => false);
  if (!formVisible) {
    await page.screenshot({ path: "test-results/e2e-login-page-captured.png" }).catch(() => {});
    throw new Error(
      "E2E: formulario de login no visible en la página cargada. Revisa test-results/e2e-login-page-captured.png para ver qué ve el test. URL actual: " + page.url()
    );
  }

  await emailInput.fill(demoUser);
  await page.getByRole("textbox", { name: /^Contraseña/i }).fill(demoPassword);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {
    throw new Error(
      "E2E login failed: cuenta demo debe tener email verificado y perfil trainer. Ejecuta: cd backend && python scripts/seed_demo_user.py"
    );
  });
}
