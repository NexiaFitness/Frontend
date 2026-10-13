/**
 * Evidencia 5× — drenaje offline 2 pestañas (informe QA; no alterar cola offline).
 */

import { test, expect } from "@playwright/test";
import { createSupersetPrescribedWeightRoundsSession } from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  confirmGroupRound,
  openRunForSession,
  skipRestIfVisible,
  typePeso,
  typeReps,
} from "./h7-helpers";

for (let run = 1; run <= 5; run += 1) {
  test(`2TAB-OFFLINE-EV-${run}/5: POST al reconectar (segunda pestaña abierta)`, async ({
    browser,
  }) => {
    test.setTimeout(360_000);
    const { sessionId, name } = await createSupersetPrescribedWeightRoundsSession(
      `ev-${run}`,
      2,
    );
    console.log(`EV-${run} SESSION`, sessionId, name);

    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    const cap = attachExecutionRequestCapture(pageA);
    const { loginAsAthlete } = await import("../fixtures/athlete-auth");
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
    expect(cap.posts.length).toBe(0);

    await skipRestIfVisible(pageA);
    await expect(pageA.getByRole("heading", { name: /Ronda 2 de 2/i })).toBeVisible({
      timeout: 30_000,
    });
    await typePeso(pageA, 0, "28");
    await typePeso(pageA, 1, "18");
    await typeReps(pageA, 0, "10");
    await typeReps(pageA, 1, "12");
    await confirmGroupRound(pageA);
    expect(cap.posts.length).toBe(0);

    await context.setOffline(false);
    const start = Date.now();
    while (cap.posts.length < 4 && Date.now() - start < 180_000) {
      await pageA.waitForTimeout(500);
    }
    console.log(
      `EV-${run} POST_COUNT`,
      cap.posts.length,
      JSON.stringify(
        cap.posts.map((p) => ({
          step_key: p.step_key,
          weight_kg: p.weight_kg,
          input_mode: p.input_mode,
        })),
      ),
    );
    expect(cap.posts.length).toBe(4);
    await context.close();
  });
}
