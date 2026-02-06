/**
 * E2E: Flujo period-based — Login → Planes → Planificación (Sprint 3)
 *
 * Requisitos: Backend y frontend levantados; cuenta demo. Opcional: al menos un plan.
 * Tabs en detalle son <button> en <nav aria-label="Tabs">; acotar por navigation.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";

test.describe("Planning flow (period-based)", () => {
  test("login → training plans → plan detail → Planificación tab shows baseline/calendar UI", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);

    await expect(
      page.getByRole("heading", { name: /planificación de entrenamiento/i })
    ).toBeVisible({ timeout: 10_000 });

    const verDetalles = page
      .getByRole("button", { name: /ver detalles/i })
      .first();
    const hasPlan = await verDetalles.isVisible().catch(() => false);

    if (hasPlan) {
      await verDetalles.click();
      await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+/);

      await page
        .getByRole("navigation", { name: /tabs/i })
        .getByRole("button", { name: /planificación/i })
        .click();

      await expect(
        page
          .getByText(
            /nuevo baseline mensual|calendario de planificación|baselines mensuales/i
          )
          .first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(
        page
          .getByText(
            /programas activos|biblioteca de templates|crear|crea y gestiona/i
          )
          .first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
