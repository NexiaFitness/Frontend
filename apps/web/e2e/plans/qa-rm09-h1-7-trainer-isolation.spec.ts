/**
 * RM-09 H1-7 — entrenador otro tenant: 403 replicate + ciclo de vida bloque ajeno.
 * Fuente: 08_SPEC §5.3 · test_block_lifecycle.py · test_session_replication_rules.py
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer2 } from "../fixtures/trainer2-auth";

const DEMO_SESSION = 4451;
const DEMO_PLAN = 531;
const DEMO_BLOCK = 65;
const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

test.describe("RM-09 H1-7 — aislamiento tenant entrenador", () => {
  test("UI+red+consola: 403 replicate y lifecycle sobre plan ajeno", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const statusByUrl: Array<{ url: string; status: number }> = [];
    page.on("response", (res) => {
      const url = res.url();
      if (
        /\/training-sessions\/4451/.test(url) ||
        /\/period-blocks\/65/.test(url)
      ) {
        statusByUrl.push({ url, status: res.status() });
      }
    });

    await loginAsTrainer2(page);

    await page.goto(
      `/dashboard/session-programming/sessions/${DEMO_SESSION}`,
      { waitUntil: "load" },
    );

    await expect(
      page.getByRole("heading", { name: /Sin permiso para esta sesión/i }),
    ).toBeVisible({ timeout: 20_000 });

    const token = await page.evaluate(() =>
      localStorage.getItem("nexia_token"),
    );
    expect(token).toBeTruthy();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const replicate = await page.request.post(
      `${API_BASE}/training-sessions/${DEMO_SESSION}/replicate`,
      {
        headers,
        data: { target_week_ordinals: [6], force: false },
      },
    );
    expect(replicate.status()).toBe(403);

    const preview = await page.request.get(
      `${API_BASE}/training-plans/${DEMO_PLAN}/period-blocks/${DEMO_BLOCK}/deletion-preview`,
      { headers },
    );
    expect(preview.status()).toBe(403);

    const archive = await page.request.post(
      `${API_BASE}/training-plans/${DEMO_PLAN}/period-blocks/${DEMO_BLOCK}/archive`,
      { headers },
    );
    expect(archive.status()).toBe(403);

    const reactivate = await page.request.post(
      `${API_BASE}/training-plans/${DEMO_PLAN}/period-blocks/${DEMO_BLOCK}/reactivate`,
      { headers },
    );
    expect(reactivate.status()).toBe(403);

    const forbidden = statusByUrl.filter((r) => r.status === 403);
    expect(forbidden.length).toBeGreaterThanOrEqual(1);

    expect(
      consoleErrors.filter((e) => !/403|Forbidden|failed to load/i.test(e)),
    ).toHaveLength(0);

    await page.screenshot({
      path: "test-results/qa-rm09-h1-7-trainer2-403.png",
      fullPage: true,
    });
  });
});
