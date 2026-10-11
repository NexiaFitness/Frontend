/**
 * Fase 4 — POST /run-context/executions por modalidad (sesiones desechables, cliente 346).
 * No usa 4473 (10/10 registered). Conteo vía page.on('request').
 *
 * Timed (amrap/emom/for_time): expectativas documentadas vs código en comentarios H25;
 * prueba UI mínima solo si la sesión se crea en la misma corrida.
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionRequestCapture,
  beginGroupLogging,
  confirmGroupRound,
  countExecutionPostRequests,
  loginAsTrainerFresh,
  openRunForSession,
  trainerCreateSessionForClient,
  trainerCreateSingleExerciseSession,
  trainerCreateSupersetOneRoundSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

test.describe.configure({ mode: "serial" });

test("F4-M1 single_set weight_reps: 1 POST; 0 explícito envía weight_kg 0", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const cap = attachExecutionRequestCapture(page);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "F4-M1-single",
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "0");
  await typeReps(page, 0, "5");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 30_000);
  expect(cap.posts[0]?.weight_kg).toBe(0);
  expect(consoleErrors).toHaveLength(0);
  await page.screenshot({ path: "test-results/qa-f4-m1-single-zero.png" });
});

test("F4-M2 superset: 2 POST (1 por slot) al confirmar ronda", async ({ page }) => {
  test.setTimeout(240_000);
  const counter = countExecutionPostRequests(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSupersetOneRoundSession(
    page,
    H7_QA_CLIENT_ID,
    "F4-M2-ss",
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await typePeso(page, 0, "20");
  await typePeso(page, 1, "22");
  await typeReps(page, 0, "8");
  await typeReps(page, 1, "8");
  await confirmGroupRound(page);
  await expect.poll(() => counter.count, { timeout: 45_000 }).toBe(2);
  await page.screenshot({ path: "test-results/qa-f4-m2-superset.png" });
});

test("F4-M3 dropset: ≥1 POST al confirmar paso (dropset_step)", async ({ page }) => {
  test.setTimeout(240_000);
  const counter = countExecutionPostRequests(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSessionForClient(
    page,
    H7_QA_CLIENT_ID,
    "F4-M3-drop",
    "dropset",
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await beginGroupLogging(page);
  await typePeso(page, 0, "40");
  await typeReps(page, 0, "10");
  await confirmGroupRound(page);
  await expect.poll(() => counter.count, { timeout: 45_000 }).toBeGreaterThanOrEqual(1);
  await page.screenshot({ path: "test-results/qa-f4-m3-dropset.png" });
});

test("F4-M4 giant_set: N POST = slots en ronda (3 ejercicios → 3 POST)", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const counter = countExecutionPostRequests(page);
  await loginAsTrainerFresh(page);
  const { sessionId } = await trainerCreateSessionForClient(
    page,
    H7_QA_CLIENT_ID,
    "F4-M4-giant",
    "giant",
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await typePeso(page, 0, "10");
  await typePeso(page, 1, "12");
  await typePeso(page, 2, "14");
  await typeReps(page, 0, "6");
  await typeReps(page, 1, "6");
  await typeReps(page, 2, "6");
  await beginGroupLogging(page);
  await confirmGroupRound(page);
  await expect.poll(() => counter.count, { timeout: 60_000 }).toBe(3);
  await page.screenshot({ path: "test-results/qa-f4-m4-giant.png" });
});
