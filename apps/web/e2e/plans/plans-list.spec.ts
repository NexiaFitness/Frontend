/**
 * E2E Training Plans: Listado
 *
 * Flujo: Login → Sidebar "Planes de entrenamiento" → listado con heading y secciones.
 * Assertions: heading "Planificación de Entrenamiento", estado (programas activos o biblioteca o empty).
 * APIs: getTrainingPlans, getTrainingPlanTemplates (vía trainerId).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";

test.describe("Plans — List", () => {
  test("plans list shows heading and sections or empty state", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToPlans(page);

    await expect(
      page.getByRole("heading", { name: /planificación de entrenamiento/i })
    ).toBeVisible({ timeout: 10_000 });

    // Al menos una de: sección Programas Activos, Biblioteca de Templates, o mensaje empty
    await expect(
      page
        .getByText(/programas activos|biblioteca de templates|no hay planes|no hay plantillas|crea y gestiona/i)
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
