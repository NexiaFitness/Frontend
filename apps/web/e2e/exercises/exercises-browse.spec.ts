/**
 * E2E Exercises: Browse list
 *
 * Flujo: Login → Sidebar "Ejercicios" → listado con heading.
 * Assertions: heading "Base de Datos de Ejercicios", lista (cards o "Mostrando X de Y") o empty state.
 * APIs: getExercises (useExercises). Paginación si totalPages > 1.
 *
 * Requisitos: backend con /api/v1/exercises/ disponible (puede devolver 0 ejercicios).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToExercises } from "../fixtures/navigation";

test.describe("Exercises — Browse", () => {
  test("exercises list shows heading and content or empty state", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(
      page.getByRole("heading", { name: /base de datos de ejercicios/i })
    ).toBeVisible({ timeout: 15_000 });

    // Después de cargar: o hay resultados (texto "Mostrando" o cards) o empty state
    await expect(
      page
        .getByText(
          /mostrando \d+ de \d+ ejercicios|aún no hay ejercicios|no se encontraron ejercicios/i
        )
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("when list has results, loading is replaced by content or empty", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(
      page.getByRole("heading", { name: /base de datos de ejercicios/i })
    ).toBeVisible({ timeout: 15_000 });

    // Loading debe desaparecer; luego contenido ("Mostrando X de Y") o empty
    await page
      .getByText(/cargando ejercicios/i)
      .waitFor({ state: "hidden", timeout: 20_000 })
      .catch(() => {});

    await expect(
      page
        .getByText(
          /mostrando \d+ de \d+ ejercicios|aún no hay ejercicios|no se encontraron ejercicios/i
        )
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
