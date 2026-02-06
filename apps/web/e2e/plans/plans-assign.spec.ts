/**
 * E2E Training Plans: Asignar plan a cliente
 *
 * Flujo: Login → Planes → detalle plan → "Asignar a cliente" → modal → seleccionar cliente, fechas → Asignar plan → modal se cierra.
 * UI: botón en header del detalle (TrainingPlanHeader) o "Agregar Cliente" en lista (TrainingPlanCard).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("Plans — Assign", () => {
  test("from plan detail, assign plan to client via modal", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);
    await ensureOnPlanDetail(page);

    await expect(
      page.getByTestId("training-plan-detail")
    ).toBeVisible({ timeout: 15_000 });

    const assignButton = page.getByRole("button", {
      name: /asignar a cliente/i,
    });
    await expect(assignButton).toBeVisible({ timeout: 5_000 });
    await assignButton.click();

    const dialog = page.getByRole("dialog", {
      name: /asignar plan a cliente/i,
    });
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    const noClients = dialog.getByText(/no tienes clientes disponibles/i);
    const noClientsVisible = await noClients.isVisible().catch(() => false);
    if (noClientsVisible) {
      test.skip(true, "Trainer has no clients; create a client to run assign flow");
      return;
    }

    await dialog.getByLabel(/^cliente/i).selectOption({ index: 1 });

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    await dialog
      .getByLabel(/fecha de inicio/i)
      .fill(start.toISOString().slice(0, 10));
    await dialog
      .getByLabel(/fecha de fin/i)
      .fill(end.toISOString().slice(0, 10));

    await dialog.getByRole("button", { name: /asignar plan/i }).click();

    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });
});
