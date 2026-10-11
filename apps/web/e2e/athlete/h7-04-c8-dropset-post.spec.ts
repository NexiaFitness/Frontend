/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-C8-dropset: sesión dropset-only + POST weight_kg = UI (flujo único).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  attachExecutionCapture,
  beginGroupLogging,
  confirmGroupRound,
  H7_QA_CLIENT_ID,
  openRunForSession,
  postWeightKgList,
  trainerCreateSessionForClient,
  typePeso,
  typeReps,
  writeH7SessionMeta,
} from "./h7-helpers";

test("QA-H7-C8-dropset POST weight_kg = UI", async ({ page }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const meta = await trainerCreateSessionForClient(
    page,
    H7_QA_CLIENT_ID,
    "H7 DROPSET",
    "dropset"
  );
  writeH7SessionMeta(meta, "dropset");

  await page.context().clearCookies();
  const cap = attachExecutionCapture(page);
  await loginAsAthlete(page);
  await openRunForSession(page, meta.sessionId);

  await expect(page.getByText(/DROP SET|Dropset/i).first()).toBeVisible({
    timeout: 60_000,
  });

  await beginGroupLogging(page);
  await typePeso(page, 0, "48");
  await typeReps(page, 0, "9");
  expect(await page.getByRole("textbox", { name: "Peso" }).nth(0).inputValue()).toBe(
    "48"
  );

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

  const weightedPosts = cap.posts.filter(
    (p) => p.weight_kg != null && !Number.isNaN(p.weight_kg)
  );
  expect(weightedPosts.length).toBeGreaterThanOrEqual(1);
  expect(weightedPosts.some((p) => p.weight_kg === 48)).toBe(true);
  expect(consoleErrors).toHaveLength(0);
});
