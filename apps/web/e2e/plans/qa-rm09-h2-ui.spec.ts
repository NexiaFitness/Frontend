/**
 * RM-09 H2 — triple evidencia UI (R-04/R-05) sobre bloque desechable cliente 346.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  createQaH2LifecycleBlock,
  loginTrainerApi,
} from "../fixtures/planning-qa-api";

test.describe("RM-09 H2 UI — ciclo de vida", () => {
  test("H2-4/H2-5 UI: preview delete + confirmar borrado (R-04, R-05)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    let previewGets = 0;
    let deleteCalls = 0;
    page.on("request", (req) => {
      if (req.method() === "GET" && /deletion-preview/.test(req.url())) {
        previewGets += 1;
      }
      if (req.method() === "DELETE" && /period-blocks/.test(req.url())) {
        deleteCalls += 1;
      }
    });

    const session = await loginTrainerApi();
    const meta = await createQaH2LifecycleBlock(session);

    await loginAsTrainer(page);
    await page.goto(
      `/dashboard/clients/${meta.clientId}?tab=planning&plan=${meta.planId}`,
      { waitUntil: "load" },
    );

    const deleteBtn = page.getByRole("button", {
      name: new RegExp(`Eliminar bloque`, "i"),
    }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 25_000 });
    await deleteBtn.click();

    await expect(
      page.getByRole("dialog").filter({ hasText: /planificadas|borrar|eliminar/i }),
    ).toBeVisible({ timeout: 15_000 });
    expect(previewGets).toBeGreaterThanOrEqual(1);

    const confirm = page
      .getByRole("button", { name: /Eliminar bloque|Confirmar/i })
      .last();
    await confirm.click();
    await expect
      .poll(() => deleteCalls, { timeout: 20_000 })
      .toBeGreaterThanOrEqual(1);

    expect(consoleErrors).toHaveLength(0);
    await page.screenshot({ path: "test-results/qa-rm09-h2-ui-delete.png" });
  });
});
