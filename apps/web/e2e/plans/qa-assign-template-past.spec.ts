/**
 * QA pasada 2 — assign template con start_date pasado (API) y preview UI (D-REP-6).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  loginTrainerApi,
  QA_DISPOSABLE_CLIENT_ID,
} from "../fixtures/planning-qa-api";

const TEMPLATE_ID = 45;
const PAST_START = "2026-08-01";

test.describe("Assign template — sessions_skipped_past", () => {
  test("API: assign-preview y assign coinciden (start_date pasado)", async () => {
    const session = await loginTrainerApi();
    const API_BASE =
      process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    };

    const previewRes = await fetch(
      `${API_BASE}/training-plans/templates/${TEMPLATE_ID}/program/assign-preview`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          client_id: QA_DISPOSABLE_CLIENT_ID,
          start_date: PAST_START,
        }),
      },
    );
    expect(previewRes.ok).toBe(true);
    const preview = (await previewRes.json()) as {
      sessions_skipped_past?: number;
      end_date: string;
    };

    const assignRes = await fetch(
      `${API_BASE}/training-plans/templates/${TEMPLATE_ID}/assign`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          client_id: QA_DISPOSABLE_CLIENT_ID,
          start_date: PAST_START,
          name: `QA assign parity ${Date.now()}`,
          confirm_assignment_overlap: true,
        }),
      },
    );
    expect(assignRes.status).toBe(201);
    const assign = (await assignRes.json()) as {
      sessions_skipped_past?: number;
      computed_end_date: string;
    };

    expect(preview.sessions_skipped_past).toBeGreaterThan(0);
    expect(assign.sessions_skipped_past).toBe(preview.sessions_skipped_past);
    expect(assign.computed_end_date).toBe(preview.end_date);
  });

  test("UI: assign-preview al elegir fecha (min=hoy; aviso past solo si preview > 0)", async ({
    page,
  }) => {
    let previewPosts = 0;
    page.on("request", (req) => {
      if (
        req.method() === "POST" &&
        /\/templates\/45\/program\/assign-preview/.test(req.url())
      ) {
        previewPosts += 1;
      }
    });

    await loginAsTrainer(page);
    await page.goto(`/dashboard/training-plans/templates/${TEMPLATE_ID}`, {
      waitUntil: "load",
    });

    await page.getByRole("button", { name: /asignar a cliente/i }).click();
    const dialog = page.getByRole("dialog", { name: /asignar plantilla a cliente/i });
    await expect(dialog).toBeVisible({ timeout: 15_000 });

    await dialog.getByRole("button", { name: "Cliente" }).click();
    await page.getByRole("option", { name: /Carlos QA Segundo/i }).click();

    await dialog.locator('input[type="date"]').fill("2026-10-11");
    await expect(dialog.getByText(/4 semanas|2026-11-07|nov/i)).toBeVisible({
      timeout: 20_000,
    });

    expect(previewPosts).toBeGreaterThanOrEqual(1);

    await page.screenshot({
      path: "test-results/qa-assign-template-preview-ui.png",
      fullPage: true,
    });
  });
});
