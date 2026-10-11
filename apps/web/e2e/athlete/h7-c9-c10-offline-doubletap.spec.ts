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

function isExecutionPost(url: string, method: string) {
  return method === "POST" && url.includes("run-context/executions");
}

test("QA-H7-C9 offline no duplicate POST", async ({ page, context }) => {
  test.setTimeout(180_000);
  let responsePostCount = 0;
  const requestBodies: unknown[] = [];
  const responseBodies: unknown[] = [];
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (/ERR_INTERNET_DISCONNECTED|ERR_FAILED|Failed to load resource/.test(text)) {
      return;
    }
    consoleErrors.push(text);
  });
  page.on("request", (req) => {
    if (isExecutionPost(req.url(), req.method())) {
      try {
        const raw = req.postData();
        if (raw) requestBodies.push(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  });
  page.on("response", async (r) => {
    const req = r.request();
    if (!isExecutionPost(req.url(), req.method())) return;
    if (r.status() >= 200 && r.status() < 300) {
      responsePostCount += 1;
      try {
        responseBodies.push(await r.json());
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
  await context.setOffline(true);
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("39");
  const responsesBefore = responsePostCount;
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await page.waitForTimeout(1500);
  expect(responsePostCount).toBe(responsesBefore);
  expect(requestBodies.length).toBeGreaterThanOrEqual(1);

  await context.setOffline(false);
  await expect
    .poll(() => responsePostCount, { timeout: 45_000 })
    .toBe(responsesBefore + 1);

  const lastReq = requestBodies[requestBodies.length - 1] as {
    weight_kg?: number;
  };
  expect(lastReq?.weight_kg).toBe(39);
  expect(responsePostCount).toBe(1);
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C10 doble tap Guardar", async ({ page }) => {
  test.setTimeout(120_000);
  const posts: unknown[] = [];
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (/ERR_INTERNET_DISCONNECTED|ERR_FAILED|Failed to load resource/.test(text)) {
      return;
    }
    consoleErrors.push(text);
  });
  page.on("response", (r) => {
    if (
      r.request().method() === "POST" &&
      r.url().includes("run-context/executions") &&
      r.status() >= 200 &&
      r.status() < 300
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
  await page.waitForTimeout(2000);
  expect(posts.length).toBe(1);
  expect(consoleErrors).toHaveLength(0);
});
