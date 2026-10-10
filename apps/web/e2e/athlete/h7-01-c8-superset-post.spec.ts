/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-C8-superset: POST weight_kg = UI (teclado real, listener red).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 * Precondición: h7-00 (meta `h7-qa-session-superset.meta.json`).
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  attachExecutionCapture,
  confirmGroupRound,
  loadH7SessionMeta,
  openRunForSession,
  startRestAfterFill,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-H7-C8-superset POST weight_kg = UI", async ({ page }) => {
  test.setTimeout(90_000);
  const { sessionId } = loadH7SessionMeta("superset");
  const cap = attachExecutionCapture(page);
  const consoleErrors = cap.consoleErrors;

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);

  await typePeso(page, 0, "33");
  await typePeso(page, 1, "44");
  await typeReps(page, 1, "7");
  await startRestAfterFill(page);

  const w0 = await page.getByRole("textbox", { name: "Peso" }).nth(0).inputValue();
  const w1 = await page.getByRole("textbox", { name: "Peso" }).nth(1).inputValue();
  expect(w0).toBe("33");
  expect(w1).toBe("44");

  const postWait = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      r.url().includes("run-context/executions"),
    { timeout: 25_000 }
  );
  await confirmGroupRound(page);
  await postWait;
  await cap.waitForAtLeastPosts(2, 25_000);
  cap.detach();

  const weights = cap.posts.map((p) => p.weight_kg);
  expect(weights).toContain(33);
  expect(weights).toContain(44);
  expect(consoleErrors.join("; ") || "sin errores").toMatch(/sin errores|^$/);
});
