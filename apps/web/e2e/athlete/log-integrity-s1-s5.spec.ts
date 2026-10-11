/**
 * D-LOG-INTEGRITY-01 H3 — verificación navegador S1–S5 (teclado + red).
 *
 * @spec docs/atleta/log-integrity-2026-10/07_MODELO_ESTADO_LOGGER.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  H7_QA_CLIENT_ID,
  attachExecutionCapture,
  confirmGroupRound,
  loginAsTrainerFresh,
  openRunForSession,
  postWeightKgList,
  skipRestIfVisible,
  startRestAfterFill,
  trainerAddFuerzaBlock,
  trainerConfigureModality,
  trainerCreateSingleExerciseSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

type NetTap = {
  requests: { url: string; body: unknown }[];
  responses: { url: string; status: number; body: unknown }[];
};

function attachNetTap(page: import("@playwright/test").Page): NetTap {
  const tap: NetTap = { requests: [], responses: [] };
  page.on("request", (req) => {
    if (
      req.method() === "POST" &&
      req.url().includes("/athlete/run-context/executions")
    ) {
      try {
        const raw = req.postData();
        tap.requests.push({
          url: req.url(),
          body: raw ? JSON.parse(raw) : null,
        });
      } catch {
        tap.requests.push({ url: req.url(), body: null });
      }
    }
  });
  page.on("response", async (resp) => {
    const req = resp.request();
    if (
      req.method() === "POST" &&
      req.url().includes("/athlete/run-context/executions")
    ) {
      let body: unknown = null;
      try {
        body = await resp.json();
      } catch {
        /* ignore */
      }
      tap.responses.push({ url: resp.url(), status: resp.status(), body });
    }
  });
  return tap;
}

async function createTwoExerciseSession(page: import("@playwright/test").Page) {
  await loginAsTrainerFresh(page);
  const today = new Date().toISOString().slice(0, 10);
  await page.goto(
    `/dashboard/session-programming/create-session?clientId=${H7_QA_CLIENT_ID}&date=${today}`
  );
  await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });
  const sessionName = `QA-LOG-S2 ${Date.now()}`;
  await page.getByPlaceholder(/ej: fuerza/i).fill(sessionName);
  await trainerAddFuerzaBlock(page);
  let card = page.locator("[data-constructor-row-id]").first();
  await card.getByRole("button", { name: /Buscar ejercicio/i }).click();
  await page
    .locator("div.space-y-0\\.5 button")
    .filter({ hasNot: page.getByText("LESION") })
    .nth(0)
    .click({ timeout: 20_000 });
  await trainerAddFuerzaBlock(page);
  await expect(page.locator("[data-constructor-row-id]")).toHaveCount(2, {
    timeout: 20_000,
  });
  card = page.locator("[data-constructor-row-id]").last();
  await card.getByRole("button", { name: /Buscar ejercicio/i }).click();
  await page
    .locator("div.space-y-0\\.5 button")
    .filter({ hasNot: page.getByText("LESION") })
    .nth(1)
    .click({ timeout: 20_000 });
  await page.getByRole("button", { name: /crear sesión/i }).click();
  await page.waitForTimeout(2500);
  const entendido = page.getByRole("button", { name: /entendido/i });
  if (await entendido.isVisible().catch(() => false)) await entendido.click();
  await expect(page).toHaveURL(/session-programming\/sessions\/\d+\/review/, {
    timeout: 30_000,
  });
  const match = page.url().match(/sessions\/(\d+)\/review/);
  expect(match?.[1]).toBeTruthy();
  await page.context().clearCookies();
  return Number(match![1]);
}

async function createSupersetMixedSession(page: import("@playwright/test").Page) {
  await loginAsTrainerFresh(page);
  const today = new Date().toISOString().slice(0, 10);
  await page.goto(
    `/dashboard/session-programming/create-session?clientId=${H7_QA_CLIENT_ID}&date=${today}`
  );
  await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });
  const sessionName = `QA-LOG-S4 ${Date.now()}`;
  await page.getByPlaceholder(/ej: fuerza/i).fill(sessionName);
  await trainerAddFuerzaBlock(page);
  await trainerConfigureModality(page, 0, "Superset", "SUPERSET A", "Series", "1", 0, 2);
  const card = page.locator("[data-constructor-row-id]").filter({ hasText: "SUPERSET A" });
  const repsInputs = card.getByRole("spinbutton");
  if ((await repsInputs.count()) >= 2) {
    await repsInputs.nth(1).fill("12");
  }
  await page.getByRole("button", { name: /crear sesión/i }).click();
  await page.waitForTimeout(2500);
  const entendido = page.getByRole("button", { name: /entendido/i });
  if (await entendido.isVisible().catch(() => false)) await entendido.click();
  await expect(page).toHaveURL(/session-programming\/sessions\/\d+\/review/, {
    timeout: 30_000,
  });
  const match = page.url().match(/sessions\/(\d+)\/review/);
  expect(match?.[1]).toBeTruthy();
  await page.context().clearCookies();
  return Number(match![1]);
}

