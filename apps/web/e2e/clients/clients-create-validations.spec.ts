/**
 * E2E Client Management: Validaciones en onboarding
 *
 * Flujo: Ir a onboarding → Siguiente sin rellenar → (si hay Review) Crear Perfil.
 * Assertions: no se navega a detalle de cliente (validación o error visible, o permanece en onboarding/Review).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToClients, getAddClientFromListButton } from "../fixtures/navigation";

test.describe("Clients — Create validations", () => {
  test("submit without required fields does not create client", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToClients(page);

    await getAddClientFromListButton(page).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/onboarding/);

    await page.getByRole("button", { name: /siguiente/i }).click();

    const onReview = await page
      .getByRole("button", { name: /crear perfil/i })
      .isVisible()
      .catch(() => false);
    if (onReview) {
      await page.getByRole("button", { name: /crear perfil/i }).click();
      await expect(page).not.toHaveURL(/\/dashboard\/clients\/\d+$/, {
        timeout: 8_000,
      });
    } else {
      await expect(
        page.getByText(/obligatorio|requerido|error|inválido/i)
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
