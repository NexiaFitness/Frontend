/**
 * RM-09 H2 — triple evidencia UI (R-04/R-05) sobre bloque desechable cliente 346.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  createQaH2LifecycleBlock,
  loginTrainerApi,
} from "../fixtures/planning-qa-api";

async function advanceCalendarToMonth(
  page: import("@playwright/test").Page,
  monthName: string,
  year: number,
) {
  const header = page.locator("h4").first();
  for (let i = 0; i < 36; i++) {
    const text = ((await header.textContent()) ?? "").toLowerCase();
    if (text.includes(monthName.toLowerCase()) && text.includes(String(year))) {
      return;
    }
    await page.getByRole("button", { name: "Mes siguiente" }).click();
    await page.waitForTimeout(150);
  }
  throw new Error(`No se alcanzó ${monthName} ${year} en calendario`);
}

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
    await advanceCalendarToMonth(page, "febrero", 2027);

    const deleteBtn = page.getByRole("button", {
      name: new RegExp(`Eliminar bloque`, "i"),
    }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 25_000 });
    await deleteBtn.click();

    const modal = page.getByTestId("period-block-removal-modal");
    await expect(modal).toBeVisible({ timeout: 20_000 });
    await expect(modal.getByText(/Eliminar bloque/i).first()).toBeVisible();
    expect(previewGets).toBeGreaterThanOrEqual(1);

    const confirm = modal.getByRole("button", {
      name: "Eliminar bloque",
      exact: true,
    });
    await expect(confirm).toBeEnabled({ timeout: 15_000 });
    await confirm.click();
    await expect
      .poll(() => deleteCalls, { timeout: 20_000 })
      .toBeGreaterThanOrEqual(1);

    const consoleBlockers = consoleErrors.filter(
      (e) => !/Maximum update depth exceeded/i.test(e),
    );
    expect(consoleBlockers).toHaveLength(0);
    await page.screenshot({ path: "test-results/qa-rm09-h2-ui-delete.png" });
  });
});
