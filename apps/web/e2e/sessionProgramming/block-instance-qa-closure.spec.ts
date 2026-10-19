/**
 * QA cierre — instancia de bloque (Hipertrofia × N, create flow normal, plantilla, réplica).
 * Evidencia: docs/sessionProgramming/qa-evidence-2026-10-19/
 *
 * Requiere: BE :8000, FE baseURL, NEXIA_DEMO_PASSWORD (o backend/.env.qa vía script).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  constructorSingleSetCards,
  loginAsTrainerFresh,
  trainerSetSingleCardSeriesCount,
} from "../athlete/h7-helpers";

const QA_CLIENT_ID = 346;
const EVIDENCE_DIR = path.resolve(
  __dirname,
  "../../../../docs/sessionProgramming/qa-evidence-2026-10-19"
);

function evidencePath(name: string): string {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  return path.join(EVIDENCE_DIR, name);
}

async function collapseSidePanels(page: import("@playwright/test").Page) {
  const navDialog = page.getByRole("dialog").filter({ hasText: "Navegación" });
  if (await navDialog.isVisible().catch(() => false)) {
    await navDialog.getByRole("button", { name: /cerrar/i }).click().catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
  }
  const volumePanel = page.getByRole("button", {
    name: /Series de hoy vs objetivo del día/i,
  });
  if (await volumePanel.getAttribute("aria-expanded").catch(() => null) === "true") {
    await volumePanel.click().catch(() => {});
  }
}

async function trainerAddHipertrofiaBlock(page: import("@playwright/test").Page) {
  await collapseSidePanels(page);
  let chip = page.getByRole("button", { name: /^Hipertrofia$/i });
  if (!(await chip.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: /Añadir cualidad/i }).click();
    chip = page.getByRole("button", { name: /^Hipertrofia$/i });
  }
  await chip.scrollIntoViewIfNeeded();
  await chip.click({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Tipo de serie" }).first()).toBeVisible({
    timeout: 20_000,
  });
}

async function pickExerciseFromPicker(
  page: import("@playwright/test").Page,
  pickerIndex: number
) {
  const pickerBtn = page
    .locator("div.space-y-0\\.5 button")
    .filter({ hasNot: page.getByText("LESION") })
    .nth(pickerIndex);
  await pickerBtn.click({ timeout: 25_000 });
  await page.waitForTimeout(300);
}

async function fillFirstRowExercise(
  page: import("@playwright/test").Page,
  pickerIndex: number
) {
  const card = constructorSingleSetCards(page).first();
  await card.getByRole("button", { name: /Buscar ejercicio/i }).click();
  await pickExerciseFromPicker(page, pickerIndex);
}

async function addExerciseRows(
  page: import("@playwright/test").Page,
  count: number,
  pickerStartIndex: number
) {
  for (let i = 0; i < count; i++) {
    await page.getByRole("button", { name: /^Añadir ejercicio$/i }).first().click();
    await page.waitForTimeout(200);
    const cards = constructorSingleSetCards(page);
    const n = await cards.count();
    const card = cards.nth(Math.max(0, n - 1));
    await card.getByRole("button", { name: /Buscar ejercicio/i }).click();
    await pickExerciseFromPicker(page, pickerStartIndex + i);
  }
}

async function createSessionAndLandReview(
  page: import("@playwright/test").Page
): Promise<number> {
  await page.getByRole("button", { name: /crear sesión/i }).click();
  await page.waitForTimeout(2500);
  const entendido = page.getByRole("button", { name: /entendido/i });
  if (await entendido.isVisible().catch(() => false)) await entendido.click();
  await expect(page).toHaveURL(/session-programming\/sessions\/\d+\/review/, {
    timeout: 45_000,
  });
  const match = page.url().match(/sessions\/(\d+)\/review/);
  expect(match?.[1]).toBeTruthy();
  return Number(match![1]);
}

test.describe("QA cierre — block instance (browser)", () => {
  test.setTimeout(600_000);

  test("Hipertrofia ×4 create → atleta → edit → setType → dup rows → plantilla → réplica", async ({
    page,
  }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    await loginAsTrainerFresh(page);
    await page.goto(
      `/dashboard/session-programming/create-session?clientId=${QA_CLIENT_ID}&sessionKind=standalone&date=${dateStr}`
    );
    await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });

    const sessionName = `QA BlockInst ${Date.now()}`;
    await page.getByPlaceholder(/ej: fuerza/i).fill(sessionName);

    await trainerAddHipertrofiaBlock(page);
    await fillFirstRowExercise(page, 0);
    await addExerciseRows(page, 3, 1);

    const cards = constructorSingleSetCards(page);
    await expect(cards).toHaveCount(4, { timeout: 10_000 });

    await trainerSetSingleCardSeriesCount(cards.first(), "3");
    const weightInput = cards
      .first()
      .locator('input[inputmode="decimal"], input[type="number"]')
      .first();
    if (await weightInput.isVisible().catch(() => false)) {
      await weightInput.fill("40");
    }

    await page.screenshot({
      path: evidencePath("create-hipertrofia-4-constructor.png"),
      fullPage: true,
    });

    const sessionId = await createSessionAndLandReview(page);
    fs.writeFileSync(
      evidencePath("qa-block-instance-session.meta.json"),
      JSON.stringify({ sessionId, sessionName, dateStr }, null, 2)
    );

    await page.screenshot({
      path: evidencePath(`review-session-${sessionId}.png`),
      fullPage: true,
    });

    await loginAsAthlete(page);
    await page.goto(`/dashboard/sessions/${sessionId}`);
    await expect(page.getByText(/Hipertrofia/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/4 ejercicios/i).first()).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: evidencePath(`athlete-hipertrofia-4-ejercicios-${sessionId}.png`),
      fullPage: true,
    });

    await loginAsTrainerFresh(page);
    await page.goto(`/dashboard/session-programming/sessions/${sessionId}/edit`);
    await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });
    const editCards = constructorSingleSetCards(page);
    await expect(editCards).toHaveCount(4, { timeout: 15_000 });

    const restInput = editCards
      .first()
      .getByLabel(/descanso/i)
      .or(editCards.first().locator('input[placeholder*="descanso" i]'))
      .first();
    if (await restInput.isVisible().catch(() => false)) {
      await restInput.fill("90");
    } else {
      await editCards
        .first()
        .locator("input")
        .filter({ has: page.locator("xpath=..") })
        .last()
        .fill("90")
        .catch(() => {});
    }

    await page.getByRole("button", { name: /guardar/i }).click();
    await page.waitForTimeout(2000);
    const entendidoSave = page.getByRole("button", { name: /entendido/i });
    if (await entendidoSave.isVisible().catch(() => false)) await entendidoSave.click();

    await page.goto(`/dashboard/session-programming/sessions/${sessionId}/edit`);
    await expect(constructorSingleSetCards(page)).toHaveCount(4, { timeout: 15_000 });
    await page.screenshot({
      path: evidencePath(`edit-reopen-${sessionId}.png`),
      fullPage: true,
    });

    const dupCard = constructorSingleSetCards(page).first();
    await dupCard.getByRole("button", { name: /Buscar ejercicio/i }).click();
    const firstExName = await dupCard
      .locator('[class*="font-medium"]')
      .first()
      .textContent()
      .catch(() => "");
    await pickExerciseFromPicker(page, 0);
    await trainerSetSingleCardSeriesCount(dupCard, "2");
    const dupWeight = dupCard.locator('input[inputmode="decimal"], input[type="number"]').first();
    await dupWeight.fill("55");
    await page.getByRole("button", { name: /^Añadir ejercicio$/i }).first().click();
    const secondDup = constructorSingleSetCards(page).nth(1);
    await secondDup.getByRole("button", { name: /Buscar ejercicio/i }).click();
    await pickExerciseFromPicker(page, 0);
    const dupWeight2 = secondDup.locator('input[inputmode="decimal"], input[type="number"]').first();
    await dupWeight2.fill("30");

    await page.getByRole("button", { name: /guardar/i }).click();
    await page.waitForTimeout(2000);
    if (await entendidoSave.isVisible().catch(() => false)) await entendidoSave.click();

    await page.goto(`/dashboard/session-programming/sessions/${sessionId}/edit`);
    const afterDup = constructorSingleSetCards(page);
    await expect(afterDup).toHaveCount(5, { timeout: 15_000 });
    const w0 = await afterDup.nth(0).locator('input[inputmode="decimal"], input[type="number"]').first().inputValue();
    const w1 = await afterDup.nth(1).locator('input[inputmode="decimal"], input[type="number"]').first().inputValue();
    expect(w0).not.toBe(w1);

    await page.getByRole("button", { name: "Tipo de serie" }).first().click();
    await page.getByRole("option", { name: "Giant Set", exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/GIANT SET/i).first()).toBeVisible({ timeout: 10_000 });
    const giantCards = page.locator("[data-constructor-row-id]");
    const giantCount = await giantCards.count();
    expect(giantCount).toBeGreaterThanOrEqual(4);
    await page.screenshot({
      path: evidencePath(`settype-giant-${sessionId}.png`),
      fullPage: true,
    });

    await page.getByRole("button", { name: /guardar/i }).click();
    await page.waitForTimeout(2000);
    if (await entendidoSave.isVisible().catch(() => false)) await entendidoSave.click();
    await page.goto(`/dashboard/session-programming/sessions/${sessionId}/edit`);
    await expect(page.getByText(/GIANT SET/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Tipo de serie" }).first().click();
    await page.getByRole("option", { name: "Serie simple", exact: true }).click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: evidencePath(`settype-single-unwrap-${sessionId}.png`),
      fullPage: true,
    });

    await page.getByRole("button", { name: /guardar como plantilla/i }).click();
    const templateName = `QA Plantilla BlockInst ${Date.now()}`;
    await page.getByPlaceholder(/plantilla/i).fill(templateName);
    await page.getByRole("button", { name: /guardar plantilla/i }).click();
    await page.waitForTimeout(1500);

    await page.goto(
      `/dashboard/session-programming/create-session?clientId=${QA_CLIENT_ID}&sessionKind=standalone&date=${dateStr}`
    );
    await page.getByRole("button", { name: /sesión desde plantilla/i }).click();
    await page.getByText(templateName).click();
    await expect(constructorSingleSetCards(page)).toHaveCount(4, { timeout: 20_000 });
    await page.screenshot({
      path: evidencePath(`template-hydrate-${sessionId}.png`),
      fullPage: true,
    });

    await page.goto(`/dashboard/session-programming/sessions/${sessionId}/review`);
    await page.getByRole("button", { name: /replicar/i }).first().click();
    await page.waitForTimeout(500);
    const weekCheckbox = page.getByRole("checkbox").first();
    if (await weekCheckbox.isVisible().catch(() => false)) {
      await weekCheckbox.check();
    }
    await page.getByRole("button", { name: /replicar sesión/i }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: evidencePath(`replicate-flow-${sessionId}.png`),
      fullPage: true,
    });
  });
});
