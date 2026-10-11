import type { Page } from "@playwright/test";

function requireAthlete2Password(): string {
  const password = String(
    process.env.NEXIA_ATHLETE2_PASSWORD ??
      process.env.DEMO_ATHLETE2_PASSWORD ??
      "",
  ).trim();
  if (!password) {
    throw new Error("E2E: falta DEMO_ATHLETE2_PASSWORD en backend/.env.qa");
  }
  return password;
}

export function athlete2Email(): string {
  return (
    process.env.NEXIA_ATHLETE2_EMAIL?.trim() ||
    process.env.DEMO_ATHLETE2_EMAIL?.trim() ||
    "qa.atleta.segundo@nexia.dev"
  );
}

export async function loginAsAthlete2(page: Page): Promise<void> {
  const email = athlete2Email();
  const password = requireAthlete2Password();
  await page.goto("/auth/login", { waitUntil: "load" });
  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByRole("textbox", { name: /^Contraseña/i }).fill(password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}
