/**
 * E2E Edge: Account page
 *
 * Flujo: Login → Sidebar "Mi cuenta" → página Account con secciones visibles.
 * Assertions: heading "Mi Cuenta", sección Información personal o Seguridad/Zona de peligro.
 * No ejecuta eliminación de cuenta (requiere cuenta dedicada según auditoría).
 *
 * Requisitos: usuario trainer o admin con sesión válida.
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToAccount } from "../fixtures/navigation";

test.describe("Edge — Account page", () => {
  test("account page loads with heading and profile or security section", async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await navigateToAccount(page);

    await expect(
      page.getByRole("heading", { name: /mi cuenta/i })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page
        .getByText(/información personal|seguridad|zona de peligro|cambiar contraseña|eliminar cuenta/i)
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
