/**
 * E2E User Journey: Create session (client → plan → Session Programming → create session)
 *
 * Flujo: Login → Clientes → onboarding cliente → detalle cliente → tab Entrenamientos →
 * + Nuevo Plan → crear plan (mínimo) → detalle plan (tab Sesiones) → + Nueva Sesión →
 * rellenar sesión (nombre, fecha, tipo) → opcional: agregar ejercicio → Crear Sesión →
 * redirección a plan sesiones o cliente; sesión creada o mensaje éxito.
 *
 * Assertions: URL create-session; tras guardar, redirección y sesión listada o éxito visible.
 * APIs: createClient, createTrainingPlan, createTrainingSession, createSessionExercise.
 *
 * Requisitos: Backend operativo; cuenta demo trainer. Si falla: causa raíz (§3.5 auditoría);
 * si es bug de app, corregir app; no parchear test.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData, createMinimalPlanData } from "../fixtures/test-data";

test.describe("Journey — Create session (client → plan → create session)", () => {
  test("login → client onboarding → plan → create session → session created or listed", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    // 1) Crear cliente (onboarding mínimo)
    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/, {
      timeout: 10_000,
    });

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

    // 2) En Resumen (tab por defecto): sección Planes → Crear plan
    await page
      .getByRole("button", { name: /crear plan/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans\/create\?clientId=\d+/, {
      timeout: 10_000,
    });

    // 3) Crear plan (formulario mínimo)
    const planData = createMinimalPlanData();
    await page
      .getByPlaceholder(/ej: programa de fuerza/i)
      .fill(planData.name);
    await page.getByLabel(/categoría/i).selectOption({ index: 1 });
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    await page
      .getByLabel(/fecha de inicio/i)
      .fill(start.toISOString().slice(0, 10));
    await page
      .getByLabel(/fecha de fin/i)
      .fill(end.toISOString().slice(0, 10));
    await page.getByRole("button", { name: /siguiente/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+/, {
      timeout: 15_000,
    });

    // 4) En detalle del plan (tab Sesiones por defecto) → + Nueva Sesión
    await page
      .getByRole("button", { name: /\+ nueva sesión/i })
      .click();
    await expect(page).toHaveURL(/\/dashboard\/session-programming\/create-session\?planId=\d+/, {
      timeout: 10_000,
    });

    // 5) Rellenar formulario de sesión
    const sessionName = `E2E Sesión ${Date.now()}`;
    await page
      .getByPlaceholder(/ej: entrenamiento de fuerza - piernas/i)
      .fill(sessionName);
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 1);
    await page
      .getByLabel(/fecha de la sesión/i)
      .fill(sessionDate.toISOString().slice(0, 10));
    await page.getByLabel(/tipo de sesión/i).selectOption({ value: "training" });

    // 6) Crear sesión (sin ejercicios para flujo estable)
    await page
      .getByRole("button", { name: /crear sesión/i })
      .click();

    // 7) Redirección: plan (tab sesiones) o cliente (tab workouts)
    await expect(page).not.toHaveURL(/create-session/);
    await expect(page).toHaveURL(
      /\/dashboard\/(training-plans\/\d+|clients\/\d+)/,
      { timeout: 15_000 }
    );
    // Evidencia de éxito: heading único del módulo de sesiones (strict mode)
    await expect(
      page.getByRole("heading", { name: "Sesiones de Entrenamiento" })
    ).toBeVisible({ timeout: 10_000 });
  });
});
