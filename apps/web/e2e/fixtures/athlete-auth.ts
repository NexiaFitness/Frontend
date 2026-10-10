/**
 * E2E auth — portal atleta (QA Diana / .env.qa).
 */

import type { Page } from "@playwright/test";

function requireAthletePassword(): string {
  const password = String(process.env.NEXIA_ATHLETE_PASSWORD ?? "").trim();
  if (!password) {
    throw new Error(
      "E2E: falta NEXIA_ATHLETE_PASSWORD (p. ej. export desde backend/.env.qa DEMO_ATHLETE_PASSWORD)."
    );
  }
  return password;
}

export function athleteEmail(): string {
  return (
    process.env.NEXIA_ATHLETE_EMAIL?.trim() ||
    "cliente.standalone.demo@example.com"
  );
}

export async function loginAsAthlete(page: Page): Promise<void> {
  const email = athleteEmail();
  const password = requireAthletePassword();

  await page.goto("/auth/login", { waitUntil: "load" });
  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByRole("textbox", { name: /^Contraseña/i }).fill(password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}
