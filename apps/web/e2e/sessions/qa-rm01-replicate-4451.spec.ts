/**
 * qa-rm01-replicate-4451.spec.ts — RM-01 sesión protegida parcial.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

const SESSION_ID = 4451;

test.describe("RM-01 — replicate 4451", () => {
  test("API: protected_session no crea copia ni con force", async () => {
    const { loginTrainerApi } = await import("../fixtures/planning-qa-api");
    const session = await loginTrainerApi();
    const API_BASE =
      process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(
      `${API_BASE}/training-sessions/4451/replicate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_dates: ["2026-10-24"],
          force: true,
        }),
      },
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      created_sessions: unknown[];
      conflicts_skipped?: Array<{ reason?: string }>;
    };
    expect(body.created_sessions.length).toBe(0);
    expect(
      body.conflicts_skipped?.some((c) => c.reason === "protected_session"),
    ).toBe(true);
  });

  test("UI: copy Con registro del atleta al replicar", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
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
      `/dashboard/session-programming/sessions/${SESSION_ID}`,
      { waitUntil: "load" },
    );

    const replicateBtn = page.getByRole("button", {
      name: /replicar|copiar a/i,
    }).first();
    await expect(replicateBtn).toBeVisible({ timeout: 20_000 });
    await replicateBtn.click();

    const weekToggle = page.getByText(/Semana \d+/).first();
    if (await weekToggle.isVisible().catch(() => false)) {
      await weekToggle.click();
    }

    const confirm = page.getByRole("button", {
      name: /replicar|confirmar|sustituir/i,
    }).first();
    if (await confirm.isEnabled().catch(() => false)) {
      await confirm.click();
    }

    await expect(
      page.getByText(/Con registro del atleta: no se modifica/i).or(
        page.getByText(/con registro del atleta/i),
      ),
    ).toBeVisible({ timeout: 25_000 });

    expect(replicatePosts).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: "test-results/qa-rm01-4451-replicate.png",
      fullPage: true,
    });
  });
});
