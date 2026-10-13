/**
 * QA — Edición concurrente REAL (dos pestañas): POST/GET sin duplicados ni pisado silencioso.
 */

import { test, expect, type BrowserContext } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  createSupersetPrescribedWeightSession,
  createSupersetPrescribedWeightRoundsSession,
} from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  confirmGroupRound,
  openRunForSession,
  skipRestIfVisible,
  typePeso,
  typeReps,
} from "./h7-helpers";

async function athletePages(context: BrowserContext) {
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  await loginAsAthlete(pageA);
  await pageB.goto("/dashboard", { waitUntil: "load" });
  return { pageA, pageB };
}

test("2TAB: guardar en B con pesos válidos mientras A vacía peso — A bloqueada, 2 POST solo desde B", async ({
  browser,
}) => {
  test.setTimeout(300_000);
  const { sessionId, name } = await createSupersetPrescribedWeightSession("conflict");
  console.log("SESSION 2TAB conflict", sessionId, name);

  const context = await browser.newContext();
  const { pageA, pageB } = await athletePages(context);
  const capA = attachExecutionRequestCapture(pageA);
  const capB = attachExecutionRequestCapture(pageB);

  await openRunForSession(pageA, sessionId);
  await openRunForSession(pageB, sessionId);

  await expect(pageA.getByRole("textbox", { name: "Peso" })).toHaveCount(2, { timeout: 60_000 });
  await expect(pageB.getByRole("textbox", { name: "Peso" })).toHaveCount(2, { timeout: 60_000 });

  await typePeso(pageA, 0, "30");
  await typePeso(pageA, 1, "20");
  await typeReps(pageA, 0, "10");
  await typeReps(pageA, 1, "12");

  await typePeso(pageB, 0, "32");
  await typePeso(pageB, 1, "22");
  await typeReps(pageB, 0, "10");
  await typeReps(pageB, 1, "12");

  const pesoA = pageA.getByRole("textbox", { name: "Peso" }).first();
  await pesoA.click({ clickCount: 3 });
  await pesoA.fill("");
  await pesoA.blur();

  const confirmB = pageB.getByRole("button", {
    name: /Ronda completada|Dropset completado/i,
  });
  await expect(confirmB).toBeEnabled({ timeout: 15_000 });
  await confirmB.click();
  await capB.waitForPostCount(2, 60_000);
  expect(capA.posts).toHaveLength(0);

  const confirmA = pageA.getByRole("button", {
    name: /Ronda completada|Dropset completado/i,
  });
  await expect(confirmA).toBeDisabled();
  expect(capA.posts).toHaveLength(0);

  expect(capB.posts.map((p) => p.weight_kg).sort()).toEqual([22, 32]);
  const keys = capB.posts.map((p) => p.step_key);
  expect(new Set(keys).size).toBe(2);

  await context.close();
});

test("2TAB offline: cola R1+R2 drena una sola vez con segunda pestaña abierta", async ({
  browser,
}) => {
  test.setTimeout(360_000);
  const { sessionId, name } = await createSupersetPrescribedWeightRoundsSession("2tab-off", 2);
  console.log("SESSION 2TAB offline", sessionId, name);

  const context = await browser.newContext();
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const capA = attachExecutionRequestCapture(pageA);
  const capB = attachExecutionRequestCapture(pageB);
  await loginAsAthlete(pageA);
  await pageB.goto("/dashboard", { waitUntil: "load" });

  await openRunForSession(pageA, sessionId);
  await openRunForSession(pageB, sessionId);
  await expect(pageA.getByRole("heading", { name: /Ronda 1 de 2/i })).toBeVisible({
    timeout: 60_000,
  });

  await context.setOffline(true);

  await typePeso(pageA, 0, "30");
  await typePeso(pageA, 1, "20");
  await typeReps(pageA, 0, "10");
  await typeReps(pageA, 1, "12");
  await confirmGroupRound(pageA);
  expect(capA.posts).toHaveLength(0);

  await skipRestIfVisible(pageA);
  await expect(pageA.getByRole("heading", { name: /Ronda 2 de 2/i })).toBeVisible({
    timeout: 30_000,
  });

  await typePeso(pageA, 0, "28");
  await typePeso(pageA, 1, "18");
  await typeReps(pageA, 0, "10");
  await typeReps(pageA, 1, "12");
  await confirmGroupRound(pageA);
  expect(capA.posts).toHaveLength(0);

  await context.setOffline(false);
  await capA.waitForPostCount(4, 180_000);
  await pageA.waitForTimeout(4_000);

  const merged = [...capA.posts, ...capB.posts];
  expect(merged.length).toBe(4);
  const byKey = new Map<string, number>();
  for (const p of merged) {
    const k = p.step_key ?? "";
    byKey.set(k, (byKey.get(k) ?? 0) + 1);
  }
  expect(byKey.size).toBe(4);
  for (const count of byKey.values()) {
    expect(count).toBe(1);
  }

  await context.close();
});
