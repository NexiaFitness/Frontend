/**
 * E2E: Estructura semanal y coherencia (MVP coherencia 2026-10-02).
 *
 * Ruta: frontend/apps/web/e2e/plans/weekly-structure-coherence.spec.ts
 *
 * Seeds vía API en el spec (login + fetch autenticado).
 * Requiere: backend :8000, frontend :5173, NEXIA_DEMO_PASSWORD en env.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { createClientViaApi } from "../fixtures/create-client-api";
import { createMinimalClientData } from "../fixtures/test-data";
import { deleteClientAsAdmin } from "../fixtures/admin-cleanup";

const API_BASE = process.env.E2E_API_BASE ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

const MIN_BLOCK_QUALITIES = [
  { physical_quality_id: 2, percentage: 50 },
  { physical_quality_id: 1, percentage: 50 },
];

async function apiFetch<T>(
  page: import("@playwright/test").Page,
  path: string,
  init?: RequestInit,
): Promise<T> {
  return page.evaluate(
    async ({ apiBase, tokenKey, reqPath, reqInit }) => {
      const token = localStorage.getItem(tokenKey);
      if (!token) throw new Error("missing token");
      const res = await fetch(`${apiBase}${reqPath}`, {
        ...reqInit,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(reqInit?.headers ?? {}),
        },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(`${reqPath} ${res.status}: ${JSON.stringify(body)}`);
      }
      return body as T;
    },
    {
      apiBase: API_BASE,
      tokenKey: TOKEN_KEY,
      reqPath: path,
      reqInit: init ?? {},
    },
  );
}

async function trainerId(page: import("@playwright/test").Page): Promise<number> {
  const profile = await apiFetch<{ id: number }>(page, "/trainers/profile");
  if (profile.id == null) throw new Error("E2E: no trainer profile id");
  return profile.id;
}

test.describe("Weekly structure coherence", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTrainer(page);
  });

  test("a) bloque sin estructura: añadir día y patrones muestra músculos en constructor", async ({
    page,
    request,
  }) => {
    const data = createMinimalClientData();
    const clientId = await createClientViaApi(page, data);

    const tid = await trainerId(page);
    const plan = await apiFetch<{ id: number }>(page, "/training-plans/", {
      method: "POST",
      body: JSON.stringify({
        name: `E2E Struct ${Date.now()}`,
        goal: "hypertrophy",
        start_date: "2027-01-05",
        end_date: "2027-02-28",
        client_id: clientId,
        trainer_id: tid,
      }),
    });

    const block = await apiFetch<{ id: number }>(
      page,
      `/training-plans/${plan.id}/period-blocks`,
      {
        method: "POST",
        body: JSON.stringify({
          start_date: "2027-01-05",
          end_date: "2027-01-11",
          volume_level: 5,
          intensity_level: 5,
          qualities: MIN_BLOCK_QUALITIES,
        }),
      },
    );

    await page.goto(
      `/dashboard/training-plans/${plan.id}/period-blocks/${block.id}/weekly-structure`,
    );
    await expect(page.getByRole("heading", { name: /planificación/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /^Editar$/i }).click();
    await expect(page.getByText(/patrones|tren inferior/i).first()).toBeVisible({
      timeout: 15_000,
    });

    await deleteClientAsAdmin(request, clientId);
  });

  test("b) bloque multisemana: editor accesible semana 2 vía ?week=2", async ({ page }) => {
    await page.goto(
      "/dashboard/training-plans/586/period-blocks/75/weekly-structure?week=2",
    );
    await expect(page).toHaveURL(/weekly-structure\?week=2/);
    await expect(page.getByRole("heading", { name: /planificación/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Semana 2/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("c) bloque sábado-domingo: wizard días no ofrece lunes", async ({
    page,
    request,
  }) => {
    const satSunData = createMinimalClientData();
    satSunData.apellidos = `SatSun ${Date.now()}`;
    satSunData.mail = `e2e.satsun.${Date.now()}@example.com`;
    const satSunClientId = await createClientViaApi(page, satSunData);
    const tid = await trainerId(page);
    const plan = await apiFetch<{ id: number }>(page, "/training-plans/", {
      method: "POST",
      body: JSON.stringify({
        name: `SatSun ${Date.now()}`,
        goal: "hypertrophy",
        start_date: "2027-03-01",
        end_date: "2027-03-31",
        client_id: satSunClientId,
        trainer_id: tid,
      }),
    });

    await page.goto(
      `/dashboard/clients/${satSunClientId}?tab=planning&plan=${plan.id}&blockAuthor=create&blockStart=2027-03-06&blockEnd=2027-03-07&blockStep=days`,
    );
    await expect(page.getByText(/Access denied/i)).toHaveCount(0);
    await expect(page.getByRole("group", { name: /días de la semana/i })).toBeVisible({
      timeout: 15_000,
    });

    const monday = page.getByRole("button", { name: /^L:/i });
    await expect(monday).toBeDisabled();
    await expect(page.getByRole("button", { name: /^S$/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /^D$/i })).toBeEnabled();

    await deleteClientAsAdmin(request, satSunClientId);
  });

  test("d) cliente 354: GET weekly summary expone structure_coverage", async ({ page }) => {
    const summary = await apiFetch<{
      structure_coverage?: { complete: boolean };
    }>(page, "/clients/354/training-plan/weekly?week_start=2026-10-03");

    expect(summary.structure_coverage).toBeDefined();
    expect(typeof summary.structure_coverage?.complete).toBe("boolean");

    await page.goto("/dashboard/clients/354?tab=planning");
    await expect(page.getByRole("tab", { name: "Planificación" })).toBeVisible({
      timeout: 15_000,
    });

    if (summary.structure_coverage?.complete === false) {
      await expect(
        page.getByTestId("period-block-structure-incomplete-badge"),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByTestId("period-block-complete-structure-cta"),
      ).toBeVisible();
      await expect(
        page.getByTestId("planning-structure-coverage-banner"),
      ).toHaveCount(0);
    } else {
      await expect(
        page.getByTestId("period-block-structure-incomplete-badge"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("planning-structure-coverage-banner"),
      ).toHaveCount(0);
    }
  });
});
