/**
 * qa-rm22-repeat-week.spec.ts — RM-22 repetir semana bloque 65 (real, sin mock).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { QA_PLANNING_CLIENT_ID } from "../fixtures/plans";
import {
  QA_BLOCK_65,
  QA_PLAN_531,
  apiRepeatWeek,
  loginTrainerApi,
} from "../fixtures/planning-qa-api";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("RM-22 — repetir semana", () => {
  test("API: weeks_skipped past_target_date en semanas terminadas", async () => {
    const session = await loginTrainerApi();
    const { status, body } = await apiRepeatWeek(
      session,
      QA_PLAN_531,
      QA_BLOCK_65,
      1,
      [2, 3],
      false,
    );
    expect(status).toBe(200);
    const out = body as {
      weeks_skipped?: Array<{ week_ordinal: number; reason: string }>;
    };
    expect(out.weeks_skipped?.length).toBeGreaterThan(0);
    expect(out.weeks_skipped?.every((w) => w.reason === "past_target_date")).toBe(
      true,
    );
  });

  test("API: 409 sin force cuando hay sesiones en semana destino", async () => {
    const session = await loginTrainerApi();
    const { status, body } = await apiRepeatWeek(
      session,
      QA_PLAN_531,
      QA_BLOCK_65,
      1,
      [4],
      false,
    );
    expect(status).toBe(409);
    expect(JSON.stringify(body)).toMatch(/force=true/i);
  });

  test("UI: 409 sin force — conflicto en modal Repetir", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    let repeatPosts = 0;
    page.on("request", (req) => {
      if (
        req.method() === "POST" &&
        /\/weekly-structure\/weeks\/\d+\/repeat/.test(req.url())
      ) {
        repeatPosts += 1;
      }
    });

    await loginAsTrainer(page);
    await page.goto(
      `/dashboard/clients/${QA_PLANNING_CLIENT_ID}?tab=planning&plan=${QA_PLAN_531}&blockWeeks=${QA_BLOCK_65}`,
      { waitUntil: "load" },
    );

    const editor = page.getByTestId("weekly-structure-editor");
    await expect(editor).toBeVisible({ timeout: 30_000 });

    const repeatFooterBtn = editor
      .getByTestId("dashboard-fixed-footer")
      .getByRole("button", { name: "Repetir" });
    await repeatFooterBtn.scrollIntoViewIfNeeded();
    await expect(repeatFooterBtn).toBeEnabled({ timeout: 15_000 });
    await repeatFooterBtn.click();

    const repeatDialog = page.getByRole("dialog", { name: /^Repetir/i });
    await expect(repeatDialog).toBeVisible({ timeout: 10_000 });

    await repeatDialog
      .locator("label")
      .filter({ hasText: /^Semana 4\b/ })
      .click();
    await repeatDialog.getByRole("button", { name: "Repetir semana" }).click();

    await expect(repeatDialog.getByText("Conflicto detectado")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      repeatDialog.getByText(/Sobrescribir semanas existentes/i),
    ).toBeVisible();

    expect(repeatPosts).toBe(1);

    await page.screenshot({
      path: "test-results/qa-rm22-repeat-409-ui.png",
      fullPage: true,
    });
  });
});
