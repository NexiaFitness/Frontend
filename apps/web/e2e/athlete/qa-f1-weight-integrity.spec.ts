/**
 * qa-f1-weight-integrity.spec.ts — «Registrar al final»: el peso guardado es el visible.
 *
 * Contexto: F1 (peso no prescrito ni tecleado guardado como 0 kg en serie simple,
 * AMRAP, EMOM y FOR TIME), F3 (0 tecleado pisado por la prescripción), F4 (hueco sin
 * peso descartado en silencio) y F5 (peso heredado visible ≠ guardado). Decisiones:
 * D-LOG-TOUCH-01 (lo tecleado no se pisa; casilla vacía no se guarda) y sección A
 * del prompt de corrección pre-integración (sin peso → weight_kg null; si falta un
 * dato, se bloquea el guardado con aviso).
 *
 * Notas de mantenimiento: sesiones desechables «QA-F1-» en el cliente 346 creadas
 * por API (sin helper UI para AMRAP/EMOM/FOR TIME). Conteo exacto de peticiones
 * POST /run-context/executions con page.on("request"). Requiere backend y frontend
 * de dev y NEXIA_DEMO_PASSWORD / NEXIA_ATHLETE_PASSWORD (backend/.env.qa).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { test, expect, type Page } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { createWeightIntegritySession } from "../fixtures/weight-integrity-qa-api";
import { attachExecutionRequestCapture } from "./h7-helpers";

test.describe.configure({ mode: "serial" });

const BLOCK = { single: 0, superset: 1, amrap: 2, emom: 3, forTime: 4 } as const;

async function openLogMode(page: Page, sessionId: number) {
  await loginAsAthlete(page);
  await page.goto(`/dashboard/sessions/${sessionId}?mode=log`, { waitUntil: "load" });
  const omit = page.getByRole("button", { name: /^Omitir$/ });
  await omit.waitFor({ state: "visible", timeout: 15_000 }).catch(() => undefined);
  if (await omit.isVisible()) await omit.click();
  await expect(page.getByRole("button", { name: /^Acondicionamiento, / }).first()).toBeVisible({
    timeout: 30_000,
  });
}

function sheet(page: Page) {
  return page
    .getByRole("dialog")
    .filter({ has: page.getByRole("button", { name: "Guardar bloque" }) });
}

async function openBlock(page: Page, index: number) {
  await page.getByRole("button", { name: /^Acondicionamiento, / }).nth(index).click();
  await expect(sheet(page)).toBeVisible({ timeout: 15_000 });
}

async function typeInto(page: Page, label: string, nth: number, value: string) {
  const field = sheet(page).getByRole("textbox", { name: label }).nth(nth);
  await field.click({ clickCount: 3 });
  await field.fill(value);
  await field.blur();
}

async function saveBlock(page: Page) {
  await sheet(page).getByRole("button", { name: "Guardar bloque" }).click();
  await page.waitForTimeout(3_000);
}

type Capture = ReturnType<typeof attachExecutionRequestCapture>;

/** Bodies posted since `from`, logged for the report (before/after evidence). */
function postsSince(cap: Capture, from: number, label: string) {
  const slice = cap.posts.slice(from).map((p) => ({
    step_key: p.step_key,
    input_mode: p.input_mode,
    weight_kg: p.weight_kg,
    reps: p.reps,
  }));
  console.log(`POSTS ${label}`, JSON.stringify(slice));
  return slice;
}

async function closeSheetIfOpen(page: Page) {
  if (await sheet(page).isVisible()) await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
}

test("QA-F1 sin peso prescrito: casilla vacía, sin 0 kg en ninguna modalidad (F1/F4)", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createWeightIntegritySession("F1");
  console.log("SESSION F1", sessionId, name);
  await openLogMode(page, sessionId);

  // F1 serie simple: el peso no prescrito ni tecleado se muestra vacío y no se guarda.
  let from = cap.posts.length;
  await openBlock(page, BLOCK.single);
  await expect(sheet(page).getByRole("textbox", { name: "Peso" }).first()).toHaveValue("");
  await saveBlock(page);
  expect(postsSince(cap, from, "single")).toHaveLength(0);
  await expect(sheet(page).getByRole("alert")).toContainText(/peso/i);
  await closeSheetIfOpen(page);

  // F4 superserie: hueco B sin peso → se bloquea con aviso, no se descarta en silencio.
  from = cap.posts.length;
  await openBlock(page, BLOCK.superset);
  await typeInto(page, "Peso", 0, "30");
  await typeInto(page, "Peso", 1, "");
  await saveBlock(page);
  expect(postsSince(cap, from, "superset")).toHaveLength(0);
  await expect(sheet(page).getByRole("alert")).toContainText(/peso/i);
  await closeSheetIfOpen(page);

  // F1 AMRAP: 2 rondas, peso no prescrito → weight_kg null (no 0).
  from = cap.posts.length;
  await openBlock(page, BLOCK.amrap);
  await typeInto(page, "Rondas completas", 0, "2");
  await saveBlock(page);
  const amrap = postsSince(cap, from, "amrap");
  expect(amrap).toHaveLength(1);
  expect(amrap.map((p) => p.weight_kg ?? null)).toEqual([null]);
  await closeSheetIfOpen(page);

  // F1 EMOM: completado → weight_kg null.
  from = cap.posts.length;
  await openBlock(page, BLOCK.emom);
  await sheet(page).getByRole("button", { name: "Sí" }).click();
  await saveBlock(page);
  const emom = postsSince(cap, from, "emom");
  expect(emom).toHaveLength(2);
  expect(emom.map((p) => p.weight_kg ?? null)).toEqual([null, null]);
  await closeSheetIfOpen(page);

  // F1 FOR TIME: 5 min → input_mode duration con weight_kg null.
  from = cap.posts.length;
  await openBlock(page, BLOCK.forTime);
  await typeInto(page, "Minutos", 0, "5");
  await saveBlock(page);
  const forTime = postsSince(cap, from, "for_time");
  expect(forTime).toHaveLength(1);
  expect(forTime.map((p) => [p.input_mode, p.weight_kg ?? null])).toEqual([
    ["duration", null],
  ]);
});

test("QA-F3 0 tecleado con 60 kg prescritos se guarda como 0", async ({ page }) => {
  test.setTimeout(180_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createWeightIntegritySession("F3", {
    singlePrescribedWeight: 60,
  });
  console.log("SESSION F3", sessionId, name);
  await openLogMode(page, sessionId);

  await openBlock(page, BLOCK.single);
  await typeInto(page, "Peso", 0, "0");
  await saveBlock(page);
  const posts = postsSince(cap, 0, "F3");
  expect(posts.map((p) => p.weight_kg)).toEqual([0, 60]);
});

test("QA-F5 el peso heredado visible en la serie 2 es el que se guarda", async ({ page }) => {
  test.setTimeout(180_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createWeightIntegritySession("F5");
  console.log("SESSION F5", sessionId, name);
  await openLogMode(page, sessionId);

  await openBlock(page, BLOCK.single);
  await typeInto(page, "Peso", 0, "60");
  const visibleSet2 = await sheet(page).getByRole("textbox", { name: "Peso" }).nth(1).inputValue();
  console.log("VISIBLE F5 set2", visibleSet2);
  await saveBlock(page);
  const posts = postsSince(cap, 0, "F5");
  expect(visibleSet2).toBe("60");
  expect(posts.map((p) => p.weight_kg)).toEqual([60, 60]);
});
