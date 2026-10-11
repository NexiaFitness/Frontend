/**
 * D-LOG-INTEGRITY-01 H3 — S3 referencia tardía sin peso (serie simple).
 *
 * @spec docs/atleta/log-integrity-2026-10/07_MODELO_ESTADO_LOGGER.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionRequestCapture,
  loginAsTrainerFresh,
  openRunForSession,
  trainerCreateSingleExerciseSession,
  typeReps,
} from "./h7-helpers";

test("QA-LOG-03 S3 referencia tardía no rellena peso vaciado", async ({ page }) => {
  test.setTimeout(240_000);

  await page.route(/run-context\/reference/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });

  const cap = attachExecutionRequestCapture(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S3"
  );
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });

  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "10");
  await page.waitForTimeout(2500);
  await expect(peso).toHaveValue("");

  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBeNull();
});
