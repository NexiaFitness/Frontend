/**
 * E2E: Tab Planificación desde cliente (Plan integración flujo planificación UX)
 *
 * Casos:
 * - Cliente sin plan → tab Planificación → estado vacío "Sin plan activo" + CTA "Crear plan" (modal, no navega)
 * - Crear plan desde tab Planificación → modal → plan creado, permanece en clients/:id
 * - Cliente con plan → tab Planificación → baseline/calendario/vista semana visibles
 * - Toggle Vista semana L-D → grid 7 columnas visible
 * - Regla: no redirigir a /dashboard/training-plans
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Planning tab", () => {
  test("tab Planificación sin plan: empty state + Crear plan opens modal, stays in client", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/);

    const data = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(data.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(data.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(data.mail);
    await page.getByRole("button", { name: /siguiente/i }).click();
    await expect(page.getByRole("button", { name: /crear perfil/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 20_000 });
    const clientUrlMatch = page.url().match(/\/dashboard\/clients\/(\d+)/);
    const clientId = clientUrlMatch?.[1];
    expect(clientId).toBeTruthy();

    // Tab Planificación
    await page
      .getByRole("navigation", { name: /tabs/i })
      .getByRole("button", { name: /planificación/i })
      .click();

    await expect(page.getByText(/sin plan activo/i)).toBeVisible({ timeout: 10_000 });
    const crearPlanBtn = page.getByRole("button", { name: /crear plan/i });
    await expect(crearPlanBtn).toBeVisible();
    await crearPlanBtn.scrollIntoViewIfNeeded();

    // Crear plan desde tab Planificación → modal (no navega)
    await crearPlanBtn.click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/clients/${clientId}`));
    await expect(page).not.toHaveURL(/\/dashboard\/training-plans/);
    await expect(
      page.getByRole("dialog", { name: /crear plan de entrenamiento/i })
    ).toBeVisible({ timeout: 5_000 });

    // Rellenar y crear plan (scoped to dialog)
    const dialog = page.getByRole("dialog", { name: /crear plan de entrenamiento/i });
    const planName = `E2E Plan ${Date.now()}`;
    await dialog.getByPlaceholder(/ej: programa de fuerza/i).fill(planName);
    await dialog.getByLabel(/objetivo/i).selectOption({ value: "Muscle Gain" });
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    await dialog.getByLabel(/fecha de inicio/i).fill(start.toISOString().slice(0, 10));
    await dialog.getByLabel(/fecha de fin/i).fill(end.toISOString().slice(0, 10));
    await dialog.getByRole("button", { name: /crear plan/i }).click();

    // Modal cierra; permanece en clients/:id; tab Planificación muestra contenido
    await expect(page).not.toHaveURL(/\/dashboard\/training-plans/);
    await expect(page).toHaveURL(new RegExp(`/dashboard/clients/${clientId}`));
    await expect(dialog).not.toBeVisible({ timeout: 15_000 });

    // Con plan: baseline/calendario o vista semana visible (PlanningTab tarda en cargar)
    await expect(
      page.getByText(/calendario de planificación|baselines mensuales|nuevo baseline mensual|vista semana/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("tab Planificación con plan: toggle Vista semana L-D shows 7-column grid", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/);

    const data = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(data.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(data.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(data.mail);
    await page.getByRole("button", { name: /siguiente/i }).click();
    await expect(page.getByRole("button", { name: /crear perfil/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 20_000 });
    const clientUrlMatch = page.url().match(/\/dashboard\/clients\/(\d+)/);
    const clientId = clientUrlMatch?.[1];
    expect(clientId).toBeTruthy();

    // Crear plan desde Resumen (modal) — scroll si hace falta
    const crearPlanBtn = page.getByRole("button", { name: /crear plan/i }).first();
    await crearPlanBtn.scrollIntoViewIfNeeded();
    await crearPlanBtn.click();
    await expect(
      page.getByRole("dialog", { name: /crear plan de entrenamiento/i })
    ).toBeVisible({ timeout: 5_000 });

    const dialog = page.getByRole("dialog", { name: /crear plan de entrenamiento/i });
    const planName = `E2E Plan ${Date.now()}`;
    await dialog.getByPlaceholder(/ej: programa de fuerza/i).fill(planName);
    await dialog.getByLabel(/objetivo/i).selectOption({ value: "Muscle Gain" });
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    await dialog.getByLabel(/fecha de inicio/i).fill(start.toISOString().slice(0, 10));
    await dialog.getByLabel(/fecha de fin/i).fill(end.toISOString().slice(0, 10));
    await dialog.getByRole("button", { name: /crear plan/i }).click();

    await expect(dialog).not.toBeVisible({ timeout: 15_000 });

    // Tab Planificación (ya activo tras crear plan)
    await expect(
      page.getByText(/calendario de planificación|baselines mensuales|nuevo baseline mensual|vista semana/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Toggle a Vista semana (role="tab" en PlanningTab)
    const weekTab = page.getByRole("tab", { name: /vista semana/i });
    await expect(weekTab).toBeVisible({ timeout: 5_000 });
    await weekTab.click();

    // Grid 7 columnas L-D o mensaje vacío (aria-label puede usar – en-dash o - hyphen)
    const gridOrEmpty = page
      .getByRole("grid", { name: /vista semana L.D/i })
      .or(page.getByText(/no hay datos para esta semana/i));
    await expect(gridOrEmpty).toBeVisible({ timeout: 10_000 });
  });

  test("Nueva sesión desde cliente: tab Sesiones → Crear sesión → clients/:id/sessions/new", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/);

    const data = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(data.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(data.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(data.mail);
    await page.getByRole("button", { name: /siguiente/i }).click();
    await expect(page.getByRole("button", { name: /crear perfil/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, { timeout: 20_000 });
    const clientUrlMatch = page.url().match(/\/dashboard\/clients\/(\d+)/);
    const clientId = clientUrlMatch?.[1];
    expect(clientId).toBeTruthy();

    // Tab Sesiones → "+ Crear sesión"
    await page
      .getByRole("navigation", { name: /tabs/i })
      .getByRole("button", { name: /sesiones/i })
      .click();
    await page.getByRole("button", { name: /\+ crear sesión/i }).click();

    // Ruta clients/:id/sessions/new (no session-programming)
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/clients/${clientId}/sessions/new`),
      { timeout: 10_000 }
    );
    await expect(page).not.toHaveURL(/\/dashboard\/session-programming\//);
  });
});
