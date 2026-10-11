/**
 * D-LOG-INTEGRITY-01 H3 — verificación navegador S1–S5 (D-LOG-TOUCH-01 D1).
 *
 * @spec docs/atleta/log-integrity-2026-10/07_MODELO_ESTADO_LOGGER.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionRequestCapture,
  confirmGroupRound,
  startRestAfterFill,
  countExecutionPostRequests,
  loginAsTrainerFresh,
  openRunForSession,
  skipRestIfVisible,
  trainerCreateSingleExerciseSession,
  trainerCreateSupersetOneRoundSession,
  trainerCreateTwoSingleExerciseSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-LOG-01 S1 vaciar peso bloquea guardado; 0 explícito permite POST", async ({
  page,
}) => {
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
  const guardar = page.getByRole("button", { name: /^Guardar$/i });

  await peso.click({ clickCount: 3 });
  await peso.fill("50");
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "10");
  await expect(peso).toHaveValue("");
  await expect(guardar).toBeDisabled();
  await page.waitForTimeout(800);
  expect(cap.posts.length).toBe(0);

  await peso.fill("0");
  await peso.blur();
  await expect(guardar).toBeEnabled();
  await guardar.click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBe(0);
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
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await expect(peso).toBeVisible({ timeout: 45_000 });
  await expect
    .poll(async () => peso.inputValue(), { timeout: 20_000 })
    .not.toBe("80");
  await peso.click({ clickCount: 3 });
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "12");
  const guardar = page.getByRole("button", { name: /^Guardar$/i });
  await expect(guardar).toBeDisabled();
  expect(cap.posts.length).toBe(1);
});

test("QA-LOG-04 S4 superset: weight_reps exige peso; 2 POST con pesos válidos", async ({
  page,
}) => {
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

  const pesoFields = page.getByRole("textbox", { name: "Peso" });
  await expect(pesoFields).toHaveCount(2, { timeout: 15_000 });

  await typePeso(page, 0, "30");
  await typePeso(page, 1, "25");
  await typeReps(page, 1, "12");
  await startRestAfterFill(page);

  const confirm = page.getByRole("button", {
    name: /Ronda completada|Dropset completado/i,
  });
  await expect(confirm).toBeEnabled({ timeout: 15_000 });
  await confirmGroupRound(page);
  await cap.waitForPostCount(2, 45_000);

  for (const post of cap.posts) {
    expect(post.weight_kg).not.toBeNull();
    expect(typeof post.weight_kg).toBe("number");
  }
});

test("QA-LOG-05 S5 Editar datos upsert sin duplicar (API)", async ({ page, request }) => {
  test.setTimeout(240_000);
  const reqCounter = countExecutionPostRequests(page);
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
  await expect.poll(() => reqCounter.count, { timeout: 30_000 }).toBe(1);

  const edit = page.getByRole("button", { name: /Editar datos/i });
  await expect(edit).toBeVisible({ timeout: 15_000 });
  await edit.click();
  await typePeso(page, 0, "62");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await expect.poll(() => reqCounter.count, { timeout: 30_000 }).toBe(2);

  const token = await page.evaluate(() =>
    localStorage.getItem("nexia_token")
  );
  test.skip(!token, "Sin token atleta en localStorage para verificar progress API");

  const apiBase = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://localhost:8000";
  const progressResp = await request.get(
    `${apiBase}/api/v1/athlete/run-context/sessions/${sessionId}/progress`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  expect(progressResp.ok()).toBeTruthy();
  const body = (await progressResp.json()) as {
    steps?: { weight_kg?: number | null; step_key?: string }[];
  };
  expect(body.steps?.length).toBe(1);
  expect(body.steps?.[0]?.weight_kg).toBe(62);
});
