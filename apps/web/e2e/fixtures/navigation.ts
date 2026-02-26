/**
 * E2E navigation helpers — Sidebar y rutas del dashboard
 *
 * Responsabilidad: navegar dentro del dashboard vía sidebar (desktop).
 * Acota al landmark role="complementary" para evitar strict mode (drawer móvil).
 * @see frontend/docs/DIAGNOSTICO_E2E.md §2.9
 */

import type { Page } from "@playwright/test";

/** Click en un enlace del sidebar desktop por nombre (regex o string). */
export async function sidebarNavigate(
  page: Page,
  linkName: RegExp | string
): Promise<void> {
  const name = typeof linkName === "string" ? new RegExp(linkName, "i") : linkName;
  await page.getByRole("complementary").getByRole("link", { name }).click();
}

export async function navigateToPlans(page: Page): Promise<void> {
  await sidebarNavigate(page, /planificación/i);
  await page.waitForURL(/\/dashboard\/training-plans/, { timeout: 10_000 });
}

export async function navigateToClients(page: Page): Promise<void> {
  await sidebarNavigate(page, /clientes/i);
  await page.waitForURL(/\/dashboard\/clients/, { timeout: 10_000 });
}

export async function navigateToExercises(page: Page): Promise<void> {
  await sidebarNavigate(page, /ejercicios/i);
  await page.waitForURL(/\/dashboard\/exercises/, { timeout: 10_000 });
}

export async function navigateToAccount(page: Page): Promise<void> {
  await sidebarNavigate(page, /mi cuenta/i);
  await page.waitForURL(/\/dashboard\/account/, { timeout: 10_000 });
}

/** Ir a Calendario/Sesiones vía sidebar o URL directa. */
export async function navigateToScheduling(page: Page): Promise<void> {
  await sidebarNavigate(page, /calendario/i);
  await page.waitForURL(/\/dashboard\/scheduling/, { timeout: 10_000 });
}
