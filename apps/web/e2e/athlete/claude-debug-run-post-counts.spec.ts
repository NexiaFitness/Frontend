/**
 * claude-debug-run-post-counts.spec.ts — Conteo exacto de PETICIONES POST del guiado atleta (tarea 4).
 *
 * Proposito: tests E2E que pueden fallar: cada escenario fija cuantas peticiones POST salen del navegador
 * (no cuantas respuestas llegan) y comprueba que el flujo realmente se ejecuto (un PASS con 0 POST
 * solo se acepta cuando el escenario lo exige y hay evidencia de que la pantalla llego a su estado).
 * Contexto: frontend del worktree en un puerto propio; API simulada en claude-debug-mock-api.ts para no
 * escribir en la BD del backend compartido de la carpeta principal.
 * Notas: ejecutar con
 *   VITE_API_BASE_URL=http://127.0.0.1:59999/api/v1 npx vite --port 5183 --strictPort --host 127.0.0.1
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:5183 npx playwright test e2e/athlete/claude-debug-run-post-counts.spec.ts
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { expect, test, type Page } from "@playwright/test";

import { installApiMock, seedAthleteSession, SESSION_ID, type ApiMock } from "./claude-debug-mock-api";

const EXECUTIONS = "/athlete/run-context/executions";

interface ExecutionBody {
    step_key: string;
    input_mode: string;
    weight_kg?: number | null;
    reps: number | null;
}

const bodies = (api: ApiMock): ExecutionBody[] =>
    api.posts(EXECUTIONS).map((r) => r.body as ExecutionBody);

async function openRun(page: Page) {
    await page.goto(`/dashboard/sessions/${SESSION_ID}/run`);
    await expect(page.getByText(/Paso 1 \/ \d/)).toBeVisible();
}

/** Deja pasar el tiempo suficiente para que una peticion tardia se registre. */
async function settle(page: Page) {
    await page.waitForTimeout(1500);
}

test.describe.configure({ mode: "serial" });

test("registrar una serie: exactamente 1 POST con el peso escrito", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "single" });
    await openRun(page);

    const weight = page.getByRole("spinbutton", { name: /^Peso/i }).or(page.getByLabel(/^Peso/i)).first();
    await weight.fill("60");
    await page.getByRole("button", { name: /^Guardar$/ }).click();
    await expect(page.getByText(/Serie registrada/i)).toBeVisible();
    await settle(page);

    expect(api.posts(EXECUTIONS)).toHaveLength(1);
    expect(bodies(api)[0].weight_kg).toBe(60);
    expect(bodies(api)[0].step_key).toMatch(/^block-10-single-0-/);
    expect(api.unmatched).toEqual([]);
});

test("vaciar un peso: 0 POST al confirmar vacio, 1 POST con 0 kg despues", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "single" });
    await openRun(page);

    const weight = page.getByRole("spinbutton", { name: /^Peso/i }).or(page.getByLabel(/^Peso/i)).first();
    await expect(weight).toHaveValue("20");
    await weight.fill("");
    await expect(weight).toHaveValue("");
    const save = page.getByRole("button", { name: /^Guardar$/ });
    // El CTA no se deshabilita visualmente: el clic es un no-op (isConfirmValid=false).
    await save.click();
    await settle(page);
    expect(api.posts(EXECUTIONS)).toHaveLength(0);
    await expect(page.getByText(/Serie registrada/i)).toHaveCount(0);

    await weight.fill("0");
    await save.click();
    await expect(page.getByText(/Serie registrada/i)).toBeVisible();
    await settle(page);

    expect(api.posts(EXECUTIONS)).toHaveLength(1);
    expect(bodies(api)[0].weight_kg).toBe(0);
});

test("giant set: confirmar la ronda envia exactamente 3 POST, uno por slot", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "giant" });
    await openRun(page);

    await page.getByRole("button", { name: /Empezar descanso/i }).click();
    await page.getByRole("button", { name: /Ronda completada/i }).click();
    await expect(page.getByText(/Ronda registrada/i)).toBeVisible();
    await settle(page);

    const keys = bodies(api).map((b) => b.step_key);
    expect(keys).toHaveLength(3);
    expect(new Set(keys).size).toBe(3);
    expect(keys.every((k) => k.startsWith("block-10-giant_set-1-r1-"))).toBe(true);
});

test("sesion cerrada: 0 POST y redireccion al detalle", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "single", registrationEditable: false });
    await page.goto(`/dashboard/sessions/${SESSION_ID}/run`);

    await expect(page).toHaveURL(new RegExp(`/dashboard/sessions/${SESSION_ID}$`));
    await settle(page);

    const progressFetched = api.requests.some(
        (r) => r.method === "GET" && r.path === `/athlete/run-context/sessions/${SESSION_ID}/progress`
    );
    expect(progressFetched).toBe(true);
    expect(api.requests.filter((r) => r.method === "POST")).toEqual([]);
});

test("offline y reconexion: 0 POST sin red, exactamente 1 POST al reconectar", async ({ page, context }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "single" });
    await openRun(page);

    await context.setOffline(true);
    await expect(page.getByText(/sin conexi[oó]n|offline/i).first()).toBeVisible();
    const weight = page.getByRole("spinbutton", { name: /^Peso/i }).or(page.getByLabel(/^Peso/i)).first();
    await weight.fill("70");
    await page.getByRole("button", { name: /^Guardar$/ }).click();
    await expect(page.getByText(/guardada localmente/i)).toBeVisible();
    await settle(page);
    expect(api.posts(EXECUTIONS)).toHaveLength(0);

    await context.setOffline(false);
    await expect.poll(() => api.posts(EXECUTIONS).length, { timeout: 15_000 }).toBe(1);
    await settle(page);

    expect(api.posts(EXECUTIONS)).toHaveLength(1);
    expect(bodies(api)[0].weight_kg).toBe(70);
});

test("reps_only serie simple (MOD-09): 1 POST sin weight_kg aunque haya actual_weight viejo", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "single_reps_only" });
    await openRun(page);

    await expect(page.getByRole("textbox", { name: /^Peso/i })).toHaveCount(0);
    await page.getByRole("button", { name: /^Guardar$/ }).click();
    await expect(page.getByText(/Serie registrada/i)).toBeVisible();
    await settle(page);

    expect(api.posts(EXECUTIONS)).toHaveLength(1);
    expect(bodies(api)[0].input_mode).toBe("reps_only");
    expect(bodies(api)[0].weight_kg ?? null).toBeNull();
});

test("reps_only superset (S4): 2 POST, ninguno con weight_kg", async ({ page }) => {
    await seedAthleteSession(page);
    const api = await installApiMock(page, { kind: "superset_reps_only" });
    await openRun(page);

    await page.getByRole("button", { name: /Empezar descanso/i }).click();
    await expect(page.getByRole("textbox", { name: /^Peso/i })).toHaveCount(0);
    await page.getByRole("button", { name: /Ronda completada/i }).click();
    await expect(page.getByText(/Ronda registrada/i)).toBeVisible();
    await settle(page);

    const posted = bodies(api);
    expect(posted).toHaveLength(2);
    for (const body of posted) {
        expect(body.input_mode).toBe("reps_only");
        expect(body.weight_kg ?? null).toBeNull();
    }
});
