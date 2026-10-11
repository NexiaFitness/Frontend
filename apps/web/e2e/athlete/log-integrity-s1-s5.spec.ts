/**
 * D-LOG-INTEGRITY-01 H3 — verificación navegador S1–S5 (teclado + peticiones POST).
 *
 * @spec docs/atleta/log-integrity-2026-10/07_MODELO_ESTADO_LOGGER.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionRequestCapture,
  confirmGroupRound,
  loginAsTrainerFresh,
  openRunForSession,
  skipRestIfVisible,
  trainerCreateSingleExerciseSession,
  trainerCreateSupersetOneRoundSession,
  trainerCreateTwoSingleExerciseSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-LOG-01 S1 vaciar peso POST weight_kg null", async ({ page }) => {
  test.setTimeout(180_000);
  const cap = attachExecutionRequestCapture(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S1"
  );
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("50");
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "10");
  await expect(peso).toHaveValue("");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBeNull();
});

test("QA-LOG-02 S2 no arrastra peso entre ejercicios consecutivos", async ({ page }) => {
  test.setTimeout(300_000);
  const cap = attachExecutionRequestCapture(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateTwoSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S2"
  );
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "80");
  await typeReps(page, 0, "10");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBe(80);

  await skipRestIfVisible(page);
  await expect(page.getByText(/Paso 2 \/ 2/i)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("textbox", { name: "Peso" }).first()).toBeVisible({
    timeout: 45_000,
  });
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await expect(peso).not.toHaveValue("80");
  await peso.click({ clickCount: 3 });
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "12");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(2, 30_000);
  expect(cap.posts[1]?.weight_kg).not.toBe(80);
  expect(cap.posts[1]?.weight_kg).toBeNull();
});

test("QA-LOG-04 S4 superset: un POST por slot (sin peso en A2)", async ({ page }) => {
  test.setTimeout(300_000);
  const cap = attachExecutionRequestCapture(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSupersetOneRoundSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S4"
  );
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await expect(page.getByRole("heading", { name: /Ronda 1 de/i })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByRole("textbox", { name: "Peso" }).first()).toBeVisible({
    timeout: 45_000,
  });
  await typePeso(page, 0, "30");
  await typeReps(page, 0, "10");
  await typeReps(page, 1, "12");
  const pesoA2 = page.getByRole("textbox", { name: "Peso" }).nth(1);
  if (await pesoA2.isVisible().catch(() => false)) {
    await pesoA2.click({ clickCount: 3 });
    await pesoA2.fill("");
    await pesoA2.blur();
  }
  await confirmGroupRound(page);
  await cap.waitForPostCount(2, 45_000);

  const weights = cap.posts.map((p) => p.weight_kg ?? null);
  expect(weights).toContain(30);
  expect(weights).toContain(null);
});

test("QA-LOG-05 S5 Editar datos upsert sin duplicar", async ({ page }) => {
  test.setTimeout(240_000);
  const cap = attachExecutionRequestCapture(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "QA-LOG-S5"
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "60");
  await typeReps(page, 0, "8");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 30_000);

  const edit = page.getByRole("button", { name: /Editar datos/i });
  await expect(edit).toBeVisible({ timeout: 15_000 });
  await edit.click();
  await typePeso(page, 0, "62");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(2, 30_000);
  expect(cap.posts[1]?.weight_kg).toBe(62);
});
