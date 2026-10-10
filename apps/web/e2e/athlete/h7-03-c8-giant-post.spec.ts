/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-C8-giant: sesión giant-only + POST weight_kg = UI (flujo único).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  attachExecutionCapture,
  confirmGroupRound,
  H7_QA_CLIENT_ID,
  openRunForSession,
  startRestAfterFill,
  trainerCreateSessionForClient,
  typePeso,
  typeReps,
  writeH7SessionMeta,
} from "./h7-helpers";

test("QA-H7-C8-giant POST weight_kg = UI", async ({ page }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await loginAsTrainer(page);
  const meta = await trainerCreateSessionForClient(
    page,
    H7_QA_CLIENT_ID,
    "H7 GIANT",
    "giant"
  );
  writeH7SessionMeta(meta, "giant");

  await page.context().clearCookies();
  const cap = attachExecutionCapture(page);
  await loginAsAthlete(page);
  await openRunForSession(page, meta.sessionId);

  await expect(page.getByText(/GIANT SET/i).first()).toBeVisible({ timeout: 60_000 });

  const pesoCount = await page.getByRole("textbox", { name: "Peso" }).count();
  const weights = ["55", "56", "57"].slice(0, Math.max(pesoCount, 1));
  for (let i = 0; i < weights.length; i++) {
    await typePeso(page, i, weights[i]!);
  }
  if (pesoCount > 1) await typeReps(page, 1, "6");

  for (let i = 0; i < weights.length; i++) {
    expect(await page.getByRole("textbox", { name: "Peso" }).nth(i).inputValue()).toBe(
      weights[i]
    );
  }

  await startRestAfterFill(page);
  const postWait = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      r.url().includes("run-context/executions"),
    { timeout: 25_000 }
  );
  await confirmGroupRound(page);
  await postWait;
  await cap.waitForAtLeastPosts(1, 25_000);
  cap.detach();

  expect(cap.posts.some((p) => p.weight_kg === Number(weights[0]))).toBe(true);
  expect(consoleErrors.join("; ") || "sin errores").toMatch(/sin errores|^$/);
});
