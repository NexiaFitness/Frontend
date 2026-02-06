/**
 * E2E Exercises: Search and filters
 *
 * Flujo: Login → Ejercicios → búsqueda o filtros (Grupo Muscular, Equipamiento, Nivel).
 * Assertions: panel Filtros visible, aplicar filtro → resultados o "No se encontraron ejercicios".
 * APIs: getExercises con params; Exercise Catalog (muscle groups, equipment) para opciones.
 *
 * Requisitos: backend con /api/v1/exercises/ y /exercise-catalog/* para opciones de filtros.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToExercises } from "../fixtures/navigation";

test.describe("Exercises — Search and filter", () => {
  test("filters panel is visible and search input exists", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(
      page.getByRole("heading", { name: /base de datos de ejercicios/i })
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole("heading", { name: /filtros/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByPlaceholder(/buscar ejercicios/i)
    ).toBeVisible();
  });

  test("applying level filter updates results or shows empty", async ({
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

    // Select "Nivel" → value "beginner" (estable, no depende de traducción)
    await page.getByLabel(/nivel/i).selectOption({ value: "beginner" });

    // Tras aplicar filtro: o hay "Mostrando X de Y" o "No se encontraron ejercicios"
    await expect(
      page
        .getByText(
          /mostrando \d+ de \d+ ejercicios|no se encontraron ejercicios|aún no hay ejercicios/i
        )
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
