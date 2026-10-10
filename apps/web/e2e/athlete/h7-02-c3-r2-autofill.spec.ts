/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-C3: R2 autofill local R1 no pisa tocado (misma sesión navegador tras C8).
 *
 * Regla: 02_DECISIONES_PRODUCTO.md §6 — R2 autofill desde R1 en campos no tocados.
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 * Precondición: ejecutar justo después de h7-01 en la misma sesión QA superset.
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  confirmGroupRound,
  loadH7SessionMeta,
  openRunForSession,
  skipRestIfVisible,
  startRestAfterFill,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-H7-C3 R2 autofill local R1 no pisa tocado", async ({ page }) => {
  test.setTimeout(120_000);
  const { sessionId } = loadH7SessionMeta("superset");
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await expect(page.getByRole("heading", { name: /Ronda \d de/i })).toBeVisible({
    timeout: 60_000,
  });

  for (let step = 0; step < 4; step++) {
    if (await page.getByRole("heading", { name: /Ronda 2 de/i }).isVisible()) break;
    await skipRestIfVisible(page);
    if (await page.getByRole("heading", { name: /Ronda 1 de/i }).isVisible()) {
      await typePeso(page, 0, "33");
      await typePeso(page, 1, "44");
      await typeReps(page, 1, "7");
      await startRestAfterFill(page);
      await confirmGroupRound(page);
      continue;
    }
    await page.waitForTimeout(400);
  }

  await expect(page.getByRole("heading", { name: /Ronda 2 de/i })).toBeVisible({
    timeout: 45_000,
  });

  await typePeso(page, 1, "52");
  await typeReps(page, 0, "9");

  const w0 = await page.getByRole("textbox", { name: "Peso" }).nth(0).inputValue();
  const w1 = await page.getByRole("textbox", { name: "Peso" }).nth(1).inputValue();
  expect(w0).toBe("33");
  expect(w1).toBe("52");
  expect(consoleErrors.length).toBe(0);
});
