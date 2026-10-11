/**
 * qa-case-a-sync-recurring.spec.ts — Caso (a) D-REP-6: editar semana tipo en bloque en marcha.
 *
 * Datos: bloque 65 (plan 531, cliente 346) — estructura; sin borrar sesiones con registro.
 * Motivo no API nueva en 346: solape/422 con plan activo; bloque 84 (Nov) sin semanas terminadas.
 * RM-13: bloque desechable estructural id 84 en plan 531 si se creó en la pasada.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  ensureClientPlanningTab,
  QA_PLANNING_CLIENT_ID,
} from "../fixtures/plans";
import {
  countClientSessionsBeforeDate,
  loginTrainerApi,
} from "../fixtures/planning-qa-api";

const QA_PLAN_ID = 531;
const QA_BLOCK_IN_PROGRESS_ID = 65;
const TODAY_YMD = "2026-10-11";

const META_PATH = path.join(
  process.cwd(),
  ".playwright-qa",
  "qa-case-a-meta.json",
);

function trackSyncRecurringPosts(page: import("@playwright/test").Page) {
  let count = 0;
  page.on("request", (req) => {
    if (
      req.method() === "POST" &&
      /\/weekly-structure\/sync-recurring/.test(req.url())
    ) {
      count += 1;
    }
  });
  return () => count;
};

test.describe("Caso (a) — sync-recurring semana tipo", () => {
  test.beforeAll(async () => {
    const session = await loginTrainerApi();
    const sessionsBefore = await countClientSessionsBeforeDate(
      session,
      QA_PLANNING_CLIENT_ID,
      TODAY_YMD,
    );
    fs.mkdirSync(path.dirname(META_PATH), { recursive: true });
    fs.writeFileSync(
      META_PATH,
      JSON.stringify(
        {
          planId: QA_PLAN_ID,
          blockId: QA_BLOCK_IN_PROGRESS_ID,
          clientId: QA_PLANNING_CLIENT_ID,
          sessionsBeforeToday: sessionsBefore,
          note: "Estructura bloque 65; no tocar sesiones con registro atleta",
        },
        null,
        2,
      ),
    );
  });

  test("1 POST sync-recurring, sin error espejo, semanas pasadas sin Restaurar", async ({
    page,
  }) => {
    page.on("dialog", (d) => d.accept());
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await loginAsTrainer(page);
    await ensureClientPlanningTab(
      page,
      QA_PLANNING_CLIENT_ID,
      QA_PLAN_ID,
    );

    const getSyncCount = trackSyncRecurringPosts(page);

    await page.goto(
      `/dashboard/clients/${QA_PLANNING_CLIENT_ID}?tab=planning&plan=${QA_PLAN_ID}&blockWeeks=${QA_BLOCK_IN_PROGRESS_ID}`,
      { waitUntil: "load" },
    );

    await expect(page.getByTestId("block-weeks-manage-surface")).toBeVisible({
      timeout: 25_000,
    });

    const finishedBadge = page.getByText("Semana pasada").first();
    await expect(finishedBadge).toBeVisible({ timeout: 15_000 });

    const pasadaSection = page
      .locator("div")
      .filter({ hasText: "Semana pasada" })
      .first();
    await expect(
      pasadaSection.getByRole("button", { name: /Restaurar semana tipo/i }),
    ).toHaveCount(0);

    const week1Header = page.getByRole("button", { name: /Semana 1/i }).first();
    await week1Header.click();

    const editDay = page.getByRole("button", { name: /^Editar$/i }).first();
    await editDay.click();

    const patternToggle = page
      .locator("button")
      .filter({ hasText: /empuje|tirón|sentadilla|horizontal/i })
      .first();
    if (await patternToggle.isVisible().catch(() => false)) {
      await patternToggle.click();
    }

    const cerrar = page.getByRole("button", { name: /^Cerrar$/i });
    if (await cerrar.isVisible().catch(() => false)) {
      await cerrar.click();
    }

    const saveBtn = page.getByRole("button", { name: /Guardar semanas/i });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
    await saveBtn.click();

    await expect(
      page.getByText(/El servidor no reflejó los cambios/i),
    ).toHaveCount(0, { timeout: 15_000 });

    await expect(
      page.getByText(/Semanas guardadas correctamente|Fase guardada/i),
    ).toBeVisible({ timeout: 20_000 });

    expect(getSyncCount()).toBe(1);

    const session = await loginTrainerApi();
    const sessionsAfter = await countClientSessionsBeforeDate(
      session,
      QA_PLANNING_CLIENT_ID,
      TODAY_YMD,
    );
    const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8")) as {
      sessionsBeforeToday: number;
    };
    expect(sessionsAfter).toBe(meta.sessionsBeforeToday);

    const skippedToast = page.getByText(/Semana ya terminada: no se modifica/i);
    if (await skippedToast.isVisible().catch(() => false)) {
      await expect(skippedToast).toBeVisible();
    }

    expect(consoleErrors.join("\n")).not.toMatch(/403|500/);

    await page.screenshot({
      path: "test-results/qa-case-a-sync-recurring-pass.png",
      fullPage: true,
    });
  });
});
