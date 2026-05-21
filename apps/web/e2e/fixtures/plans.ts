/**
 * E2E helpers para flujos de planes
 *
 * - ensureOnPlanDetail: lista de planes → detalle (redirect a ficha cliente si el plan tiene cliente)
 * Sin skip: el test siempre se ejecuta.
 */

import type { Page } from "@playwright/test";
import { createMinimalPlanData } from "./test-data";

const LIST_READY_TIMEOUT = 12_000;

/**
 * Asegura estar en planificación del cliente para un plan con asignación.
 * Tras consolidación UX, /training-plans/:id redirige a /clients/:id?tab=planning&plan=:id.
 */
export async function ensureOnPlanDetail(page: Page): Promise<void> {
  const verDetalles = page
    .getByRole("button", { name: /ver detalles/i })
    .first();
  const createBtn = page
    .getByRole("button", { name: /nuevo programa|crear primer plan/i })
    .first();

  const hasExistingPlan = await verDetalles
    .waitFor({ state: "visible", timeout: LIST_READY_TIMEOUT })
    .then(() => true)
    .catch(() => false);

  if (hasExistingPlan) {
    await verDetalles.click();
    await page.waitForURL(
      /\/dashboard\/(training-plans\/\d+|clients\/\d+\?.*tab=planning)/,
      { timeout: 15_000 },
    );
    await page.waitForURL(/\/dashboard\/clients\/\d+/, { timeout: 15_000 }).catch(() => {});
    return;
  }

  await createBtn.waitFor({ state: "visible", timeout: 5_000 });
  await createBtn.click();
  await page.waitForURL(/\/dashboard\/training-plans\/create/, {
    timeout: 10_000,
  });

  const data = createMinimalPlanData();
  await page
    .getByPlaceholder(/ej: programa de fuerza/i)
    .fill(data.name);
  await page.getByLabel(/categoría/i).selectOption({ index: 1 });
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 3);
  await page
    .getByLabel(/fecha de inicio/i)
    .fill(start.toISOString().slice(0, 10));
  await page
    .getByLabel(/fecha de fin/i)
    .fill(end.toISOString().slice(0, 10));
  await page.getByRole("button", { name: /siguiente/i }).click();

  await page.waitForURL(
    /\/dashboard\/(training-plans\/\d+|clients\/\d+)/,
    { timeout: 15_000 },
  );
  await page.waitForURL(/\/dashboard\/clients\/\d+/, { timeout: 15_000 }).catch(() => {});
}
