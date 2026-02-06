/**
 * E2E Exercises: Detail page
 *
 * Flujo: Login → Ejercicios → click en primer ejercicio → detalle con nombre y "Volver a Ejercicios".
 * Assertions: URL /dashboard/exercises/:id, heading con nombre del ejercicio, botón volver.
 * APIs: getExercises, getExerciseById.
 *
 * Requisitos: backend con al menos un ejercicio con mappings (GET /exercises/ devuelve lista no vacía).
 * Si no hay ejercicios, el test puede fallar al no tener card que clicar; se documenta como dependencia.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToExercises } from "../fixtures/navigation";

test.describe("Exercises — Detail", () => {
  test("clicking first exercise opens detail with name and back button", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(
      page.getByRole("heading", { name: /base de datos de ejercicios/i })
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByText(/cargando ejercicios/i)
      .waitFor({ state: "hidden", timeout: 20_000 })
      .catch(() => {});

    // Si hay lista vacía, no hay card que clicar
    const emptyMessage = page.getByText(/aún no hay ejercicios|no se encontraron ejercicios/i);
    const isEmpty = await emptyMessage.isVisible().catch(() => false);
    if (isEmpty) {
      test.skip();
      return;
    }

    // ExerciseCard tiene role="button" y aria-label "Nombre - Grupo muscular"
    const firstCard = page.getByRole("button", { name: / - .+/ }).first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    const cardName = await firstCard.getAttribute("aria-label").catch(() => null);
    await firstCard.click();

    await page.waitForURL(/\/dashboard\/exercises\/\d+/, { timeout: 10_000 });

    await expect(
      page.getByRole("button", { name: /volver a ejercicios/i })
    ).toBeVisible();

    // El heading del detalle debe ser el nombre del ejercicio (o estar en la página)
    if (cardName) {
      const namePart = cardName.split(" - ")[0];
      if (namePart) {
        await expect(page.getByRole("heading", { name: new RegExp(namePart, "i") })).toBeVisible();
      }
    } else {
      await expect(page.getByRole("heading")).toBeVisible();
    }
  });
});
