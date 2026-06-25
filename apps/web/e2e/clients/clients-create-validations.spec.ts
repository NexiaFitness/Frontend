/**
 * E2E Client Management: Validaciones en invitación
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients } from "../fixtures/navigation";
import { openClientInvitePage } from "../fixtures/client-invite";

test.describe("Clients — Invite validations", () => {
  test("submit without required fields stays on invite page", async ({ page }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);
    await openClientInvitePage(page);

    await page.getByRole("button", { name: /enviar invitación/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/clients\/invite/);
    await expect(
      page.getByRole("heading", { name: /invitar atleta/i }),
    ).toBeVisible();
  });
});
