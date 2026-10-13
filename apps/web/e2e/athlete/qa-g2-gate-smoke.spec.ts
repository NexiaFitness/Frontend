/**
 * Gate G2 — R3 Editar datos + evidencia modalidades vía qa-f1-weight-integrity (misma corrida gate).
 */
import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { createQaRestSingleSetSession } from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  dismissMobileNavDialog,
  openRunForSession,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("G2 guided R3 Editar datos: overlay → logger → Guardar, POST 2xx", async ({ page }) => {
  test.setTimeout(180_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId } = await createQaRestSingleSetSession("G2-R3");
  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await dismissMobileNavDialog(page);
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  await typePeso(page, 0, "40");
  await typeReps(page, 0, "8");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await expect(page.getByRole("button", { name: /Editar datos/i })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: /Editar datos/i }).click();
  await expect(page.getByRole("button", { name: /^Guardar$/i })).toBeVisible();
  const before = cap.posts.length;
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(before + 1, 45_000);
  console.log("G2 R3 rejected", JSON.stringify(cap.rejected));
  expect(cap.rejected).toEqual([]);
});
