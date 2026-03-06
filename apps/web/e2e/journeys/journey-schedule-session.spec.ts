/**
 * E2E User Journey: Schedule session (Scheduling → nueva vista → cliente/fecha → crear)
 *
 * Flujo: Login → crear cliente (onboarding mínimo) → Programación → clic en día →
 * navegación a /dashboard/scheduling/new?date=... → seleccionar cliente (por value) →
 * Verificar Disponibilidad → Agendar Sesión → redirección a /dashboard/scheduling.
 *
 * Patrón actual: vistas dedicadas (NewScheduledSessionPage), sin modal.
 * No depende de seed: el cliente se crea en el test y se selecciona por value.
 * APIs: createClient, getScheduledSessions, checkConflict (opc), createScheduledSession.
 *
 * Datos: el test limpia las sesiones del trainer para "mañana" antes de usar el slot
 * (API GET + DELETE), luego usa horario fijo 14:00-15:00. Evita conflicto sin parches de tiempo.
 *
 * Si falla: causa raíz (§3.5 auditoría); si es bug de app, corregir app; no parchear test.
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, navigateToScheduling, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

const TOKEN_KEY = "nexia_token";
const FIXED_START_TIME = "14:00";
const FIXED_END_TIME = "15:00";

/** Fecha en YYYY-MM-DD según zona local (evita desfase con calendario y formulario). */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Base URL del backend; por defecto desarrollo local. En CI/otro host configurar en playwright o env. */
const API_BASE = "http://127.0.0.1:8000/api/v1";

/** Borra todas las sesiones agendadas del trainer actual para la fecha dada. Garantiza slot libre. */
async function clearTrainerSessionsForDate(page: Page, dateStr: string): Promise<void> {
  await page.evaluate(
    async ({ dateStr: d, tokenKey, apiBase }) => {
      const token = localStorage.getItem(tokenKey);
      if (!token) throw new Error("clearTrainerSessionsForDate: no token");

      const profileRes = await fetch(`${apiBase}/trainers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();
      if (profile.detail) throw new Error(String(profile.detail));

      console.log(`[E2E] Trainer ID: ${profile.id}`);

      const sessionsRes = await fetch(
        `${apiBase}/scheduling/sessions?trainer_id=${profile.id}&start_date=${d}&end_date=${d}&limit=500`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sessions = await sessionsRes.json();
      if (!Array.isArray(sessions)) throw new Error("clearTrainerSessionsForDate: invalid sessions response");

      console.log(`[E2E] Sesiones encontradas para ${d}: ${sessions.length}`);
      console.log(
        `[E2E] Sesiones:`,
        sessions.map((s) => ({ id: s.id, client_id: s.client_id, start_time: s.start_time }))
      );

      for (const s of sessions) {
        const delRes = await fetch(`${apiBase}/scheduling/sessions/${s.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`[E2E] DELETE session ${s.id}: ${delRes.status}`);
      }
    },
    { dateStr, tokenKey: TOKEN_KEY, apiBase: API_BASE }
  );
}

test.describe("Journey — Schedule session (scheduling → create scheduled session)", () => {
  test("login → create client → scheduling → click day → new page → select client → agendar → back to calendar", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    page.on("console", (msg) => {
      if (msg.text().startsWith("[E2E]")) {
        console.log(msg.text());
      }
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatLocalDate(tomorrow);
    await clearTrainerSessionsForDate(page, tomorrowStr);

    // 1) Crear cliente (onboarding mínimo) para no depender de seed
    await navigateToClients(page);
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
    const clientId = parseInt(
      page.url().replace(/.*\/dashboard\/clients\/(\d+).*/, "$1"),
      10
    );
    expect(clientId).toBeGreaterThan(0);

    // 2) Ir a Programación y abrir vista nueva (clic en día de mañana)
    await navigateToScheduling(page);
    await expect(
      page.getByRole("heading", { name: "Programación de Sesiones" })
    ).toBeVisible({ timeout: 10_000 });

    const dayNum = tomorrow.getDate();
    await page
      .getByTestId("scheduling-calendar")
      .getByText(String(dayNum), { exact: true })
      .click();

    // Navegación a vista dedicada (no modal)
    await expect(page).toHaveURL(/\/dashboard\/scheduling\/new\?date=/, {
      timeout: 10_000,
    });
    await expect(
      page.getByRole("heading", { name: /nueva sesión agendada/i })
    ).toBeVisible({ timeout: 10_000 });

    // Buscar cliente por identificador único del test (email) para ser determinista
    // con muchos clientes E2E en DB (evita que el recién creado quede fuera de page_size=30)
    const searchTerm = clientData.mail;
    const clientSelect = page.locator("#new-schedule-client");
    const searchResponsePromise = page.waitForResponse(
      (resp) => {
        const url = resp.url();
        return (
          url.includes("/trainers/") &&
          url.includes("/clients") &&
          url.includes(`search=${encodeURIComponent(searchTerm)}`) &&
          resp.status() === 200
        );
      },
      { timeout: 20_000 }
    );
    await page.locator("#new-schedule-client-search").fill(searchTerm);
    await searchResponsePromise;

    await expect(
      clientSelect.locator(`option[value="${clientId}"]`)
    ).toBeAttached({ timeout: 10_000 });
    await clientSelect.selectOption({ value: String(clientId) });

    // Fuerza la misma fecha que se limpió (evita desfase por timezone entre calendario y clear)
    await page.getByLabel(/fecha/i).fill(tomorrowStr);
    await page.getByLabel(/hora de inicio/i).fill(FIXED_START_TIME);
    await page.getByLabel(/hora de fin/i).fill(FIXED_END_TIME);

    await page
      .getByRole("button", { name: /verificar disponibilidad/i })
      .click();

    const availabilityResult = page.getByText(/horario disponible|conflicto detectado/i);
    await expect(availabilityResult).toBeVisible({ timeout: 8_000 });

    const resultText = await availabilityResult.textContent();
    if (resultText?.toLowerCase().includes("conflicto")) {
      throw new Error(
        "checkConflict detectó conflicto incluso después de clearTrainerSessionsForDate. " +
          "Causa probable: datos sucios en BD (sesión con scheduled_date NULL, o conflicto por client_id). " +
          "Limpiar BD manualmente o verificar endpoint GET /scheduling/sessions vs checkConflict."
      );
    }

    await page.getByRole("button", { name: /agendar sesión/i }).click();

    const errorAlert = page.getByRole("alert");
    try {
      await expect(page).toHaveURL(/\/dashboard\/scheduling$/, { timeout: 5_000 });
    } catch {
      const isErrorVisible = await errorAlert.isVisible().catch(() => false);
      if (isErrorVisible) {
        const errorText = await errorAlert.textContent();
        throw new Error(`Backend error: ${errorText}`);
      } else {
        throw new Error("No redirigió ni mostró error");
      }
    }
    await expect(page).not.toHaveURL(/\/dashboard\/scheduling\/new/);
    await expect(
      page.getByRole("heading", { name: "Programación de Sesiones" })
    ).toBeVisible({ timeout: 5_000 });
  });
});
