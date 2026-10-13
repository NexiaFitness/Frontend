/**
 * Diagnóstico puntual MOD-09: sin dismiss nav/PWA — registra POST executions 2xx vs no-2xx.
 * Ejecutar solo en gate publicación; no sustituye qa-mod09-run-guided.spec.ts.
 */
import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { createMod09RunSession } from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  openRunForSession,
  typeReps,
} from "./h7-helpers";

test("DIAG MOD-09 sin dismiss: POST executions status y body", async ({ page }) => {
  test.setTimeout(120_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createMod09RunSession("diag-422");
  console.log("DIAG SESSION", sessionId, name);

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  // Sin dismissMobileNavDialog a propósito.

  await expect(page.getByRole("textbox", { name: "Repeticiones" }).first()).toBeVisible({
    timeout: 60_000,
  });
  await typeReps(page, 0, "12");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await page.waitForTimeout(8_000);

  console.log("DIAG posts 2xx", cap.posts.length, JSON.stringify(cap.posts));
  console.log("DIAG rejected", JSON.stringify(cap.rejected));

  for (const r of cap.rejected) {
    console.log(`DIAG FAIL status=${r.status} body=${r.body} payload=${JSON.stringify(r.payload)}`);
  }
  // No assert: este spec solo recoge evidencia para el informe gate.
});
