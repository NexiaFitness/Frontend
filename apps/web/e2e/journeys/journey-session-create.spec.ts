/**
 * E2E User Journey: Create session (client → modal plan → tab Sesiones → create session)
 *
 * Flujo UX actual (Plan integración flujo planificación):
 * - Login → Clientes → onboarding cliente → detalle cliente (Resumen) →
 * - "Crear plan" abre MODAL (no navega a training-plans/create) →
 * - Rellenar modal (nombre, objetivo, fechas) → Crear plan →
 * - Modal cierra, tab cambia a Planificación, se permanece en clients/:id →
 * - Tab Sesiones → "+ Crear sesión" → clients/:id/sessions/new (elegir día en calendario) →
 * - …/sessions/new/constructor?date= → Rellenar sesión → Crear sesión →
 * - Redirección a clients/:id?tab=sessions (no sale del cliente).
 *
 * Regla: Crear plan y nueva sesión desde cliente NO redirigen a /dashboard/training-plans.
 *
 * Assertions: URL clients/:id durante todo el flujo; tras crear sesión, vuelta a clients/:id?tab=sessions.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Journey — Create session (client → modal plan → create session)", () => {
  test("login → client onboarding → modal crear plan → tab Sesiones → create session → stay in client", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    // 1) Crear cliente (onboarding mínimo)
    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/, {
      timeout: 10_000,
    });

    await expect(
      page.getByRole("heading", { name: /agregar nuevo cliente/i })
    ).toBeVisible({ timeout: 15_000 });

    const clientData = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(clientData.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(clientData.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(clientData.mail);
    await page.getByRole("button", { name: /siguiente/i }).click();
    await expect(
      page.getByRole("button", { name: /crear perfil/i })
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, {
      timeout: 20_000,
    });
    const clientUrlMatch = page.url().match(/\/dashboard\/clients\/(\d+)/);
    const clientId = clientUrlMatch?.[1];
    expect(clientId).toBeTruthy();

    // 2) En Resumen: "Crear plan" abre modal (NO navega a training-plans)
    await page
      .getByRole("button", { name: /crear plan/i })
      .first()
      .click();

    // Modal visible; URL sigue siendo clients/:id
    await expect(page).toHaveURL(new RegExp(`/dashboard/clients/${clientId}`));
    await expect(page).not.toHaveURL(/\/dashboard\/training-plans/);
    await expect(
      page.getByRole("dialog", { name: /crear plan de entrenamiento/i })
    ).toBeVisible({ timeout: 5_000 });

    // 3) Rellenar modal: nombre, objetivo, fechas (scoped to dialog)
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

    // 4) Modal cierra; tab Planificación activo; URL sigue clients/:id
    await expect(page).not.toHaveURL(/\/dashboard\/training-plans/);
    await expect(page).toHaveURL(new RegExp(`/dashboard/clients/${clientId}`));
    await expect(dialog).not.toBeVisible({ timeout: 15_000 });

    // 5) Ir a tab Sesiones → "+ Crear sesión" → clients/:id/sessions/new
    await page
      .getByRole("navigation", { name: /tabs/i })
      .getByRole("button", { name: /sesiones/i })
      .click();
    await page.getByRole("button", { name: /\+ crear sesión/i }).click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/clients/${clientId}/sessions/new`),
      { timeout: 10_000 }
    );

    // Plan activo: paso calendario; elegir hoy (vigente en el plan recién creado) y abrir constructor
    await expect(
      page.getByRole("heading", { name: /elegir día/i })
    ).toBeVisible({ timeout: 10_000 });
    const dayOfMonth = String(new Date().getDate());
    await page.getByRole("button", { name: dayOfMonth }).click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/clients/${clientId}/sessions/new/constructor\\?date=`),
      { timeout: 10_000 }
    );

    // 6) Rellenar formulario de sesión (CreateSession usa placeholder "Ej: Fuerza — Tren superior A")
    const sessionName = `E2E Sesión ${Date.now()}`;
    await page
      .getByPlaceholder(/ej: fuerza/i)
      .fill(sessionName);
    // Fecha: CreateSession usa DatePickerButton (no input); la fecha por defecto (hoy) está dentro del plan recién creado
    await page.getByLabel(/tipo de sesión/i).selectOption({ value: "training" });

    // 7) Crear sesión (sin ejercicios para flujo estable)
    await page.getByRole("button", { name: /crear sesión/i }).click();

    // 8) Si hay avisos de coherencia, pulsar Entendido (sino redirect automático ~1.5s)
    await page.waitForTimeout(2500);
    const entendidoBtn = page.getByRole("button", { name: /entendido/i });
    if (await entendidoBtn.isVisible().catch(() => false)) {
      await entendidoBtn.click();
    }

    // 9) Redirección a clients/:id?tab=sessions (no sale del cliente)
    await expect(page).not.toHaveURL(/create-session/);
    await expect(page).not.toHaveURL(/\/dashboard\/training-plans/);
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/clients/${clientId}(\\?.*tab=sessions)?`),
      { timeout: 15_000 }
    );
    await expect(
      page.getByRole("heading", { name: /sesiones/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
