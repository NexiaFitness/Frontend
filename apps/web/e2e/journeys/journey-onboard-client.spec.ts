/**
 * E2E User Journey: Invite client (login → list → invite → pending badge)
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";
import { inviteClientViaUi } from "../fixtures/client-invite";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Journey — Invite client", () => {
  test("login → clients → invite athlete → pending badge in list", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    const data = createMinimalClientData();
    await inviteClientViaUi(page, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      mail: data.mail,
    });

    await page.getByRole("button", { name: /volver a clientes/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/?$/, {
      timeout: 10_000,
    });

    await expect(page.getByText(/pendiente de aceptar/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(data.mail)).toBeVisible();
  });
});
