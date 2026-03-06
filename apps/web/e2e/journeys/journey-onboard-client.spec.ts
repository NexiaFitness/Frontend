/**
 * E2E User Journey: Onboard client (login → list → onboarding → detail)
 *
 * Flujo completo: Login como trainer → Clientes → Agregar Nuevo Cliente →
 * rellenar datos mínimos (PersonalInfo) → Siguiente → Review → Crear Perfil →
 * redirección a detalle del cliente.
 *
 * Assertions: URL /dashboard/clients/:id; heading con nombre del cliente visible.
 * APIs: getTrainerClients/getClientsWithMetrics (lista), createClient (onboarding).
 *
 * Requisitos:
 * - Backend con createClient operativo; cuenta demo con perfil trainer completo.
 * - Wizard actual: paso PersonalInfo + Siguiente lleva a Review; Crear Perfil envía.
 *
 * Si el test falla: documentar causa raíz (auditoría §3.5). Si es bug de app (flujo
 * roto, validación incorrecta, falta accesibilidad), corregir la app; no parchear el test.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Journey — Onboard client", () => {
  test("login → clients → full onboarding (minimal path) → client detail with name", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/, {
      timeout: 10_000,
    });

    const data = createMinimalClientData();
    await page.getByPlaceholder(/ej: juan/i).fill(data.nombre);
    await page.getByPlaceholder(/ej: pérez/i).fill(data.apellidos);
    await page.getByPlaceholder(/ejemplo@correo/i).fill(data.mail);

    await page.getByRole("button", { name: /siguiente/i }).click();

    await expect(
      page.getByRole("button", { name: /crear perfil/i })
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /crear perfil/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/\d+/, {
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: data.nombre })
    ).toBeVisible({ timeout: 10_000 });
  });
});
