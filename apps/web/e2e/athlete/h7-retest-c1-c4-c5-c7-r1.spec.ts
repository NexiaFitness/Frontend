/**
 * H7 E2E — D-LOG-TOUCH-01
 * RETEST post-fix 75593dd: C1, C4, C5, C7, R1 (sesión virgen por caso).
 *
 * @spec docs/atleta/run-logger-touch-merge-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import {
  confirmGroupRound,
  H7_QA_CLIENT_ID,
  openRunForSession,
  startRestAfterFill,
  trainerCreateSessionForClient,
  typePeso,
  typeReps,
} from "./h7-helpers";

test.describe.configure({ mode: "serial" });

async function freshAthleteRun(
  page: import("@playwright/test").Page,
  kind: "superset" | "giant"
) {
  const meta = await trainerCreateSessionForClient(
    page,
    H7_QA_CLIENT_ID,
    kind === "superset" ? "H7 RETEST SS" : "H7 RETEST GIANT",
    kind
  );
  await page.context().clearCookies();
  await loginAsAthlete(page);
  await openRunForSession(page, meta.sessionId);
  return meta;
}

test("QA-H7-C1 superset: peso no revierte al editar reps del otro slot", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await freshAthleteRun(page, "superset");
  await typePeso(page, 0, "33");
  await typePeso(page, 1, "44");
  await typeReps(page, 1, "7");
  const w0 = await page.getByRole("textbox", { name: "Peso" }).nth(0).inputValue();
  const w1 = await page.getByRole("textbox", { name: "Peso" }).nth(1).inputValue();
  expect(w0).toBe("33");
  expect(w1).toBe("44");
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C5 + QA-H7-R1 superset: confirm → overlay descanso", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await freshAthleteRun(page, "superset");
  await typePeso(page, 0, "33");
  await typePeso(page, 1, "44");
  await typeReps(page, 0, "9");
  await startRestAfterFill(page);
  await confirmGroupRound(page);
  await expect(
    page.getByRole("button", { name: /Saltar descanso/i })
  ).toBeVisible({ timeout: 20_000 });
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C4 giant: peso estable al cambiar reps; vacíos sin 0", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await freshAthleteRun(page, "giant");
  await expect(page.getByText(/GIANT SET/i).first()).toBeVisible({ timeout: 60_000 });
  const pesoCount = await page.getByRole("textbox", { name: "Peso" }).count();
  await typePeso(page, 0, "55");
  await typeReps(page, 0, "8");
  expect(await page.getByRole("textbox", { name: "Peso" }).nth(0).inputValue()).toBe(
    "55"
  );
  for (let i = 1; i < pesoCount; i++) {
    const val = await page.getByRole("textbox", { name: "Peso" }).nth(i).inputValue();
    expect(val).not.toBe("0");
  }
  expect(consoleErrors).toHaveLength(0);
});

test("QA-H7-C7 giant: weight_reps sin peso deshabilita Ronda completada (D-LOG-TOUCH-01)", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await freshAthleteRun(page, "giant");
  await expect(page.getByText(/GIANT SET/i).first()).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: /Empezar descanso/i }).click({ timeout: 45_000 });
  const pesoCount = await page.getByRole("textbox", { name: "Peso" }).count();
  for (let i = 0; i < pesoCount; i++) {
    const field = page.getByRole("textbox", { name: "Peso" }).nth(i);
    await field.click({ clickCount: 3 });
    await field.fill("");
    await field.blur();
    expect(await field.inputValue()).toBe("");
  }
  const confirm = page.getByRole("button", { name: /Ronda completada/i });
  await expect(confirm).toBeDisabled();
  expect(consoleErrors).toHaveLength(0);
});
