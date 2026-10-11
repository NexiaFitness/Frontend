/**
 * D-LOG-INTEGRITY-01 H3 — S3 referencia tardía no rellena peso vaciado (serie simple).
 *
 * @spec docs/atleta/log-integrity-2026-10/07_MODELO_ESTADO_LOGGER.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionRequestCapture,
  countExecutionPostRequests,
  loginAsTrainerFresh,
  openRunForSession,
  trainerCreateSingleExerciseSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-LOG-03 S3 referencia tardía no rellena peso vaciado", async ({ page }) => {
  test.setTimeout(360_000);

  await loginAsTrainerFresh(page);
  const seed = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S3-SEED"
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, seed.sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "55");
  await typeReps(page, 0, "8");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await expect(page.getByRole("button", { name: /Editar datos/i })).toBeVisible({
    timeout: 30_000,
  });
  await page.context().clearCookies();

  const cap = attachExecutionRequestCapture(page);
  const reqCounter = countExecutionPostRequests(page);

  await page.unroute(/run-context\/reference/);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S3"
  );
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await page.route(/run-context\/reference/, async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });

  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "10");

  await expect
    .poll(async () => peso.inputValue(), { timeout: 20_000 })
    .toBe("");

  const guardar = page.getByRole("button", { name: /^Guardar$/i });
  await expect(guardar).toBeDisabled();
  expect(reqCounter.count).toBe(0);

  await peso.fill("0");
  await peso.blur();
  await expect(guardar).toBeEnabled();
  await guardar.click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBe(0);
});
