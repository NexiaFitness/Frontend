/**
 * QA-G2-MOD-09 (S4) — reps_only y duration en run guiado: POST exactos, sin weight_kg 0 inventado.
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { createMod09RunSession } from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  confirmGroupRound,
  dismissMobileNavDialog,
  openRunForSession,
  skipRestIfVisible,
  typeReps,
} from "./h7-helpers";

test.describe.configure({ mode: "serial" });

function assertNoInventedWeight(posts: { weight_kg?: number | null; input_mode?: string }[]) {
  for (const p of posts) {
    if (p.input_mode === "reps_only" || p.input_mode === "duration") {
      expect(p.weight_kg ?? null).toBeNull();
    }
    if (p.weight_kg === 0) {
      expect(p.input_mode).toBe("weight_reps");
    }
  }
}

test("MOD-09 reps_only single_set: sin POST inválido; 1 POST reps_only al guardar", async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createMod09RunSession("run");
  console.log("SESSION MOD09", sessionId, name);

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await dismissMobileNavDialog(page);
  await expect(page.getByRole("textbox", { name: "Repeticiones" }).first()).toBeVisible({
    timeout: 60_000,
  });

  await expect(page.getByRole("textbox", { name: "Peso" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Repeticiones" }).first()).toBeVisible();

  const guardar = page.getByRole("button", { name: /^Guardar$/i });
  await typeReps(page, 0, "12");
  await guardar.click();
  await cap.waitForPostCount(1, 45_000);
  assertNoInventedWeight(cap.posts);
  expect(cap.posts[0]?.input_mode).toBe("reps_only");
  expect(cap.posts[0]?.weight_kg ?? null).toBeNull();
  expect(cap.posts[0]?.reps).toBe(12);

  const token = await page.evaluate(() => localStorage.getItem("nexia_token"));
  test.skip(!token, "Sin token atleta");
  const apiBase = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
  const progressResp = await request.get(
    `${apiBase}/athlete/run-context/sessions/${sessionId}/progress`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect(progressResp.ok()).toBeTruthy();
  const body = (await progressResp.json()) as {
    steps?: {
      status?: string;
      input_mode?: string;
      weight_kg?: number | null;
      reps?: number | null;
    }[];
  };
  const saved = body.steps?.find((s) => s.status === "registered");
  expect(saved).toBeTruthy();
  expect(saved?.weight_kg ?? null).toBeNull();
  expect(saved?.reps ?? null).toBe(12);
  expect(cap.posts[0]?.input_mode).toBe("reps_only");

  await skipRestIfVisible(page);
});

test("MOD-09 duration single_set: 1 POST duration; superset reps_only 2 POST", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId } = await createMod09RunSession("run2");

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await dismissMobileNavDialog(page);
  await expect(page.getByRole("textbox", { name: "Repeticiones" }).first()).toBeVisible({
    timeout: 60_000,
  });
  await typeReps(page, 0, "10");
  await page.getByRole("button", { name: /^Guardar$/i }).click();
  await cap.waitForPostCount(1, 45_000);
  await skipRestIfVisible(page);

  const fromDuration = cap.posts.length;
  await dismissMobileNavDialog(page);
  await expect(page.getByRole("textbox", { name: "Tiempo" }).first()).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByRole("textbox", { name: "Peso" })).toHaveCount(0);

  const guardar = page.getByRole("button", { name: /^Guardar$/i });
  const tiempo = page.getByRole("textbox", { name: "Tiempo" }).first();
  await tiempo.click({ clickCount: 3 });
  await tiempo.fill("45");
  await tiempo.blur();
  await guardar.click();
  await cap.waitForPostCount(fromDuration + 1, 45_000);
  const durationPost = cap.posts[fromDuration];
  expect(durationPost?.input_mode).toBe("duration");
  expect(durationPost?.weight_kg ?? null).toBeNull();
  assertNoInventedWeight([durationPost!]);

  await skipRestIfVisible(page);

  const fromSs = cap.posts.length;
  await expect(page.getByRole("heading", { name: /Ronda 1/i })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("textbox", { name: "Peso" })).toHaveCount(0);
  await typeReps(page, 0, "10");
  await typeReps(page, 1, "8");
  await confirmGroupRound(page);
  await cap.waitForPostCount(fromSs + 2, 60_000);
  const ssPosts = cap.posts.slice(fromSs);
  expect(ssPosts).toHaveLength(2);
  for (const p of ssPosts) {
    expect(p.input_mode).toBe("reps_only");
    expect(p.weight_kg ?? null).toBeNull();
  }
  assertNoInventedWeight(ssPosts);
});
