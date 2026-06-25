/**
 * E2E Client Management: Invitar atleta
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";
import { inviteClientViaUi } from "../fixtures/client-invite";
import { createMinimalClientData } from "../fixtures/test-data";

test.describe("Clients — Invite", () => {
  test("can invite a new athlete and see success state", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    const data = createMinimalClientData();
    await inviteClientViaUi(page, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      mail: data.mail,
    });

    await expect(page.getByText(data.mail)).toBeVisible();
  });
});
