/**
 * E2E helpers para flujos de planes
 *
 * - ensureOnPlanDetail / ensureClientPlanningTab: ficha cliente → planificación
 *   (la lista global /dashboard/training-plans ya no es la ruta estable post-consolidación UX).
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const QA_PLANNING_CLIENT_ID = 346;

/**
 * Ficha cliente → pestaña planificación.
 * Opcional `planId` cuando hay varias asignaciones.
 */
export async function ensureClientPlanningTab(
  page: Page,
  clientId: number = QA_PLANNING_CLIENT_ID,
  planId?: number,
): Promise<void> {
  const query = planId
    ? `?tab=planning&plan=${planId}`
    : "?tab=planning";
  await page.goto(`/dashboard/clients/${clientId}${query}`, {
    waitUntil: "load",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(page.getByTestId("client-planning-tab")).toBeVisible({
    timeout: 20_000,
  });
}

/** @deprecated alias — usar ensureClientPlanningTab */
export async function ensureOnPlanDetail(
  page: Page,
  planId?: number,
): Promise<void> {
  await ensureClientPlanningTab(page, QA_PLANNING_CLIENT_ID, planId);
}
