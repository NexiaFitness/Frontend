/**
 * qa-rm01-replicate-4451.spec.ts — RM-01 sesión protegida parcial.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";

const SESSION_ID = 4451;

test.use({ viewport: { width: 1280, height: 800 } });

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

  test("UI: copy protegida y fechas omitidas (D10)", async ({ page }) => {
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

    const footerReplicar = page
      .getByTestId("dashboard-fixed-footer")
      .getByRole("button", { name: "Replicar" });
    await footerReplicar.scrollIntoViewIfNeeded();
    await footerReplicar.click();

    const replicateDialog = page.getByRole("dialog", {
      name: /Replicar/i,
    });
    await expect(replicateDialog).toBeVisible({ timeout: 15_000 });

    await replicateDialog.getByRole("button", { name: "Replicar" }).click();

    const conflictModal = page.getByRole("dialog", {
      name: "Semanas que ya tienen sesión",
    });
    const outcomeToast = page.getByRole("alert");

    await expect
      .poll(async () => {
        if (await conflictModal.isVisible().catch(() => false)) return "conflict";
        const toastVisible = await outcomeToast
          .filter({ hasText: /replicad|modificado|sesión/i })
          .first()
          .isVisible()
          .catch(() => false);
        return toastVisible ? "toast" : "pending";
      }, { timeout: 25_000 })
      .not.toBe("pending");

    if (await conflictModal.isVisible()) {
      await expect(
        conflictModal.getByText(/Con registro del atleta — no se modifican/i),
      ).toBeVisible();
      await expect(
        conflictModal.getByText(/Con registro del atleta: no se modifica/i).first(),
      ).toBeVisible();
      if (
        (await conflictModal.getByText(/Fechas pasadas — no se replican/i).count()) >
        0
      ) {
        await expect(
          conflictModal.getByText(/Fecha anterior a hoy: no se replica/i).first(),
        ).toBeVisible();
      }
    } else {
      const toast = outcomeToast.filter({ hasText: /registro del atleta/i });
      await expect(toast).toBeVisible();
      await expect(toast).toContainText(/registro del atleta/i);
      // D-REP-6: el modal solo ofrece semanas con fecha ≥ hoy; 4451 → solo protected en toast.
    }

    expect(replicatePosts).toBe(1);

    await page.screenshot({
      path: "test-results/qa-rm01-4451-replicate-ui.png",
      fullPage: true,
    });
  });
});
