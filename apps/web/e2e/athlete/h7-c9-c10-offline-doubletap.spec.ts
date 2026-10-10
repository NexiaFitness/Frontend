/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-C9 offline (0 POST en red) · QA-H7-C10 doble tap Guardar (≤1 POST).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  openRunForSession,
  trainerCreateSingleExerciseSession,
} from "./h7-helpers";

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
  test.setTimeout(120_000);
  let postCount = 0;
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("response", (r) => {
    if (
      r.request().method() === "POST" &&
      r.url().includes("run-context/executions")
    ) {
      postCount += 1;
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
  const before = postCount;
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await page.waitForTimeout(1200);
  await context.setOffline(false);
  expect(postCount).toBe(before);
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C10 doble tap Guardar", async ({ page }) => {
  test.setTimeout(120_000);
  const posts: unknown[] = [];
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("response", (r) => {
    if (
      r.request().method() === "POST" &&
      r.url().includes("run-context/executions")
    ) {
      try {
        posts.push(r.request().postDataJSON());
      } catch {
        /* ignore */
      }
    }
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
  await page.waitForTimeout(1500);
  expect(posts.length).toBeLessThanOrEqual(1);
  expect(consoleErrors).toHaveLength(0);
});
