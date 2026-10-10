/**
 * H7 E2E — D-LOG-TOUCH-01
 * QA-H7-00: setup trainer — sesión superset única (cliente 346).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  H7_QA_CLIENT_ID,
  trainerCreateSessionForClient,
} from "./h7-helpers";

test.describe("H7 trainer setup", () => {
  test("create QA superset-only session", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsTrainer(page);
    const meta = await trainerCreateSessionForClient(
      page,
      H7_QA_CLIENT_ID,
      "H7 SUPERSET",
      "superset"
    );
    await page.goto(`/dashboard/clients/${H7_QA_CLIENT_ID}?tab=sessions`);
    await expect(page.getByText(meta.sessionName).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
