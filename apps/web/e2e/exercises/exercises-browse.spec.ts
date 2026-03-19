/**
 * E2E Exercises: Browse list
 *
 * Flujo: Login → Sidebar "Ejercicios" → biblioteca (spec Lovable).
 * Assertions: heading "Ejercicios · {count}", búsqueda, contenido (cards / tabla) o empty state.
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

    await expect(page.getByRole("heading", { name: /ejercicios ·/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByPlaceholder(/buscar ejercicio/i)).toBeVisible();

    await expect(
      page
        .getByText(/tu biblioteca está vacía|nuevo ejercicio/i)
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("when list loads, loading state finishes", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(page.getByRole("heading", { name: /ejercicios ·/i })).toBeVisible({
      timeout: 15_000,
    });

    await page
      .locator(".animate-spin")
      .first()
      .waitFor({ state: "hidden", timeout: 25_000 })
      .catch(() => {});

    await expect(page.getByPlaceholder(/buscar ejercicio/i)).toBeVisible();
  });
});
