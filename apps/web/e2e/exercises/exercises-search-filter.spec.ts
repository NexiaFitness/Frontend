/**
 * E2E Exercises: Search and filters (biblioteca Lovable)
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToExercises } from "../fixtures/navigation";

test.describe("Exercises — Search and filter", () => {
  test("search input and level filter exist", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(page.getByRole("heading", { name: /ejercicios ·/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByPlaceholder(/buscar ejercicio/i)).toBeVisible();
    await expect(page.getByLabel(/filtrar por nivel/i)).toBeVisible();
  });

  test("applying level filter still shows library UI", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToExercises(page);

    await expect(page.getByRole("heading", { name: /ejercicios ·/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.locator(".animate-spin").first().waitFor({ state: "hidden", timeout: 25_000 }).catch(() => {});

    await page.getByLabel(/filtrar por nivel/i).selectOption({ value: "beginner" });

    await expect(page.getByPlaceholder(/buscar ejercicio/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /ejercicios ·/i })).toBeVisible();
  });
});
