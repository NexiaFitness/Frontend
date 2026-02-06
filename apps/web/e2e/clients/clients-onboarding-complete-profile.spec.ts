/**
 * E2E Client Management: Modal Complete Profile al añadir cliente
 *
 * Flujo: Login → Clientes → click "Agregar Nuevo Cliente" con perfil trainer incompleto →
 * modal "Completa tu perfil profesional" visible (no navega a onboarding).
 * Assertions: dialog con título "Completa tu perfil profesional", botón "Completar ahora".
 * APIs: getCurrentTrainerProfile (mockeado en test para perfil incompleto).
 * Dependencias: cuenta demo; el test intercepta GET /trainers/profile para simular perfil incompleto.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";

/** Perfil trainer con campos obligatorios vacíos (useCompleteProfileModal considera incompleto). */
const incompleteTrainerProfile = {
  id: 1,
  user_id: 1,
  nombre: "Demo",
  apellidos: "Trainer",
  mail: "nexiafitness.demo@gmail.com",
  telefono: "",
  occupation: "",
  training_modality: "",
  location_country: "",
  location_city: "",
  billing_id: null,
  billing_address: null,
  billing_postal_code: null,
  specialty: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  is_active: true,
};

test.describe("Clients — Onboarding complete profile block", () => {
  test("incomplete trainer profile → Add client → Complete Profile modal appears", async ({
    page,
  }) => {
    await page.route("**/trainers/profile", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ json: incompleteTrainerProfile });
        return;
      }
      await route.continue();
    });

    await loginAsTrainer(page);
    await navigateToClients(page);

    await expect(
      page.getByRole("heading", { name: /clientes/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /agregar nuevo cliente/i }).click();

    const dialog = page.getByRole("dialog", { name: /completa tu perfil profesional/i });
    await expect(dialog).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: /completar ahora/i })
    ).toBeVisible({ timeout: 2_000 });
  });
});
