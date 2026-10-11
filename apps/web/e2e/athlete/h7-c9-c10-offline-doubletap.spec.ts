/**
 * H7 E2E — D-LOG-TOUCH-01 / D-LOG-INTEGRITY-01 H3
 * QA-H7-C9 offline queue sync · QA-H7-C10 doble tap Guardar (exactamente 1 POST).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  countExecutionPostRequests,
  isRunContextExecutionPost,
  openRunForSession,
  trainerCreateSingleExerciseSession,
} from "./h7-helpers";

const ALLOWED_CONSOLE_ERROR = /ERR_INTERNET_DISCONNECTED|ERR_FAILED|Failed to load resource/;

async function createSingleSession(page: import("@playwright/test").Page) {
  const meta = await trainerCreateSingleExerciseSession(
    page,
    H7_QA_CLIENT_ID,
    "H7 SINGLE"
  );
  await page.context().clearCookies();
  return meta.sessionId;
}

test("QA-H7-C9 offline no duplicate POST", async ({ page, context }) => {
  test.setTimeout(180_000);
  const reqCounter = countExecutionPostRequests(page);
  const requestBodies: unknown[] = [];
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (ALLOWED_CONSOLE_ERROR.test(text)) return;
    consoleErrors.push(text);
  });
  page.on("request", (req) => {
    if (!isRunContextExecutionPost(req.url(), req.method())) return;
    try {
      const raw = req.postData();
      if (raw) requestBodies.push(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  });
  const sessionId = await createSingleSession(page);
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({
    timeout: 45_000,
  });
  await context.setOffline(true);
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("39");
  const postsBefore = reqCounter.count;
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await page.waitForTimeout(1500);
  expect(reqCounter.count).toBe(postsBefore);

  await context.setOffline(false);
  await expect.poll(() => reqCounter.count, { timeout: 60_000 }).toBe(1);

  const synced = requestBodies.find(
    (b) => (b as { weight_kg?: number }).weight_kg === 39
  );
  expect(synced).toBeTruthy();
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C10 doble tap Guardar", async ({ page }) => {
  test.setTimeout(120_000);
  const reqCounter = countExecutionPostRequests(page);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (ALLOWED_CONSOLE_ERROR.test(text)) return;
    consoleErrors.push(text);
  });

  const sessionId = await createSingleSession(page);
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({
    timeout: 45_000,
  });
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("41");
  const btn = page.getByRole("button", { name: /^Guardar$/i });
  await btn.dblclick();
  await page.waitForTimeout(2000);
  expect(reqCounter.count).toBe(1);
  expect(consoleErrors).toHaveLength(0);
});