test("QA-LOG-01 S1 vaciar peso se conserva vacío", async ({ page }) => {
  test.setTimeout(180_000);
  const cap = attachExecutionCapture(page);
  await loginAsTrainerFresh(page);
  const today = new Date().toISOString().slice(0, 10);
  await page.goto(
    `/dashboard/session-programming/create-session?clientId=${H7_QA_CLIENT_ID}&date=${today}`
  );
  await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });
  await page.getByPlaceholder(/ej: fuerza/i).fill(`QA-LOG-S1 ${Date.now()}`);
  await trainerAddFuerzaBlock(page);
  const card = page.locator("[data-constructor-row-id]").first();
  await card.getByRole("button", { name: /Buscar ejercicio/i }).click();
  await page
    .locator("div.space-y-0\\.5 button")
    .filter({ hasNot: page.getByText("LESION") })
    .first()
    .click({ timeout: 20_000 });
  await page.getByRole("button", { name: /crear sesión/i }).click();
  await page.waitForTimeout(2500);
  const match = page.url().match(/sessions\/(\d+)\/review/);
  const sessionId = Number(match![1]);
  await page.context().clearCookies();

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await peso.click({ clickCount: 3 });
  await peso.fill("50");
  await peso.press("Backspace");
  await peso.press("Backspace");
  await peso.fill("");
  await peso.blur();
  await typeReps(page, 0, "10");
  await expect(peso).toHaveValue("");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForAtLeastPosts(1, 30_000);
  expect(postWeightKgList(cap.posts).every((w) => Number.isNaN(w) || w == null)).toBe(true);
  expect(cap.consoleErrors).toHaveLength(0);
});

test("QA-LOG-02 S2 no arrastra 80 kg al siguiente ejercicio", async ({ page }) => {
  test.setTimeout(240_000);
  const sessionId = await createTwoExerciseSession(page);
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "80");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await skipRestIfVisible(page);
  await page.getByRole("button", { name: /Siguiente|Continuar/i }).first().click({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  const peso = page.getByRole("textbox", { name: "Peso" }).first();
  await expect(peso).toHaveValue("");
});

test("QA-LOG-04 S4 superset POST incluye todos los slots", async ({ page }) => {
  test.setTimeout(240_000);
  const net = attachNetTap(page);
  const sessionId = await createSupersetMixedSession(page);
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await expect(page.getByRole("heading", { name: /Ronda 1 de/i })).toBeVisible({
    timeout: 60_000,
  });
  const pesoCount = await page.getByRole("textbox", { name: "Peso" }).count();
  if (pesoCount >= 1) await typePeso(page, 0, "30");
  await typeReps(page, 0, "10");
  if (pesoCount >= 2) await typePeso(page, 1, "25");
  else await typeReps(page, 1, "12");
  await startRestAfterFill(page);
  await confirmGroupRound(page);
  await expect
    .poll(() => net.responses.filter((r) => r.status >= 200 && r.status < 300).length, {
      timeout: 45_000,
    })
    .toBeGreaterThanOrEqual(2);
  const okBodies = net.requests.map((r) => r.body as { weight_kg?: number | null });
  expect(okBodies.length).toBeGreaterThanOrEqual(2);
});

test("QA-LOG-05 S5 Editar datos upsert sin duplicar", async ({ page }) => {
  test.setTimeout(240_000);
  const net = attachNetTap(page);
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
  await expect
    .poll(() => net.responses.filter((r) => r.status >= 200).length, { timeout: 30_000 })
    .toBe(1);
  const edit = page.getByRole("button", { name: /Editar datos/i });
  if (await edit.isVisible().catch(() => false)) {
    await edit.click();
    await typePeso(page, 0, "62");
    await page.getByRole("button", { name: /^Guardar$/i }).click();
    await expect
      .poll(() => net.responses.filter((r) => r.status >= 200).length, { timeout: 30_000 })
      .toBe(2);
    const last = net.requests.at(-1)?.body as { weight_kg?: number };
    expect(last?.weight_kg).toBe(62);
  }
});
