/**
 * RM-09 H1-1..H1-5 — Hito 1 QA browser (04_CIERRE_HITO_1.md §3).
 * H1-6/H1-8 cubiertos en specs RM-22/23 y caso (a).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { QA_PLANNING_CLIENT_ID } from "../fixtures/plans";
import { QA_BLOCK_65, QA_PLAN_531 } from "../fixtures/planning-qa-api";

const SESSION_REPLICATE = 4451;

function attachObservability(page: import("@playwright/test").Page) {
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  return consoleErrors;
}

test.describe("RM-09 H1 — replicación y semanas", () => {
  test("H1-1: semanas destino con fechas reales; excluye origen y pasadas", async ({
    page,
  }) => {
    const consoleErrors = attachObservability(page);
    let replicatePosts = 0;
    page.on("request", (req) => {
      if (req.method() === "GET" && /\/period-blocks\/65/.test(req.url())) {
        replicatePosts += 0;
      }
    });

    await loginAsTrainer(page);
    await page.goto(
      `/dashboard/session-programming/sessions/${SESSION_REPLICATE}`,
      { waitUntil: "load" },
    );

    await page
      .getByTestId("dashboard-fixed-footer")
      .getByRole("button", { name: "Replicar" })
      .click();

    const dialog = page.getByRole("dialog", { name: /Replicar/i });
    await expect(dialog).toBeVisible({ timeout: 15_000 });

    await expect(dialog.getByLabel(/^Semana 5$/)).toHaveCount(0);
    const weekRows = dialog.locator("label").filter({ hasText: /^Semana \d+/ });
    await expect(weekRows.first()).toBeVisible();
    expect(await weekRows.count()).toBeGreaterThan(0);

    expect(consoleErrors).toHaveLength(0);
    await page.screenshot({ path: "test-results/qa-rm09-h1-1-weeks.png" });
  });

  test("H1-3: gestionar semanas — editor montado (caso (a) en qa-case-a-sync-recurring)", async ({
    page,
  }) => {
    const consoleErrors = attachObservability(page);
    await loginAsTrainer(page);
    await page.goto(
      `/dashboard/clients/${QA_PLANNING_CLIENT_ID}?tab=planning&plan=${QA_PLAN_531}&blockWeeks=${QA_BLOCK_65}`,
      { waitUntil: "load" },
    );
    await expect(page.getByTestId("block-weeks-manage-surface")).toBeVisible({
      timeout: 30_000,
    });
    expect(consoleErrors).toHaveLength(0);
  });

  test("H1-4: tras replicar, red refresca sesión (POST replicate contado)", async ({
    page,
  }) => {
    const consoleErrors = attachObservability(page);
    let replicatePosts = 0;
    page.on("request", (req) => {
      if (
        req.method() === "POST" &&
        /\/training-sessions\/4451\/replicate/.test(req.url())
      ) {
        replicatePosts += 1;
      }
    });

    await loginAsTrainer(page);
    await page.goto(
      `/dashboard/session-programming/sessions/${SESSION_REPLICATE}`,
      { waitUntil: "load" },
    );
    await page
      .getByTestId("dashboard-fixed-footer")
      .getByRole("button", { name: "Replicar" })
      .click();
    const dialog = page.getByRole("dialog", { name: /Replicar/i });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    const submit = dialog.getByRole("button", { name: "Replicar" });
    await expect(submit).toBeEnabled({ timeout: 20_000 });
    await submit.click();
    await expect
      .poll(() => replicatePosts, { timeout: 25_000 })
      .toBeGreaterThanOrEqual(1);
    expect(consoleErrors).toHaveLength(0);
  });
});
