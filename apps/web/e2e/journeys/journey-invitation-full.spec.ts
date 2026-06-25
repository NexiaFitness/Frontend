/**
 * E2E User Journey: Full invitation flow (UI trainer invite)
 * trainer invites → athlete accepts → onboarding wizard → dashboard
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { inviteClientViaUiAndGetToken } from "../fixtures/client-invite";
import { createMinimalClientData } from "../fixtures/test-data";

const ATHLETE_PASSWORD = "AthletePass123!";

async function completeAthleteOnboarding(page: import("@playwright/test").Page) {
  await expect(page.getByRole("heading", { name: /completa tu perfil/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.locator("select").first().selectOption("Masculino");
  await page.locator('input[type="date"]').fill("1990-06-15");
  await page.getByPlaceholder("Ej: 75.5").fill("75");
  await page.getByPlaceholder("Ej: 175").fill("175");
  await page.getByRole("button", { name: /^siguiente$/i }).click();

  await page
    .locator("select")
    .filter({ hasText: /selecciona un objetivo/i })
    .selectOption("hypertrophy");
  await page.getByRole("button", { name: /^siguiente$/i }).click();

  await page.getByRole("button", { name: /^media$/i }).click();
  await page.getByRole("button", { name: /^siguiente$/i }).click();

  await page.getByRole("button", { name: /confirmar y empezar/i }).click();
}

test.describe("Journey — Full invitation flow", () => {
  test("trainer invites (UI) → athlete accepts → onboarding → dashboard", async ({
    page,
  }) => {
    await loginAsTrainer(page);

    const clientData = createMinimalClientData();
    const invitation = await inviteClientViaUiAndGetToken(page, {
      nombre: clientData.nombre,
      apellidos: clientData.apellidos,
      mail: clientData.mail,
    });

    await page.goto(`/invitation?token=${encodeURIComponent(invitation.token)}`, {
      waitUntil: "networkidle",
    });

    await expect(page.getByRole("heading", { name: /te invita/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByLabel(/^nombre/i).fill(clientData.nombre);
    await page.getByLabel(/^apellidos/i).fill(clientData.apellidos);
    await page.getByLabel(/^contraseña/i).fill(ATHLETE_PASSWORD);
    await page.getByLabel(/confirmar contraseña/i).fill(ATHLETE_PASSWORD);
    await page.getByLabel(/acepto los términos y condiciones/i).check();
    await page.getByRole("button", { name: /aceptar invitación/i }).click();

    await expect(page).toHaveURL(/\/onboarding\/athlete/, { timeout: 25_000 });

    await completeAthleteOnboarding(page);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25_000 });
  });
});
