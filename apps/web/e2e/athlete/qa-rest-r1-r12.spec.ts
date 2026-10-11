/**
 * qa.md §13.1 R1–R12 — descanso/cronómetro (1280×800 y 375×812).
 * Sesión desechable single_set (cliente 346).
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  countExecutionPostRequests,
  loginAsTrainerFresh,
  openRunForSession,
  trainerCreateSingleExerciseSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

const VIEWPORTS = [
  { label: "1280", width: 1280, height: 800 },
  { label: "375", width: 375, height: 812 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`§13.1 descanso @ ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    async function freshSession(page: import("@playwright/test").Page) {
      await loginAsTrainerFresh(page);
      const meta = await trainerCreateSingleExerciseSession(
        page,
        H7_QA_CLIENT_ID,
        `QA-R-${vp.label}`,
      );
      await page.context().clearCookies();
      await loginAsAthlete(page);
      await openRunForSession(page, meta.sessionId);
      return meta.sessionId;
    }

    test(`R1 happy path overlay (${vp.label})`, async ({ page }) => {
      test.setTimeout(180_000);
      const posts = countExecutionPostRequests(page);
      await freshSession(page);
      await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
      await typePeso(page, 0, "40");
      await typeReps(page, 0, "8");
      await page.getByRole("button", { name: /^Guardar$/i }).click();
      await expect(
        page.getByRole("button", { name: /Saltar descanso/i }),
      ).toBeVisible({ timeout: 20_000 });
      expect(posts.count).toBe(1);
      await page.screenshot({ path: `test-results/qa-r1-overlay-${vp.label}.png` });
    });

    test(`R4 saltar overlay (${vp.label})`, async ({ page }) => {
      test.setTimeout(180_000);
      await freshSession(page);
      await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
      await typePeso(page, 0, "35");
      await typeReps(page, 0, "6");
      await page.getByRole("button", { name: /^Guardar$/i }).click();
      const skip = page.getByRole("button", { name: /Saltar descanso/i });
      await expect(skip).toBeVisible({ timeout: 20_000 });
      await skip.click();
      await expect(skip).toBeHidden({ timeout: 15_000 });
      await page.screenshot({ path: `test-results/qa-r4-skip-${vp.label}.png` });
    });

    test(`R6 sin Empezar descanso (${vp.label})`, async ({ page }) => {
      test.setTimeout(120_000);
      await freshSession(page);
      await expect(
        page.getByRole("button", { name: /Empezar descanso/i }),
      ).toBeVisible({ timeout: 45_000 });
      await expect(page.getByRole("textbox", { name: "Peso" })).toHaveCount(0);
      await page.screenshot({ path: `test-results/qa-r6-no-start-${vp.label}.png` });
    });

    test(`R11 confirm inválido (${vp.label})`, async ({ page }) => {
      test.setTimeout(180_000);
      const posts = countExecutionPostRequests(page);
      await freshSession(page);
      await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
      const peso = page.getByRole("textbox", { name: "Peso" }).first();
      const guardar = page.getByRole("button", { name: /^Guardar$/i });
      await peso.click({ clickCount: 3 });
      await peso.fill("");
      await peso.blur();
      await typeReps(page, 0, "5");
      await expect(guardar).toBeDisabled();
      await page.waitForTimeout(400);
      expect(posts.count).toBe(0);
      await page.screenshot({ path: `test-results/qa-r11-invalid-${vp.label}.png` });
    });

    test(`R3 editar datos (${vp.label})`, async ({ page }) => {
      test.setTimeout(180_000);
      await freshSession(page);
      await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
      await typePeso(page, 0, "50");
      await typeReps(page, 0, "5");
      await page.getByRole("button", { name: /^Guardar$/i }).click();
      await expect(
        page.getByRole("button", { name: /Saltar descanso/i }),
      ).toBeVisible({ timeout: 20_000 });
      await page.getByRole("button", { name: /Editar datos/i }).click();
      await expect(page.getByRole("button", { name: /^Guardar$/i })).toBeVisible({
        timeout: 10_000,
      });
      await page.screenshot({ path: `test-results/qa-r3-edit-${vp.label}.png` });
    });

    test(`R10 doble tap guardar (${vp.label})`, async ({ page }) => {
      test.setTimeout(180_000);
      const posts = countExecutionPostRequests(page);
      await freshSession(page);
      await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
      await typePeso(page, 0, "45");
      await typeReps(page, 0, "4");
      const guardar = page.getByRole("button", { name: /^Guardar$/i });
      await guardar.dblclick();
      await page.waitForTimeout(1500);
      expect(posts.count).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `test-results/qa-r10-dbl-${vp.label}.png` });
    });
  });
}
