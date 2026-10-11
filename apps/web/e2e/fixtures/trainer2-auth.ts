/**
 * Segundo entrenador (otro tenant) — credenciales en backend/.env.qa
 */

import type { Page } from "@playwright/test";

export function trainer2Credentials(): { email: string; password: string } {
  const email =
    process.env.DEMO_TRAINER2_EMAIL?.trim() ||
    process.env.NEXIA_TRAINER2_EMAIL?.trim() ||
    "qa.trainer.segundo@nexia.dev";
  const password = String(
    process.env.NEXIA_TRAINER2_PASSWORD ??
      process.env.DEMO_TRAINER2_PASSWORD ??
      "",
  ).trim();
  if (!password) {
    throw new Error(
      "E2E: falta NEXIA_TRAINER2_PASSWORD / DEMO_TRAINER2_PASSWORD (backend/.env.qa).",
    );
  }
  return { email, password };
}

export async function loginAsTrainer2(page: Page): Promise<void> {
  const { email, password } = trainer2Credentials();
  await page.goto("/auth/login", { waitUntil: "load" });
  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByRole("textbox", { name: /^Contraseña/i }).fill(password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}
