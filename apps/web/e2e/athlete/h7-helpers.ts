/**
 * H7 E2E — D-LOG-TOUCH-01 (logger touch merge)
 * Helpers: sesiones RM-13, captura POST Playwright, flujo run atleta.
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 * Cliente QA: Diana (346). Credenciales: backend/.env.qa
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

export const H7_QA_CLIENT_ID = 346;

export type H7SessionKind = "superset" | "giant" | "dropset";

export type H7SessionMeta = {
  sessionId: number;
  sessionName: string;
  createdAt: string;
  note: string;
  kind?: H7SessionKind;
};

export function sessionMetaPath(kind: H7SessionKind): string {
  return path.join(process.cwd(), "e2e", "athlete", `h7-qa-session-${kind}.meta.json`);
}

/** @deprecated use sessionMetaPath('superset') */
export const H7_SESSION_META_PATH = sessionMetaPath("superset");

export function loadH7SessionMeta(kind: H7SessionKind = "superset"): H7SessionMeta {
  const raw = fs.readFileSync(sessionMetaPath(kind), "utf8");
  return JSON.parse(raw) as H7SessionMeta;
}

export function writeH7SessionMeta(meta: H7SessionMeta, kind: H7SessionKind): void {
  const filePath = sessionMetaPath(kind);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ ...meta, kind }, null, 2));
}

export type ExecutionPost = {
  weight_kg?: number | null;
  reps?: number | null;
  step_key?: string;
  exercise_id?: number;
};

export function attachExecutionCapture(page: Page) {
  const posts: ExecutionPost[] = [];
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const onResponse = (resp: Response) => {
    const req = resp.request();
    if (
      req.method() === "POST" &&
      req.url().includes("/athlete/run-context/executions")
    ) {
      try {
        const raw = req.postData();
        if (raw) posts.push(JSON.parse(raw) as ExecutionPost);
      } catch {
        /* ignore */
      }
    }
  };

  page.on("response", onResponse);

  return {
    posts,
    consoleErrors,
    detach: () => page.off("response", onResponse),
    waitForAtLeastPosts: async (min: number, timeoutMs = 25_000) => {
      const start = Date.now();
      while (posts.length < min && Date.now() - start < timeoutMs) {
        await page.waitForTimeout(200);
      }
    },
  };
}

export async function typePeso(page: Page, index: number, value: string) {
  const field = page.getByRole("textbox", { name: "Peso" }).nth(index);
  await field.click({ clickCount: 3 });
  await field.fill(value);
  await field.blur();
}

export async function typeReps(page: Page, index: number, value: string) {
  const field = page.getByRole("textbox", { name: "Repeticiones" }).nth(index);
  await field.click({ clickCount: 3 });
  await field.fill(value);
  await field.blur();
}

export async function openRunForSession(page: Page, sessionId: number) {
  await page.goto(`/dashboard/sessions/${sessionId}/run`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(600);
}

export async function beginGroupLogging(page: Page) {
  const start = page.getByRole("button", {
    name: /Empezar descanso|Registrar dropset/i,
  });
  await expect(start).toBeEnabled({ timeout: 45_000 });
  await start.click();
  await page.waitForTimeout(400);
}

export async function startRestAfterFill(page: Page) {
  const start = page.getByRole("button", { name: /Empezar descanso/i });
  await expect(start).toBeEnabled({ timeout: 45_000 });
  await start.click();
  await page.waitForTimeout(400);
}

export async function confirmGroupRound(page: Page) {
  const btn = page.getByRole("button", {
    name: /Ronda completada|Dropset completado/i,
  });
  await expect(btn).toBeEnabled({ timeout: 15_000 });
  await btn.click();
  await page.waitForTimeout(500);
}

export async function skipRestIfVisible(page: Page) {
  const skip = page.getByRole("button", { name: /Saltar descanso/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(400);
  }
}

function constructorCard(page: Page, groupBadge: string) {
  return page.locator("[data-constructor-row-id]").filter({ hasText: groupBadge });
}

export async function trainerAddFuerzaBlock(page: Page) {
  const chip = page.getByRole("button", { name: "Fuerza máxima" });
  await chip.scrollIntoViewIfNeeded();
  await chip.click({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Tipo de serie" }).first()).toBeVisible({
    timeout: 15_000,
  });
}

export async function trainerConfigureModality(
  page: Page,
  cardIndex: number,
  setTypeLabel: "Superset" | "Giant Set" | "Dropset",
  groupBadge: string,
  roundsLabel: "Series" | "Rondas",
  rounds: string,
  exercisePickerStartIndex: number,
  exerciseCount: number
) {
  await page.getByRole("button", { name: "Tipo de serie" }).nth(cardIndex).click();
  await page.getByRole("option", { name: setTypeLabel, exact: true }).click();
  const card = constructorCard(page, groupBadge);
  const roundsInput = card
    .locator("span")
    .filter({ hasText: new RegExp(`^${roundsLabel}$`) })
    .locator("xpath=following-sibling::*//input")
    .first();
  await roundsInput.fill(rounds);
  for (let i = 0; i < exerciseCount; i++) {
    await card.getByRole("button", { name: /Buscar ejercicio/i }).first().click();
    const pickerBtn = page
      .locator("div.space-y-0\\.5 button")
      .filter({ hasNot: page.getByText("LESION") })
      .nth(exercisePickerStartIndex + i);
    await pickerBtn.click({ timeout: 20_000 });
    await page.waitForTimeout(250);
  }
}

export async function trainerCreateSessionForClient(
  page: Page,
  clientId: number,
  sessionNamePrefix: string,
  kind: H7SessionKind
): Promise<H7SessionMeta> {
  const today = new Date().toISOString().slice(0, 10);
  await page.goto(
    `/dashboard/session-programming/create-session?clientId=${clientId}&date=${today}`
  );
  await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });

  const sessionName = `${sessionNamePrefix} ${Date.now()}`;
  await page.getByPlaceholder(/ej: fuerza/i).fill(sessionName);
  await trainerAddFuerzaBlock(page);

  if (kind === "superset") {
    await trainerConfigureModality(
      page,
      0,
      "Superset",
      "SUPERSET A",
      "Series",
      "2",
      0,
      2
    );
  } else if (kind === "giant") {
    await trainerConfigureModality(
      page,
      0,
      "Giant Set",
      "GIANT SET A",
      "Rondas",
      "2",
      0,
      3
    );
  } else {
    await trainerConfigureModality(
      page,
      0,
      "Dropset",
      "DROP SET A",
      "Rondas",
      "2",
      0,
      1
    );
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
  const sessionId = Number(match![1]);

  const meta: H7SessionMeta = {
    sessionId,
    sessionName,
    createdAt: new Date().toISOString(),
    note: `RM-13: sesión H7 QA desechable (${kind}) — no borrar hasta reset dev`,
    kind,
  };
  writeH7SessionMeta(meta, kind);
  return meta;
}
