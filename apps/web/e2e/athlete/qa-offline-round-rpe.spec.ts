/**
 * qa-offline-round-rpe.spec.ts — RPE de ronda heredado R1 → R2 sin conexión (R-LOG-05).
 *
 * Contexto: regresión de e568679. 1b8c95a filtraba el RPE offline por grupo con un
 * formato de step_key inventado y rechazaba los step_key reales: la ronda 2 nunca
 * heredaba el RPE de la ronda 1 registrada sin conexión. También cubre 5562104 (el
 * reinicio por cambio de paso pisaba el RPE heredado). Este E2E recorre el flujo
 * guiado real: superserie de 2 rondas, sin conexión, R1 con RPE 8, R2 debe mostrar
 * 8 marcado; al reconectar se sincronizan exactamente los 2 POST de R1 con rpe 8.
 *
 * Notas de mantenimiento: sesión desechable «QA-RPE-» en el cliente 346 creada por
 * API. Conteo exacto de peticiones POST /run-context/executions con page.on("request").
 * Requiere backend y frontend de dev y NEXIA_DEMO_PASSWORD / NEXIA_ATHLETE_PASSWORD.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";
import { createSupersetRoundsSession } from "../fixtures/weight-integrity-qa-api";
import {
  attachExecutionRequestCapture,
  confirmGroupRound,
  openRunForSession,
  skipRestIfVisible,
  typePeso,
  typeReps,
} from "./h7-helpers";

test("QA-RPE-R2 offline: la ronda 2 hereda el RPE de la ronda 1 y sincroniza 2 POST", async ({
  page,
  context,
}) => {
  test.setTimeout(240_000);
  const cap = attachExecutionRequestCapture(page);
  const { sessionId, name } = await createSupersetRoundsSession("R2", 2);
  console.log("SESSION RPE", sessionId, name);

  await loginAsAthlete(page);
  await openRunForSession(page, sessionId);
  await expect(page.getByRole("heading", { name: /Ronda 1 de 2/i })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByRole("textbox", { name: "Peso" }).first()).toBeVisible({
    timeout: 45_000,
  });

  await context.setOffline(true);

  await typePeso(page, 0, "30");
  await typeReps(page, 0, "10");
  await typePeso(page, 1, "20");
  await typeReps(page, 1, "12");
  await page
    .getByRole("radiogroup", { name: "RPE esfuerzo percibido" })
    .getByRole("radio", { name: "8", exact: true })
    .click();
  await confirmGroupRound(page);
  expect(cap.posts).toHaveLength(0);

  await skipRestIfVisible(page);
  await expect(page.getByRole("heading", { name: /Ronda 2 de 2/i })).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page
      .getByRole("radiogroup", { name: "RPE esfuerzo percibido" })
      .getByRole("radio", { name: "8", exact: true }),
  ).toHaveAttribute("aria-checked", "true", { timeout: 15_000 });
  expect(cap.posts).toHaveLength(0);

  await context.setOffline(false);
  await cap.waitForPostCount(2, 60_000);
  await page.waitForTimeout(3_000);
  expect(cap.posts).toHaveLength(2);
  console.log(
    "POSTS RPE",
    JSON.stringify(cap.posts.map((p) => ({ step_key: p.step_key, weight_kg: p.weight_kg, rpe: p.rpe }))),
  );
  expect(cap.posts.map((p) => p.rpe)).toEqual([8, 8]);
});
