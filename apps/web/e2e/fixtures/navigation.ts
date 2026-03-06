/**
 * E2E navigation helpers — Sidebar y rutas del dashboard
 *
 * Responsabilidad: navegar dentro del dashboard vía sidebar (desktop).
 * Usa data-testid="dashboard-nav-sidebar" para acotar al sidebar de navegación
 * (evita strict mode: hay otro <aside> en el layout del dashboard y en ClientList).
 *
 * @see frontend/docs/DIAGNOSTICO_E2E.md §2.9
 */

import type { Page } from "@playwright/test";

const DASHBOARD_NAV_SIDEBAR = "dashboard-nav-sidebar";

/** Locator del sidebar de navegación del dashboard (único, estable para E2E). */
export function getDashboardNavSidebar(page: Page) {
  return page.getByTestId(DASHBOARD_NAV_SIDEBAR);
}

/** Click en un enlace del sidebar desktop por nombre (regex o string). */
export async function sidebarNavigate(
  page: Page,
  linkName: RegExp | string
): Promise<void> {
  const name = typeof linkName === "string" ? new RegExp(linkName, "i") : linkName;
  await getDashboardNavSidebar(page).getByRole("link", { name }).click();
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

/**
 * Nombre accesible del botón que abre el onboarding de cliente (VISTA_CLIENTES_SPEC).
 * Header: "Nuevo cliente"; empty state: "Añadir tu primer cliente".
 */
export const ADD_CLIENT_BUTTON_NAME = /nuevo cliente|añadir tu primer cliente/i;

/**
 * Locator unívoco del botón "Añadir cliente" en la vista Clientes.
 * En esa vista pueden coexistir el botón del header y el del empty state; este helper
 * devuelve el primero en orden DOM (header) para evitar strict mode en Playwright.
 * Usar siempre este helper en lugar de getByRole(..., ADD_CLIENT_BUTTON_NAME) directo.
 */
export function getAddClientFromListButton(page: Page) {
  return page.getByRole("button", { name: ADD_CLIENT_BUTTON_NAME }).first();
}
