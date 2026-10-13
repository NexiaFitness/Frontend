/**
 * QA — Edición concurrente REAL (dos pestañas): POST/GET sin duplicados ni pisado silencioso.
 *
 * Notas (2026-10-13, integracion): con el candado entre pestanas (fb50129) drena la cola la pestana
 * que obtiene el lock, A o B. El escenario offline cuenta los POST de ambas pestanas y comprueba en
 * servidor; esperar 4 POST solo en A fallaba ~3/5 con 0 POST aunque B ya habia enviado los 4.
 */

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
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

const API_BASE = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function registeredWeightsOnServer(page: Page, sessionId: number): Promise<Map<string, number | null>> {
  const token = await page.evaluate(() => localStorage.getItem("nexia_token"));
  const res = await fetch(`${API_BASE}/athlete/run-context/sessions/${sessionId}/progress`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });
  expect(res.ok).toBeTruthy();
  const body = (await res.json()) as { steps: { step_key: string; status: string; weight_kg?: number | null }[] };
  return new Map(
    body.steps.filter((s) => s.status === "registered").map((s) => [s.step_key, s.weight_kg ?? null])
  );
}

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
  // Drena la pestana que obtiene el candado (A o B): se esperan 4 POST entre ambas.
  await expect
    .poll(() => capA.posts.length + capB.posts.length, { timeout: 180_000 })
    .toBeGreaterThanOrEqual(4);
  await pageA.waitForTimeout(4_000);

  const merged = [...capA.posts, ...capB.posts];
  console.log("2TAB offline POST por pestana", { A: capA.posts.length, B: capB.posts.length });
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

  const onServer = await registeredWeightsOnServer(pageA, sessionId);
  expect(onServer.size).toBe(4);
  expect([...onServer.values()].sort()).toEqual([18, 20, 28, 30]);

  await context.close();
});
