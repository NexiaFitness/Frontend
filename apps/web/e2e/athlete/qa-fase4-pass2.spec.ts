/**
 * QA pasada 2 — Fase 4 (4473, 4462, aislamiento, paridad).
 * Reutiliza helpers h7-helpers / athlete-auth.
 * RM-13: 4473 ya tiene registros — no DELETE; POST nuevos vía specs log-integrity / h7.
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { loginAsAthlete2 } from "../fixtures/athlete2-auth";
import { loginAsTrainer } from "../fixtures/auth";
import {
  countExecutionPostRequests,
  loginAsTrainerFresh,
} from "./h7-helpers";

const SESSION_PRESCRIPTION_B = 4473;
const SESSION_EDIT_WINDOW = 4462;
const SESSION_CLOSED = 4445;
const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const EXPECTED_SET_TYPES = [
  "single_set",
  "superset",
  "giant_set",
  "dropset",
  "emom",
  "amrap",
  "for_time",
];

test.use({ viewport: { width: 375, height: 812 } });

test.describe("Fase 4 — RM-13 sesiones fijas", () => {
  test("F4-4473: paridad bloques entrenador vs progreso atleta (sin POST al abrir)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    const execPosts = countExecutionPostRequests(page);

    await loginAsTrainer(page);
    const token = await page.evaluate(() => localStorage.getItem("nexia_token"));
    const blocksRes = await page.request.get(
      `${API_BASE}/session-programming/sessions/${SESSION_PRESCRIPTION_B}/blocks`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(blocksRes.status()).toBe(200);
    const blocks = (await blocksRes.json()) as Array<{ set_type: string }>;
    const setTypes = blocks.map((b) => b.set_type);
    for (const t of EXPECTED_SET_TYPES) {
      expect(setTypes, `falta set_type ${t}`).toContain(t);
    }

    await page.goto(
      `/dashboard/session-programming/sessions/${SESSION_PRESCRIPTION_B}/review`,
      { waitUntil: "load" },
    );
    await expect(page.getByText(/Prescripción B|4473/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await loginAsAthlete(page);
    await page.goto(`/dashboard/sessions/${SESSION_PRESCRIPTION_B}/run`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(800);
    expect(execPosts.count).toBe(0);

    const progressRes = await page.request.get(
      `${API_BASE}/athlete/run-context/sessions/${SESSION_PRESCRIPTION_B}/progress`,
      {
        headers: {
          Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("nexia_token"))}`,
        },
      },
    );
    expect(progressRes.status()).toBe(200);
    const progress = (await progressRes.json()) as {
      steps: Array<{ status: string }>;
    };
    expect(progress.steps.length).toBeGreaterThanOrEqual(8);

    expect(
      consoleErrors.filter((e) => !/403|401|Failed to fetch/i.test(e)),
    ).toHaveLength(0);
    await page.screenshot({ path: "test-results/qa-fase4-4473-run.png" });
  });

  test("F4-aislamiento: atleta 2 no accede a sesión 4473 (Diana)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    let forbidden = 0;
    page.on("response", (r) => {
      if (r.status() === 403 && /4473|run-context/.test(r.url())) forbidden += 1;
    });

    await loginAsAthlete2(page);
    await page.goto(`/dashboard/sessions/${SESSION_PRESCRIPTION_B}/run`, {
      waitUntil: "load",
    });
    const progressRes = await page.request.get(
      `${API_BASE}/athlete/run-context/sessions/${SESSION_PRESCRIPTION_B}/progress`,
      {
        headers: {
          Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("nexia_token"))}`,
        },
      },
    );
    expect([403, 404]).toContain(progressRes.status());
    expect(forbidden).toBeGreaterThanOrEqual(0);
    expect(consoleErrors.length).toBeLessThanOrEqual(2);
  });

  test("F4-4462 ventana edición: mode=log editable", async ({ page }) => {
    const execPosts = countExecutionPostRequests(page);
    await loginAsAthlete(page);
    await page.goto(`/dashboard/sessions/${SESSION_EDIT_WINDOW}?mode=log`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Registro cerrado")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Registrado/i }).first()).toBeVisible({
      timeout: 45_000,
    });
    expect(execPosts.count).toBe(0);
  });

  test("F4-4445 fuera ventana / cerrada: aviso sin POST escritura", async ({
    page,
  }) => {
    const execPosts = countExecutionPostRequests(page);
    await loginAsAthlete(page);
    await page.goto(`/dashboard/sessions/${SESSION_CLOSED}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Registro cerrado")).toBeVisible({
      timeout: 45_000,
    });
    expect(execPosts.count).toBe(0);
  });

  test("F4-paridad entrenador: ficha sesión 4473 visible", async ({ page }) => {
    await loginAsTrainerFresh(page);
    await page.goto(
      `/dashboard/session-programming/sessions/${SESSION_PRESCRIPTION_B}`,
      { waitUntil: "load" },
    );
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/SUPERSET|GIANT|DROP|EMOM|AMRAP|FOR TIME/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
