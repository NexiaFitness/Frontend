/**
 * D-LOG-INTEGRITY-01 H3 — F sesión sin fecha: NO ALCANZABLE por UI (constructor).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainerFresh, H7_QA_CLIENT_ID } from "./h7-helpers";

test("QA-LOG-F fecha obligatoria en constructor (sin sesión null por UI)", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await loginAsTrainerFresh(page);
  await page.goto(
    `/dashboard/session-programming/create-session?clientId=${H7_QA_CLIENT_ID}`
  );
  await expect(page.getByPlaceholder(/ej: fuerza/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Fecha *").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Seleccionar fecha/i })).toBeVisible();
});
